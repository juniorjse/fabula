import { sdk } from "../sdk.js";

// Utility function for safe file operations
async function safeFileOperation(filepath, operation) {
  try {
    const exists = await sdk.fs.exists(filepath);
    if (!exists) {
      console.warn(`File does not exist: ${filepath}`);
      return;
    }
    await operation();
  } catch (error) {
    if (error.message.includes("NoSuchKey")) {
      console.warn(`NoSuchKey error for file: ${filepath}`);
    } else {
      console.error(`Error during file operation: ${error.message}`);
    }
  }
}

window.CreatePage = {
  template: `
    <div class="min-h-screen bg-neutral-light pb-16">
      <!-- Background pattern -->
      <div class="absolute inset-0 z-0">
        <img src="/assets/image/background.jpg" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-15" />
      </div>
      
      <!-- Navigation Header -->
      <nav class="relative z-10 py-3 px-4 sm:px-6 mb-4">
        <div class="flex justify-between items-center">
          <!-- Back button with rustic style -->
          <button @click="$router.push('/')" class="flex items-center gap-1 py-2 px-4 bg-neutral hover:bg-neutral-dark btn-rustic text-secondary-dark font-heading font-medium text-sm shadow-md transition-all duration-200">
            <i class="fas fa-arrow-left mr-1"></i> Voltar
          </button>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 pt-4 relative z-10">
        <!-- Form Content - Only shown when not generating story -->
        <div v-if="screen === 'form'" class="bg-neutral-light/80 rounded-lg p-8 shadow-lg border border-neutral-dark card-rustic">
          <div class="mb-8 text-center">
            <h1 class="font-heading font-bold text-3xl text-secondary-dark mb-2">Criar Uma História</h1>
            <p class="text-black font-body">Personalize a história com o nome do seu filho e suas preferências</p>
          </div>
          
          <!-- Input Form -->
          <div class="space-y-8">
            <!-- Child's Name Input -->
            <div class="form-group">
              <label for="childName" class="block font-heading font-bold text-lg text-secondary-dark mb-2">Nome da Criança</label>
              <input 
                type="text" 
                id="childName" 
                v-model="childName" 
                class="w-full p-3 bg-neutral-light border border-neutral-dark rounded-md font-body focus:border-primary focus:outline-none"
                placeholder="Digite o nome da criança" 
              />
            </div>
            
            <!-- Brazilian Fauna Selection -->
            <div class="form-group">
              <label class="block font-heading font-bold text-lg text-secondary-dark mb-2">Elemento da Cultura Baiana</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="animal in brazilianAnimals" :key="animal.id" 
                     @click="selectAnimal(animal)"
                     :class="[
                       'bg-neutral-light/90 p-3 rounded-md border cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center text-center gap-2',
                       selectedAnimal && selectedAnimal.id === animal.id ? 'border-primary shadow-md' : 'border-neutral-dark'
                     ]">
                  <div class="w-16 h-16 flex items-center justify-center text-primary">
                    <i :class="animal.icon" class="text-3xl"></i>
                  </div>
                  <span class="font-heading font-bold text-sm text-secondary-dark">{{ animal.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Story Location Selection -->
            <div class="form-group">
              <label class="block font-heading font-bold text-lg text-secondary-dark mb-2">Onde a História Acontece?</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="location in storyLocations" :key="location.id" 
                     @click="selectLocation(location)"
                     :class="[
                       'bg-neutral-light/90 p-3 rounded-md border cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center text-center gap-2',
                       selectedLocation && selectedLocation.id === location.id ? 'border-primary shadow-md' : 'border-neutral-dark'
                     ]">
                  <div class="w-16 h-16 flex items-center justify-center text-tertiary">
                    <i :class="location.icon" class="text-3xl"></i>
                  </div>
                  <span class="font-heading font-bold text-sm text-secondary-dark">{{ location.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Create Story Button -->
            <div class="mt-8">
              <button 
                @click="generateStory" 
                :disabled="!canGenerateStory"
                :class="['w-full py-4 font-heading font-bold text-xl transition-all btn-rustic', 
                  canGenerateStory ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-neutral text-neutral-dark cursor-not-allowed']">
                Criar História
              </button>
              <p v-if="!canGenerateStory" class="text-center text-primary-dark mt-2 font-body text-sm">
                Por favor, preencha todos os campos para continuar
              </p>
            </div>
          </div>
        </div>
        
        <!-- Loading Screen - Shown when generating story -->
        <div v-if="screen === 'generating'" class="bg-neutral-light/80 rounded-lg p-8 shadow-lg border border-neutral-dark text-center card-rustic">
          <div class="mb-8">
            <div class="w-24 h-24 mx-auto mb-4 relative overflow-hidden rounded-full">
              <div class="absolute inset-0 rounded-full bg-primary/20 animate-pulse duration-1000"></div>
              <div class="absolute inset-4 rounded-full bg-primary/40 animate-pulse duration-2000"></div>
              <i class="fas fa-feather-alt text-primary text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
            </div>
            <h2 class="font-heading font-bold text-2xl text-secondary-dark">Criando Sua História...</h2>
          </div>
          
          <!-- Progress Status -->
          <div class="max-w-md mx-auto">
            <div class="grid grid-cols-1 gap-4">
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.plot === 'done' ? 'bg-primary text-white' : 
                  taskStatus.plot === 'processing' ? 'bg-primary-light text-white animate-pulse' : 
                  'bg-neutral text-neutral-dark']">
                  <i :class="[
                    taskStatus.plot === 'done' ? 'fas fa-check' : 
                    taskStatus.plot === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-black">Criando Enredo</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.story === 'done' ? 'bg-primary text-white' : 
                  taskStatus.story === 'processing' ? 'bg-primary-light text-white animate-pulse' : 
                  'bg-neutral text-neutral-dark']">
                  <i :class="[
                    taskStatus.story === 'done' ? 'fas fa-check' : 
                    taskStatus.story === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-black">Escrevendo História</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.image === 'done' ? 'bg-primary text-white' : 
                  taskStatus.image === 'processing' ? 'bg-primary-light text-white animate-pulse' : 
                  'bg-neutral text-neutral-dark']">
                  <i :class="[
                    taskStatus.image === 'done' ? 'fas fa-check' : 
                    taskStatus.image === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-black">Criando Ilustração</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.audio === 'done' ? 'bg-primary text-white' : 
                  taskStatus.audio === 'processing' ? 'bg-primary-light text-white animate-pulse' : 
                  'bg-neutral text-neutral-dark']">
                  <i :class="[
                    taskStatus.audio === 'done' ? 'fas fa-check' : 
                    taskStatus.audio === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-black">Gerando Narração</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Story Result Screen -->
        <div v-if="screen === 'result'" class="relative">
          <!-- Story Container -->
          <div class="bg-neutral-light/90 rounded-lg p-8 shadow-lg border border-neutral-dark relative overflow-hidden card-rustic">
            <div class="flex flex-col gap-8">
              <!-- Story Header -->
              <div class="flex flex-col items-center">
                <!-- Story Image with Book Texture -->
                <div v-if="storyImage" class="relative w-full max-w-xs aspect-square rounded-lg mb-6 overflow-hidden shadow-lg">
                  <img :src="storyImage" alt="Story Illustration" class="w-full h-full object-cover absolute inset-0" @error="handleImageError" />
                  <div class="absolute inset-0 bg-[url('/assets/image/book-texture.svg')] bg-cover bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"></div>
                </div>
                <div v-else class="w-full max-w-xs rounded-lg shadow-md border border-neutral-dark aspect-square bg-tertiary-light flex items-center justify-center mb-6">
                  <i class="fas fa-book-open text-5xl text-secondary"></i>
                </div>
                
                <!-- Story Title -->
                <div class="text-center w-full">
                  <h1 class="font-heading font-bold text-2xl text-secondary-dark mb-4">{{ storyData?.title || 'Uma História Encantadora' }}</h1>
                </div>
              </div>
              
              <!-- Audio Player (show only if audio is available) -->
              <div v-if="audioSource" class="flex flex-col gap-2 mb-6">
                <!-- Progress Bar -->
                <div class="w-full relative">
                  <div class="w-full h-1 bg-neutral-dark rounded-full cursor-pointer" @click="seekAudio">
                    <div class="h-1 bg-primary rounded-full" :style="{ width: audioProgress + '%' }"></div>
                  </div>
                </div>
                
                <!-- Time Display -->
                <div class="flex justify-between w-full">
                  <span class="text-xs text-black">{{ formatTime(audioCurrentTime) }}</span>
                  <span class="text-xs text-black">{{ formatTime(audioDuration) }}</span>
                </div>
                
                <!-- Controls -->
                <div class="flex justify-center items-center gap-4 mt-4">
                  <button @click="downloadAudio" class="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <i class="fas fa-download text-white"></i>
                  </button>
                  <button @click="toggleAudio" :disabled="audioLoading" class="w-16 h-16 rounded-full bg-primary border border-primary-light shadow-md flex items-center justify-center p-4 relative">
                    <i v-if="!audioLoading" :class="['fas', isPlaying ? 'fa-pause' : 'fa-play', 'text-white text-xl']"></i>
                    <!-- Loading spinner when audio is preparing -->
                    <div v-if="audioLoading" class="absolute inset-0 flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  </button>
                  <button @click="shareStory" class="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center">
                    <i class="fas fa-share-alt text-white"></i>
                  </button>
                </div>
                
                <!-- Audio loading message -->
                <div v-if="audioLoading" class="text-center text-xs text-black font-medium mt-2">
                  Preparando áudio... por favor aguarde
                </div>
              </div>
              
              <!-- Story Text com espaçamento superior -->
              <div class="prose prose-sm md:prose-base text-black font-body mt-8 max-w-full">
                <div v-html="formattedStory" class="text-black space-y-4 px-2"></div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mt-6">
                <button @click="goBack" class="btn-rustic bg-primary hover:bg-primary-dark text-white font-heading font-bold py-3 px-6 flex-1 flex items-center justify-center gap-2">
                  <i class="fas fa-plus"></i> Criar Nova História
                </button>
                <router-link to="/my-stories" class="btn-rustic bg-secondary hover:bg-secondary-dark text-white font-heading font-bold py-3 px-6 flex items-center justify-center gap-2">
                  <i class="fas fa-book"></i> Minhas Histórias
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Hidden Audio Element -->
          <audio 
            ref="audioPlayer" 
            preload="auto"
            crossorigin="anonymous"
            @loadedmetadata="onAudioLoaded" 
            @timeupdate="updateAudioProgress" 
            @ended="onAudioEnded">
            <source :src="audioSource" type="audio/mp3">
            <source :src="audioSource" type="audio/mpeg">
            <source :src="audioSource" type="audio/wav">
            Your browser does not support the audio element.
          </audio>
        </div>
      </main>
      
      <style>
        .duration-1000 {
          animation-duration: 3s !important;
        }
        .duration-1500 {
          animation-duration: 3.5s !important;
        }
        .duration-2000 {
          animation-duration: 4s !important;
        }
      </style>
    </div>
  `,
  data() {
    return {
      screen: "form",
      childName: "",
      selectedAnimal: null,
      selectedLocation: null,
      storyData: null,
      storyImage: null,
      audioSource: null,
      audioLoading: false,
      isPlaying: false,
      audioProgress: 0,
      audioDuration: 0,
      audioCurrentTime: 0,
      audioCheckInterval: null,
      taskStatus: {
        plot: "waiting",
        story: "waiting",
        image: "waiting",
        audio: "waiting"
      },
      streamingText: "",
      formattedStory: "",
      
      // Brazilian Fauna Options with Font Awesome icons instead of images
      brazilianAnimals: [
        {
          id: 1,
          name: "Caxixi",
          icon: "fas fa-drum"
        },
        {
          id: 2,
          name: "Saveiro",
          icon: "fas fa-ship"
        },
        {
          id: 3,
          name: "Olaria",
          icon: "fas fa-hands"
        },
        {
          id: 4,
          name: "Guará",
          icon: "fas fa-feather-alt"
        },
        {
          id: 5,
          name: "Samba de Roda",
          icon: "fas fa-music"
        },
        {
          id: 6,
          name: "Cerâmica",
          icon: "fas fa-paint-brush"
        }
      ],
      
      // Story Locations with Font Awesome icons instead of images
      storyLocations: [
        {
          id: 1,
          name: "Maragogipinho",
          icon: "fas fa-home"
        },
        {
          id: 2,
          name: "Jaguaripe",
          icon: "fas fa-map-marker-alt"
        },
        {
          id: 3,
          name: "Rio",
          icon: "fas fa-water"
        },
        {
          id: 4,
          name: "Mangue",
          icon: "fas fa-tree"
        },
        {
          id: 5,
          name: "Em Cima do Saveiro",
          icon: "fas fa-anchor"
        },
        {
          id: 6,
          name: "Beira do Rio",
          icon: "fas fa-umbrella-beach"
        }
      ]
    };
  },
  computed: {
    canGenerateStory() {
      return this.childName.trim() !== "" && this.selectedAnimal !== null && this.selectedLocation !== null;
    }
  },
  mounted() {
    // Simplified initialization for POC
    console.log("CreatePage mounted for POC");
  },
  methods: {
    selectAnimal(animal) {
      this.selectedAnimal = animal;
    },
    
    selectLocation(location) {
      this.selectedLocation = location;
    },
    
    async generateStory() {
      if (!this.canGenerateStory) {
        alert("Por favor, preencha todos os campos para continuar");
        return;
      }

      // Change to generating screen
      this.screen = "generating";
      
      try {
        // Start plot generation
        this.taskStatus.plot = "processing";
        
        // Create the story title and plot first
        const storyTitle = `${this.childName} e o ${this.selectedAnimal.name} de ${this.selectedLocation.name}`;
        const storyPlot = this.generateMockStory();
        
        // Create a story object with title and plot
        const storyObject = {
          title: storyTitle,
          plot: storyPlot
        };
        
        setTimeout(() => {
        this.taskStatus.plot = "done";
          this.taskStatus.story = "processing";
          
          // Set story data
        this.storyData = {
            title: storyObject.title,
            content: storyObject.plot
          };
          
          // Format the story text
          this.formattedStory = this.formatStoryText(this.storyData.content);
          
          setTimeout(async () => {
            this.taskStatus.story = "done";
            this.taskStatus.image = "processing";
            
            // Generate image using AI
            try {
              // Create image prompt from translation
              const imagePrompt = `Create a hand-drawn, rustic illustration for a children's story titled "${storyObject.title}". 
IMPORTANT DETAILS:
- If the story mentions "Guará", it's referring to the Brazilian RED BIRD (Guará vermelho/Eudocimus ruber), NOT a wolf or dog
- The child named "${this.childName}" must be depicted as a ${this.childName.toLowerCase().includes('a') && !['junior', 'jr'].includes(this.childName.toLowerCase()) ? 'girl' : 'boy'}
- The style should resemble a hand-drawn children's book illustration with visible pencil/crayon strokes
- Use a warm color palette with earthy tones like browns, soft reds, and yellows
- The scene should show the main character interacting with elements of Brazilian riverside culture from ${this.selectedLocation.name}
- Include visual elements of artisanal crafts, clay pottery, and traditional Brazilian riverside themes`;
              
              console.log("Starting image generation with prompt:", imagePrompt);
              
              // Generate the image using SDK
              const imageResult = await sdk.ai.generateImage({
                model: "replicate:recraft-ai/recraft-v3",
                prompt: imagePrompt,
                providerOptions: {
                  replicate: {
                    size: "1024x1024",
                    style: "digital_illustration/2d_art_poster",
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    prompt: imagePrompt
                  }
                }
              });
              
              console.log("🔍 Image generation FULL result:", JSON.stringify(imageResult));
              
              // Process the response
              if (imageResult && imageResult.images && imageResult.images.length > 0) {
                // Use the image URL from the response
                const replicateUrl = imageResult.images[0];
                console.log("🖼️ Using direct image URL from images array:", replicateUrl);
                
                // PRIMEIRO obter o base64 como backup e principal formato
                try {
                  console.log("📥 Obtendo base64 da imagem do Replicate...");
                  const imageData = await this.downloadAndSaveImage(replicateUrl, null);
                  if (imageData) {
                    this.storyData.imageBase64 = imageData;
                    // Usar base64 como fonte primária para evitar problemas de CORS
                    this.storyImage = imageData;
                    console.log("💾 Usando base64 como fonte primária da imagem");
                    
                    // Calcular e logar o tamanho do base64
                    const base64Size = Math.round((imageData.length * 3) / 4);
                    console.log(`📊 Tamanho da imagem base64: ${this.formatFileSize(base64Size)}`);
                    console.log(`🔍 Primeiros 100 caracteres do base64: ${imageData.substring(0, 100)}...`);
                    console.log(`🔍 Últimos 50 caracteres do base64: ...${imageData.substring(imageData.length - 50)}`);
                    
                    // Análise detalhada do base64
                    this.analyzeBase64Image(imageData);
                  }
                } catch (baseError) {
                  console.warn("⚠️ Não foi possível obter o base64 da imagem:", baseError);
                }
                
                // Se o Replicate já salvou a imagem no filesystem (verificando filepath)
                if (imageResult.filepath) {
                  const fsPath = imageResult.filepath;
                  console.log("📁 Replicate já salvou a imagem no filesystem:", fsPath);
                  
                  // Construir URL completo (apenas como fallback)
                  const baseUrl = "https://fs.webdraw.com";
                  const fsUrl = `${baseUrl}${fsPath.startsWith('/') ? '' : '/'}${fsPath}`;
                  console.log("🔗 URL do filesystem (fallback):", fsUrl);
                  
                  // Apenas definir permissões públicas para o arquivo
                  try {
                    await this.setFileAccess(fsPath);
                    console.log("🔐 Definidas permissões públicas para:", fsPath);
                  } catch (permError) {
                    console.warn("⚠️ Erro ao definir permissões:", permError);
                  }
                  
                  // Usar a URL do filesystem apenas se ainda não tivermos base64
                  if (!this.storyData.imageBase64) {
                    this.storyImage = fsUrl;
                    console.log("⚠️ Usando URL do filesystem por falta de base64");
                  }
                }
                // Se não tiver filepath nem base64, fazer download e salvar
                else if (!this.storyData.imageBase64 && replicateUrl.includes('replicate.delivery')) {
                  try {
                    console.log("📥 Detectada URL do Replicate, iniciando download da imagem...");
                    
                    // Definir um nome de arquivo para a imagem
                    const filename = `story_${Date.now()}.webp`;
                    const picturePath = `~/Pictures/${filename}`;
                    
                    // Download e salvar a imagem
                    const imageData = await this.downloadAndSaveImage(replicateUrl, picturePath);
                    
                    if (imageData) {
                      // Usar base64 como fonte primária para evitar problemas de CORS
                      this.storyImage = imageData;
                      this.storyData.imageBase64 = imageData;
                      console.log("✅ Imagem baixada e salva com sucesso como base64");
                      console.log("💾 URL de backup no filesystem:", `https://fs.webdraw.com${picturePath.replace('~', '')}`);
                    } else {
                      // Fallback para URL original do Replicate se falhar
                      this.storyImage = replicateUrl;
                      console.log("⚠️ Falha ao salvar imagem localmente, usando URL original");
                    }
        } catch (error) {
                    console.error("❌ Erro ao baixar imagem do Replicate:", error);
                    this.storyImage = replicateUrl; // Usar URL original como fallback
                  }
                } else if (!this.storyData.imageBase64) {
                  this.storyImage = replicateUrl;
                }
              } else if (imageResult && imageResult.url) {
                const replicateUrl = imageResult.url;
                console.log("🖼️ Using fallback URL:", replicateUrl);
                
                // Se o Replicate já salvou a imagem no filesystem (verificando filepath)
                if (imageResult.filepath) {
                  const fsPath = imageResult.filepath;
                  console.log("📁 Replicate já salvou a imagem no filesystem:", fsPath);
                  
                  // Construir URL completo
                  const baseUrl = "https://fs.webdraw.com";
                  this.storyImage = `${baseUrl}${fsPath.startsWith('/') ? '' : '/'}${fsPath}`;
                  console.log("🔗 Usando URL do filesystem:", this.storyImage);
                  
                  // Definir permissões públicas para o arquivo
                  try {
                    await this.setFileAccess(fsPath);
                    console.log("🔐 Definidas permissões públicas para:", fsPath);
                  } catch (permError) {
                    console.warn("⚠️ Erro ao definir permissões:", permError);
                  }
                  
                  // Ainda assim, obter o base64 como backup
                  try {
                    const imageData = await this.downloadAndSaveImage(replicateUrl, null);
                    if (imageData) {
                      this.storyData.imageBase64 = imageData;
                      console.log("💾 Obtido base64 como backup para a imagem");
                    }
                  } catch (error) {
                    console.warn("⚠️ Não foi possível obter o base64 da imagem:", error);
                  }
                }
                // Se não tiver filepath, fazer download e salvar
                else if (replicateUrl.includes('replicate.delivery')) {
                  try {
                    console.log("📥 Detectada URL do Replicate, iniciando download da imagem...");
                    
                    // Definir um nome de arquivo para a imagem
                    const filename = `story_${Date.now()}.webp`;
                    const picturePath = `~/Pictures/${filename}`;
                    
                    // Download e salvar a imagem
                    const imageData = await this.downloadAndSaveImage(replicateUrl, picturePath);
                    
                    if (imageData) {
                      // Usar base64 como fonte primária para evitar problemas de CORS
                      this.storyImage = imageData;
                      this.storyData.imageBase64 = imageData;
                      console.log("✅ Imagem baixada e salva com sucesso como base64");
                      console.log("💾 URL de backup no filesystem:", `https://fs.webdraw.com${picturePath.replace('~', '')}`);
            } else {
                      // Fallback para URL original do Replicate se falhar
                      this.storyImage = replicateUrl;
                      console.log("⚠️ Falha ao salvar imagem localmente, usando URL original");
                    }
                  } catch (error) {
                    console.error("❌ Erro ao baixar imagem do Replicate:", error);
                    this.storyImage = replicateUrl; // Usar URL original como fallback
                  }
          } else {
                  this.storyImage = replicateUrl;
                }
              } else if (imageResult && imageResult.filepath) {
                // Use filepath if available
                const baseUrl = "https://fs.webdraw.com";
                this.storyImage = `${baseUrl}${imageResult.filepath.startsWith('/') ? '' : '/'}${imageResult.filepath}`;
                console.log("🖼️ Using constructed filepath URL:", this.storyImage);
                console.log("📁 Original filepath from response:", imageResult.filepath);
              } else {
                // Use fallback image
                this.storyImage = this.getRandomFallbackImage();
                console.log("⚠️ No valid image result found, using fallback image:", this.storyImage);
              }
            } catch (error) {
              console.error("Error generating image:", error);
              // Use fallback image
              this.storyImage = this.getRandomFallbackImage();
        }

        this.taskStatus.image = "done";

            // Start audio generation
            this.taskStatus.audio = "processing";
            
            try {
        console.log("Starting audio generation...");
        
              // Prepare the audio text - start with the title followed by the story
              const audioText = `${storyObject.title}. ${storyObject.plot}`;
        
        console.log(`Audio text length: ${audioText.length} characters`);

              // Generate audio using the SDK
        const audioResponse = await sdk.ai.generateAudio({
          model: "elevenlabs:tts",
          prompt: audioText,
          providerOptions: {
            elevenLabs: {
                    voiceId: "IKne3meq5aSn9XLyUdCD", // Uncle Joe voice
              model_id: "eleven_turbo_v2_5",
              optimize_streaming_latency: 0,
                    output_format: "mp3", // Specify MP3 format explicitly
              voice_settings: {
                speed: 1.0,
                similarity_boost: 0.85,
                stability: 0.75,
                style: 0,
              },
            },
          },
        });

              console.log("Audio generation response:", audioResponse);
              
              // Process the audio response
        let audioPath = null;

        if (audioResponse.filepath && audioResponse.filepath.length > 0) {
          audioPath = audioResponse.filepath[0];
        } else if (audioResponse.audios && audioResponse.audios.length > 0) {
          audioPath = audioResponse.audios[0];
        } else if (audioResponse.url) {
          audioPath = audioResponse.url;
              } else if (audioResponse.audio && typeof audioResponse.audio === 'string') {
                // Handle base64 encoded audio
                audioPath = `data:audio/mp3;base64,${audioResponse.audio}`;
        }

              // Set the audio source
        let fullAudioUrl = null;
        if (audioPath) {
          if (!audioPath.startsWith('http') && !audioPath.startsWith('data:')) {
            fullAudioUrl = `https://fs.webdraw.com${audioPath.startsWith('/') ? '' : '/'}${audioPath}`;
          } else {
            fullAudioUrl = audioPath;
          }
                console.log("Final audio source:", fullAudioUrl);

          // Set permissions for the audio file immediately
          try {
                  if (!audioPath.startsWith('data:')) {
            await this.setFilePermissions(audioPath);
            console.log("Set permissions for audio file:", audioPath);
                  }
          } catch (permError) {
            console.warn("Error setting permissions for audio file:", permError);
          }

          // Set audio source immediately but mark as loading
          this.audioSource = fullAudioUrl;
          this.audioLoading = true;

                // Wait a bit to allow the file to be processed
          await new Promise(resolve => setTimeout(resolve, 4000));

                // Only perform additional checks for network URLs, not data URLs
                if (!fullAudioUrl.startsWith('data:')) {
          const isAudioReady = await this.checkAudioReady(fullAudioUrl, 2, 3000);

          if (isAudioReady) {
            console.log("Audio file is confirmed ready");
            this.audioLoading = false;
                    this.taskStatus.audio = "done";
          } else {
            console.log("Audio file not immediately available, will continue checking in background");
                    // Mark as done but continue checking in background
                    this.taskStatus.audio = "done";
            // Start background checking
            this.startBackgroundAudioCheck(fullAudioUrl);
          }
                } else {
                  // For data URLs, we're ready immediately
                  this.audioLoading = false;
                  this.taskStatus.audio = "done";
                }
              } else {
                console.warn("Audio was generated but the source format is not recognized.");
                this.taskStatus.audio = "error";
              }
            } catch (audioError) {
              console.error("Error generating audio:", audioError);
              this.taskStatus.audio = "error";
            }

            // Change to result screen
            this.updateScreen("result");
          }, 4000); // 4 seconds for story generation
        }, 2000); // 2 seconds for plot generation
      } catch (error) {
        console.error("Error generating story:", error);
        alert("Houve um erro ao gerar sua história. Por favor, tente novamente.");
        this.screen = "form";
      }
    },
    
    formatStoryText(text) {
      if (!text) return "";
      
      // Split by paragraphs and wrap in <p> tags with improved styling
      const paragraphs = text.split("\n\n");
      return paragraphs.map(p => {
        // Add special styling for dialogue (text starting with quotes)
        const formattedText = p.replace(/("[^"]+?")/g, '<span class="text-secondary-dark font-medium italic">$1</span>');
        
        // Add proper line breaks
        return `<p class="mb-6 leading-relaxed">${formattedText.replace(/\n/g, '<br>')}</p>`;
      }).join("");
    },
    
    generateMockStory() {
      // Detect gender based on name - if it ends with 'a' and isn't junior/jr, treat as female
      const isFemale = this.childName.toLowerCase().endsWith('a') && 
                      !['junior', 'jr'].includes(this.childName.toLowerCase());
      
      // Use proper pronouns based on detected gender
      const pronoun = isFemale ? "ela" : "ele";
      const possessive = isFemale ? "sua" : "seu";
      const childDescriptor = isFemale ? "uma criança muito curiosa" : "um criança muito curioso";
      const childDescriptor2 = isFemale ? "animada" : "animado";
      const adjective1 = isFemale ? "maravilhada" : "maravilhado";
      const adjective2 = isFemale ? "gentilmente" : "gentilmente"; // Same in both genders
      
      // Create a story with properly formatted paragraphs and gender-specific language
      return `Era uma vez ${this.childName}, ${childDescriptor} que adorava conhecer as histórias e tradições da Bahia. Em uma viagem especial à ${this.selectedLocation.name}, ${this.childName} estava muito ${childDescriptor2} para explorar este lugar cheio de cultura e magia.

Enquanto caminhava próximo ao rio, observando os saveiros passarem e sentindo a brisa mansa, ${this.childName} viu algo brilhando na margem. Para ${possessive} surpresa, era um ${this.selectedAnimal.name} de forma única e encantadora.

"Olá," disse ${this.childName} ${adjective2}, tocando suavemente o objeto.

Para ${possessive} surpresa, um velho oleiro surgiu de trás de uma pequena oficina e sorriu. "Vejo que você encontrou meu ${this.selectedAnimal.name} especial. Sabia que aqui em ${this.selectedLocation.name}, fazemos estes artesanatos há mais de cem anos?"

${this.childName} ficou ${adjective1}. "${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} adoraria aprender! Como vocês fazem isso?"

O oleiro, que se chamava Seu Tião, explicou que o barro vinha do mangue, e que cada peça contava uma história do rio, dos pescadores e da vida ribeirinha. "Nossos antepassados nos ensinaram a transformar o barro em arte, e nós passamos esse conhecimento de geração em geração."

Assim, ${this.childName} e Seu Tião embarcaram em uma grande aventura pelo rio em um saveiro colorido, conhecendo os segredos do mangue, os sons do samba de roda, e aprendendo como fazer miniaturas de barro. Juntos, eles moldaram pequenos caxixis, barquinhos e figuras que contavam histórias da Bahia.

No final do dia, Seu Tião presenteou ${this.childName} com um pequeno caxixi feito por suas próprias mãos. "Leve este caxixi como lembrança. Quando você o balançar, vai ouvir o som do rio e se lembrar de nós."

${this.childName} voltou para casa ${childDescriptor2} de histórias incríveis para contar e com um novo tesouro: não apenas o caxixi, mas também as memórias das cores, dos sons e dos saberes da cultura baiana. E toda vez que balançava ${possessive} caxixi, lembrava-se do ${this.selectedAnimal.name} e da aventura maravilhosa que teve em ${this.selectedLocation.name}, onde o rio serpenteia e os saveiros navegam sob um céu de estrelas guias.`;
    },
    
    goBack() {
      // Instead of redirecting to home, reset form and return to form screen
      this.childName = "";
      this.selectedAnimal = null;
      this.selectedLocation = null;
      this.screen = "form";
    },

    async saveStory(isAutoSave = false) {
      try {
        // Mensagem de carregamento (só mostrar se não for auto-save)
        if (!isAutoSave) {
          alert("Salvando sua história...");
        }
        
        // Preparar o armazenamento
        const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
        
        // Se temos uma URL de imagem mas não temos base64, tentar obter base64
        if (this.storyImage && !this.storyData.imageBase64 && this.storyImage.startsWith('http')) {
          try {
            console.log("🔄 Obtendo base64 da imagem antes de salvar");
            const imageBase64 = await this.downloadAndSaveImage(this.storyImage, null);
            if (imageBase64) {
              this.storyData.imageBase64 = imageBase64;
              console.log("✅ Base64 da imagem obtido com sucesso");
              
              // Verificar tamanho do base64 obtido
              const base64Size = Math.round((imageBase64.length * 3) / 4);
              console.log(`📊 Tamanho da imagem base64 para salvar: ${this.formatFileSize(base64Size)}`);
              }
            } catch (error) {
            console.error("❌ Erro ao obter base64 da imagem:", error);
          }
        } else if (this.storyData.imageBase64) {
          // Verificar tamanho do base64 existente
          const base64Size = Math.round((this.storyData.imageBase64.length * 3) / 4);
          console.log(`📊 Tamanho da imagem base64 existente: ${this.formatFileSize(base64Size)}`);
        }
        
        // Criar objeto da história
        const newStory = {
          id: Date.now(),
          title: this.storyData.title,
          content: this.storyData.content,
          image: this.storyImage,
          imageBase64: this.storyData.imageBase64,
          audio: this.audioSource,
          childName: this.childName,
          animal: this.selectedAnimal.name,
          location: this.selectedLocation.name,
          createdAt: new Date().toISOString()
        };
        
        console.log("💾 Saving story with complete data:", JSON.stringify(newStory));
        console.log("📸 Image URL being saved:", this.storyImage);
        console.log("🔊 Audio URL being saved:", this.audioSource);
        
        // Priorizar sempre o uso de base64 para imagens
        if (this.storyData.imageBase64) {
          console.log("🔄 Usando imageBase64 como fonte primária");
          newStory.image = this.storyData.imageBase64;
        }
        // Se não temos base64 mas temos URL, manter apenas como fallback
        else if (this.storyImage) {
          console.log("⚠️ Sem base64 disponível, usando apenas URL");
        }
        
        // Tentar salvar no localStorage
        try {
          // Verificar se é necessário comprimir a imagem para caber no localStorage
          const compressedStory = {...newStory};
          
          // Primeiro tentar salvar com a imagem original
          savedStories.push(compressedStory);
          const storiesJson = JSON.stringify(savedStories);
          
          try {
            localStorage.setItem("savedStories", storiesJson);
            console.log("✅ História salva com sucesso no localStorage");
          } catch (quotaError) {
            console.warn("⚠️ Erro de cota excedida ao salvar, tentando comprimir imagem:", quotaError);
            
            // Remover a história adicionada para tentar novamente
            savedStories.pop();
            
            // Se temos base64, tentar comprimir
            if (compressedStory.imageBase64) {
              // Tentar comprimir a imagem para 50% da qualidade
              const compressedImage = await this.compressImage(compressedStory.imageBase64, 0.5);
              if (compressedImage) {
                const originalSize = Math.round((compressedStory.imageBase64.length * 3) / 4);
                const compressedSize = Math.round((compressedImage.length * 3) / 4);
                
                console.log(`🗜️ Imagem comprimida: ${this.formatFileSize(originalSize)} → ${this.formatFileSize(compressedSize)}`);
                compressedStory.imageBase64 = compressedImage;
                compressedStory.image = compressedImage;
                
                // Tentar salvar com a imagem comprimida
                savedStories.push(compressedStory);
                const compressedJson = JSON.stringify(savedStories);
                
                try {
                  localStorage.setItem("savedStories", compressedJson);
                  console.log("✅ História salva com imagem comprimida");
                } catch (compressError) {
                  console.error("❌ Erro ao salvar mesmo com imagem comprimida:", compressError);
                  
                  // Remover a história adicionada
                  savedStories.pop();
                  
                  // Se ainda não conseguimos, tentar remover a imagem completamente
                  console.log("🔄 Tentando salvar sem a imagem base64");
                  const noImageStory = {...compressedStory, imageBase64: null};
                  
                  if (compressedStory.image && compressedStory.image.startsWith('data:')) {
                    noImageStory.image = this.getRandomFallbackImage();
                  }
                  
                  savedStories.push(noImageStory);
                  const noImageJson = JSON.stringify(savedStories);
                  
                  try {
                    localStorage.setItem("savedStories", noImageJson);
                    console.log("⚠️ História salva, mas sem a imagem base64");
                    
                    if (!isAutoSave) {
                      alert("História salva, mas devido a limitações de armazenamento, a imagem não pôde ser salva localmente.");
                    }
                  } catch (finalError) {
                    console.error("❌ Não foi possível salvar a história de nenhuma forma:", finalError);
                    
                    // Última tentativa: limpar histórias antigas
                    if (savedStories.length > 1) {
                      console.log("🔄 Tentando remover histórias antigas para fazer espaço");
                      
                      // Remover a história mais antiga
                      savedStories.shift();
                      const reducedJson = JSON.stringify(savedStories);
                      
                      try {
                        localStorage.setItem("savedStories", reducedJson);
                        // Agora tentar adicionar a nova história novamente
                        savedStories.push(noImageStory);
                        const finalJson = JSON.stringify(savedStories);
                        localStorage.setItem("savedStories", finalJson);
                        console.log("✅ História salva após remover histórias antigas");
                      } catch (ultimateError) {
                        console.error("❌ Falha total ao salvar história:", ultimateError);
                        if (!isAutoSave) {
                          alert("Não foi possível salvar sua história. O armazenamento local está cheio. Por favor, exclua algumas histórias antigas.");
                        }
                        return; // Sair da função
                      }
                    } else {
                      if (!isAutoSave) {
                        alert("Não foi possível salvar sua história. O armazenamento local está cheio.");
                      }
                      return; // Sair da função
                    }
                  }
                }
              } else {
                console.error("❌ Falha ao comprimir imagem");
                if (!isAutoSave) {
                  alert("Não foi possível salvar sua história devido a limitações de armazenamento.");
                }
                return; // Sair da função
              }
            } else {
              console.warn("⚠️ Sem base64 para comprimir, tentando salvar sem a imagem");
              compressedStory.imageBase64 = null;
              
              // Tentar salvar sem a imagem
              savedStories.push(compressedStory);
              const noImageJson = JSON.stringify(savedStories);
              
              try {
                localStorage.setItem("savedStories", noImageJson);
                console.log("⚠️ História salva sem a imagem base64");
              } catch (noImageError) {
                console.error("❌ Não foi possível salvar a história de nenhuma forma:", noImageError);
                if (!isAutoSave) {
                  alert("Não foi possível salvar sua história. O armazenamento local está cheio.");
                }
                return; // Sair da função
              }
            }
          }
        } catch (storageError) {
          console.error("❌ Erro ao acessar localStorage:", storageError);
          if (!isAutoSave) {
            alert("Não foi possível salvar sua história devido a um erro de armazenamento.");
          }
          return; // Sair da função
        }
        
        // Set proper permissions for image and audio files if they are filesystem URLs
        try {
          // Set permissions for image file if it's a filesystem URL
          if (this.storyImage && this.storyImage.includes('fs.webdraw.com')) {
            const imagePath = this.storyImage.replace('https://fs.webdraw.com', '');
            console.log("🔐 Setting permissions for image file path:", imagePath);
            const imagePermResult = await this.setFileAccess(imagePath);
            console.log(`🔒 Image permission result: ${imagePermResult ? 'success' : 'failed'}`);
          }
          
          // Set permissions for audio file if it's a filesystem URL
          if (this.audioSource && this.audioSource.includes('fs.webdraw.com')) {
            const audioPath = this.audioSource.replace('https://fs.webdraw.com', '');
            console.log("🔐 Setting permissions for audio file path:", audioPath);
            const audioPermResult = await this.setFileAccess(audioPath);
            console.log(`🔒 Audio permission result: ${audioPermResult ? 'success' : 'failed'}`);
          }
        } catch (error) {
          console.error("Error setting file permissions:", error);
        }
        
        // Mensagem de sucesso (só mostrar se não for auto-save)
        if (!isAutoSave) {
          alert("História salva com sucesso!");
          
          // Redirect to my stories page
          this.$router.push("/my-stories");
          } else {
          console.log("✅ História salva automaticamente");
          }
        } catch (error) {
        console.error("❌ Erro geral ao salvar história:", error);
        if (!isAutoSave) {
          alert("Ocorreu um erro ao salvar sua história. Por favor, tente novamente.");
        }
      }
    },
    
    // Novo método para comprimir imagens
    async compressImage(base64Image, quality = 0.7) {
      try {
        return new Promise((resolve, reject) => {
          // Criar uma nova imagem a partir do base64
          const img = new Image();
          img.src = base64Image;
          
          img.onload = () => {
            // Criar um canvas para compressão
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Determinar o tamanho da imagem - manter a proporção
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Desenhar a imagem no canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Converter de volta para base64 com qualidade reduzida
            // webp é mais eficiente para compressão
            const compressedBase64 = canvas.toDataURL('image/webp', quality);
            resolve(compressedBase64);
          };
          
          img.onerror = (error) => {
            console.error("Erro ao carregar imagem para compressão:", error);
            reject(error);
          };
        });
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        return null;
      }
    },
    
    // Audio playback methods
    toggleAudio() {
      const audioPlayer = this.$refs.audioPlayer;
      if (!audioPlayer) {
        console.error("Audio player element not found");
        return;
      }

      if (!this.audioSource) {
        console.error("No audio source available");
        return;
      }
      
      // If audio is still loading, show a message and don't attempt to play
      if (this.audioLoading) {
        alert("O áudio ainda está sendo carregado. Por favor, aguarde um momento.");
        return;
      }

        if (this.isPlaying) {
          audioPlayer.pause();
          this.isPlaying = false;
        console.log("Audio paused");
        } else {
        // Make sure the audio source is set and prepared
        if (!audioPlayer.querySelector('source') || audioPlayer.querySelector('source').src !== this.audioSource) {
          console.log("Audio sources not set up properly, preparing audio");
          this.prepareAudio();
        }
        
        // Try to play the audio
        console.log("Attempting to play audio...");
            audioPlayer.play()
              .then(() => {
                console.log("Audio playback started successfully");
            this.isPlaying = true;
              })
              .catch(error => {
                console.error("Error playing audio:", error);
            
            // Try direct access without proxy if we get specific errors
            if (error.name === "NotSupportedError" || error.name === "AbortError") {
              console.log("Trying direct access to audio file...");
              
              // Try direct access without proxy
              const directAudioPlayer = new Audio(this.audioSource);
              directAudioPlayer.onloadedmetadata = () => {
                console.log("Direct audio player loaded metadata successfully");
                directAudioPlayer.play()
            .then(() => {
                    console.log("Direct audio playback started successfully");
                    // Replace our audio player with this one
                    this.audioCurrentTime = directAudioPlayer.currentTime;
                    this.audioDuration = directAudioPlayer.duration;
              this.isPlaying = true;
                    
                    // Setup timeupdate event
                    directAudioPlayer.ontimeupdate = () => {
                      this.audioCurrentTime = directAudioPlayer.currentTime;
                      this.audioProgress = (directAudioPlayer.currentTime / directAudioPlayer.duration) * 100;
                    };
                    
                    // Setup ended event
                    directAudioPlayer.onended = () => {
                this.isPlaying = false;
                      this.audioProgress = 0;
                      this.audioCurrentTime = 0;
                    };
                  })
                  .catch(directError => {
                    console.error("Direct audio playback failed:", directError);
                    this.showFallbackPlayer();
                  });
              };
              
              directAudioPlayer.onerror = () => {
                console.error("Direct audio player failed to load");
                this.showFallbackPlayer();
              };
            } else {
              this.showFallbackPlayer();
            }
          });
      }
    },
    
    // Helper method to show fallback player
    showFallbackPlayer() {
      // Create a fallback audio element
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.padding = '20px';
      container.style.marginTop = '20px';
      container.style.marginBottom = '20px';
      container.style.background = '#f8f8f8';
      container.style.borderRadius = '8px';
      container.style.textAlign = 'center';
      
      container.innerHTML = `
        <p style="margin-bottom: 10px; color: #000000; font-weight: 500;">Não foi possível reproduzir o áudio automaticamente. Use o player abaixo:</p>
        <audio controls style="width: 100%;" crossorigin="anonymous">
          <source src="${this.audioSource}" type="audio/mp3">
          <source src="${this.audioSource}" type="audio/mpeg">
          <source src="${this.audioSource}" type="audio/wav">
          Seu navegador não suporta o elemento de áudio.
        </audio>
      `;
      
      // Find a good location to insert this
      const storyElement = document.querySelector('.prose');
      if (storyElement && storyElement.parentNode) {
        storyElement.parentNode.insertBefore(container, storyElement);
        alert("Use o player de áudio abaixo para ouvir a narração.");
      } else {
        alert("Para ouvir o áudio, tente novamente ou salve a história para ouvir mais tarde.");
      }
    },
    
    updateAudioProgress() {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !isNaN(audioPlayer.duration)) {
        this.audioCurrentTime = audioPlayer.currentTime;
        this.audioProgress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      }
    },
    
    seekAudio(event) {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !isNaN(audioPlayer.duration)) {
        const progressBar = event.currentTarget;
        const clickPosition = event.offsetX;
        const totalWidth = progressBar.clientWidth;
        const seekPercentage = (clickPosition / totalWidth);
        
        audioPlayer.currentTime = seekPercentage * audioPlayer.duration;
        this.audioProgress = seekPercentage * 100;
      }
    },
    
    onAudioLoaded() {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer) {
        this.audioDuration = audioPlayer.duration;
      }
    },
    
    onAudioEnded() {
      this.isPlaying = false;
      this.audioProgress = 0;
      
      // Reset to beginning
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer) {
        audioPlayer.currentTime = 0;
      }
    },
    
    downloadAudio() {
      if (!this.audioSource) {
        alert("Não há áudio disponível para download.");
        return;
      }
      
      // If audio is still loading, show a message
      if (this.audioLoading) {
        alert("O áudio ainda está sendo preparado. Por favor, tente novamente em alguns instantes.");
        return;
      }

      try {
        // Create a temporary link element
        const link = document.createElement('a');
        
        // If the audio source is a data URL, use it directly
        if (this.audioSource.startsWith('data:')) {
          link.href = this.audioSource;
        } else {
          // For network URLs, try to ensure they're accessible
          link.href = this.audioSource;
        }
        
        link.download = `${this.storyData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Audio download initiated");
        } catch (error) {
        console.error("Error downloading audio:", error);
        alert("Houve um erro ao tentar baixar o áudio. Por favor, tente novamente.");
      }
    },
    
    shareStory() {
      if (navigator.share) {
        navigator.share({
          title: this.storyData.title,
          text: 'Confira esta história incrível que criei com IA!',
          url: window.location.href
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing:', error));
      } else {
        alert('Compartilhamento não disponível neste navegador.');
      }
    },
    
    formatTime(seconds) {
      if (isNaN(seconds) || seconds === 0) return '00:00';
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    // Add this method to handle CORS issues with remote audio
    getProxiedUrl(url) {
      if (!url) return null;
      
      // Se it's already a data URL, no need for proxying
      if (url.startsWith('data:')) return url;
      
      // Primeiro tentar acessar diretamente, sem proxy
      // isso é o preferencial para o WebDraw filesystem
      if (url.includes('fs.webdraw.com')) {
        return url;
      }
      
      // Use a CORS proxy apenas para URLs externas
      if (url.startsWith('http') || url.startsWith('https')) {
        // Common proxies: https://corsproxy.io/, https://cors-anywhere.herokuapp.com/
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      }
      
      return url;
    },
    
    // Vamos também modificar o método prepareAudio para priorizar o acesso direto
    async prepareAudio() {
      if (!this.audioSource) {
        console.warn("No audio source available to prepare");
        return;
      }

      console.log("Preparing audio from source:", this.audioSource);
      
      // If the audio is still loading, show message
      if (this.audioLoading) {
        console.log("Audio is still loading, will prepare when ready");
        return;
      }

      // Get the audio element
      const audioPlayer = this.$refs.audioPlayer;
      if (!audioPlayer) {
        console.error("Audio player element not found");
        return;
      }
      
      // Clear existing sources
      while (audioPlayer.firstChild) {
        audioPlayer.removeChild(audioPlayer.firstChild);
      }
      
      // Primeiro tentar o URL direto, que é preferível para URLs do WebDraw
      if (this.audioSource.includes('fs.webdraw.com')) {
        console.log("🔊 Adicionando fonte de áudio direta (WebDraw)");
        const source = document.createElement('source');
        source.type = "audio/mp3";
        source.src = this.audioSource;
        audioPlayer.appendChild(source);
      } 
      // Para outras URLs, usar uma abordagem mais robusta
      else {
        console.log("🔊 Adicionando múltiplas fontes para compatibilidade");
        
        // Add direct URL with different formats
        [
          { type: "audio/mp3", src: this.audioSource },
          { type: "audio/mpeg", src: this.audioSource },
          { type: "audio/wav", src: this.audioSource }
        ].forEach(format => {
          const source = document.createElement('source');
          source.type = format.type;
          source.src = format.src;
          audioPlayer.appendChild(source);
        });
        
        // Apenas para URLs que não são do WebDraw, adicionar opção com proxy
        if (!this.audioSource.includes('fs.webdraw.com') && !this.audioSource.startsWith('data:')) {
          // Get proxied URL apenas para fontes externas
          const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(this.audioSource)}`;
          console.log("🌐 Adicionando URL com proxy como fallback:", proxiedUrl);
          
          // Add proxied URL as fallback
          [
            { type: "audio/mp3", src: proxiedUrl },
            { type: "audio/mpeg", src: proxiedUrl },
            { type: "audio/wav", src: proxiedUrl }
          ].forEach(format => {
            const source = document.createElement('source');
            source.type = format.type;
            source.src = format.src;
            audioPlayer.appendChild(source);
          });
        }
      }
      
      // Add fallback text
      const fallbackText = document.createTextNode('Your browser does not support the audio element.');
      audioPlayer.appendChild(fallbackText);
      
      // Load the audio
      audioPlayer.load();
      
      console.log("Audio prepared with sources");
    },
    
    // Update screen method to call prepareAudio when result screen is shown
    updateScreen(newScreen) {
      this.screen = newScreen;
      
      // If changing to result screen and we have audio, prepare it
      if (newScreen === 'result') {
        // Wait for the DOM to update
        this.$nextTick(() => {
          if (this.audioSource) {
            this.prepareAudio();
          }
          
          // Auto-save story after 2 seconds
          setTimeout(() => {
            console.log("🕒 Iniciando salvamento automático após 2 segundos");
            this.saveStory(true);
          }, 2000);
        });
      }
    },
    
    // Add new methods for audio file handling
    async setFilePermissions(filepath) {
      if (!filepath) return;
      
      try {
        // Se o path não começa com /, adicione-o
        const normalizedPath = filepath.startsWith('/') ? filepath : `/${filepath}`;
        console.log(`Setting public permissions for audio file: ${normalizedPath}`);
        
        // Verificar se o arquivo existe
        const exists = await sdk.fs.exists(normalizedPath);
            if (!exists) {
          console.warn(`File does not exist: ${normalizedPath}`);
          return false;
        }
        
        // Definir permissões usando chmod
        if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
          await sdk.fs.chmod(normalizedPath, 0o644);
          console.log(`Successfully set public permissions (0o644) for: ${normalizedPath}`);
          return true;
        } else {
          console.warn(`chmod method not available in sdk.fs`);
          return false;
        }
      } catch (error) {
        // Registrar o erro mas não permitir que pare o processo
        console.error(`Error setting permissions for file: ${error.message}`);
        return false;
      }
    },
    
    async checkAudioReady(url, attempts = 3, delay = 2000) {
      if (!url) return false;
      
      for (let i = 0; i < attempts; i++) {
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            cache: 'no-cache',
            headers: { 'Range': 'bytes=0-1' }
          });
          
          if (response.ok || response.status === 206) {
            console.log(`Audio file is accessible! Status: ${response.status}`);
            return true;
          }
          
          console.log(`Audio file not ready (${i+1}/${attempts}), status: ${response.status}`);
        } catch (error) {
          console.warn(`Error checking audio file (${i+1}/${attempts}): ${error.message}`);
        }
        
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return false;
    },
    
    startBackgroundAudioCheck(url) {
      // Clear any existing interval
      if (this.audioCheckInterval) {
        clearInterval(this.audioCheckInterval);
      }
      
      let checkCount = 0;
      const maxChecks = 30;
      
      this.audioCheckInterval = setInterval(async () => {
        checkCount++;
        
        if (checkCount > maxChecks) {
          clearInterval(this.audioCheckInterval);
          console.warn("Background audio check stopped after maximum attempts");
          this.audioLoading = false;
          return;
        }

        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            cache: 'no-cache',
            headers: { 'Range': 'bytes=0-1' }
          });
          
          if (response.ok || response.status === 206) {
            console.log(`Audio file is now accessible! Status: ${response.status}`);
      this.audioLoading = false;
            clearInterval(this.audioCheckInterval);
            
            // If we're already on the result screen, prepare the audio
            if (this.screen === 'result') {
              this.prepareAudio();
            }
          }
        } catch (error) {
          if (checkCount % 5 === 0) {
            console.warn(`Background audio check error (${checkCount}/${maxChecks}): ${error.message}`);
          }
        }
      }, 3000); // Check every 3 seconds
    },
    
    // Método para baixar uma imagem de uma URL e salvá-la no sistema de arquivos
    async downloadAndSaveImage(imageUrl, savePath) {
      try {
        console.log(`Tentando baixar imagem de: ${imageUrl}`);
        
        // Primeiro, baixar a imagem e obter base64
        // Fazer o fetch da imagem
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Erro ao baixar imagem: ${response.status} ${response.statusText}`);
        }
        
        // Obter tamanho do arquivo original
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          console.log(`📊 Tamanho do arquivo original: ${this.formatFileSize(parseInt(contentLength))}`);
        }
        
        // Converter para blob e depois para base64
        const blob = await response.blob();
        console.log(`📊 Tamanho do blob: ${this.formatFileSize(blob.size)}`);
        
        const base64 = await this.blobToBase64(blob);
        const base64Size = Math.round((base64.length * 3) / 4);
        console.log(`📊 Tamanho após conversão para base64: ${this.formatFileSize(base64Size)}`);
        console.log("✅ Imagem convertida para base64");
        
        // Se não foi fornecido savePath, apenas retornar o base64
        if (!savePath) {
          return base64;
        }
        
        // Verificar se o diretório Pictures existe, criar se não
        try {
          const picturesDir = '~/Pictures';
          const picturesDirExists = await sdk.fs.exists(picturesDir);
          
          if (!picturesDirExists) {
            console.log("📁 Criando diretório Pictures...");
            try {
              await sdk.fs.mkdir(picturesDir);
              console.log("✅ Diretório Pictures criado com sucesso");
            } catch (mkdirError) {
              console.error("❌ Erro ao criar diretório Pictures:", mkdirError);
              // Tentar criar com caminho absoluto se falhar
              try {
                await sdk.fs.mkdir('/Pictures');
                console.log("✅ Diretório /Pictures criado com sucesso");
              } catch (mkdirError2) {
                console.error("❌ Erro ao criar diretório /Pictures:", mkdirError2);
                // Se não conseguir criar diretório, retornar apenas base64
                return base64;
              }
            }
          } else {
            console.log("📁 Diretório Pictures já existe");
          }
          
          // Salvar usando base64 como string
          console.log("💾 Salvando imagem como string base64 em:", savePath);
          await sdk.fs.write(savePath, base64);
          
          // Verificar se o arquivo foi salvo corretamente
          try {
            const fileExists = await sdk.fs.exists(savePath);
            if (fileExists) {
              console.log(`✅ Arquivo confirmado no filesystem: ${savePath}`);
              
              // Verificar tamanho do arquivo salvo
              try {
                const fileStats = await sdk.fs.stat(savePath);
                if (fileStats && fileStats.size) {
                  console.log(`📊 Tamanho do arquivo salvo: ${this.formatFileSize(fileStats.size)}`);
                  console.log(`📊 Diferença de tamanho: ${this.formatFileSize(Math.abs(fileStats.size - base64Size))}`);
                  console.log(`📊 Taxa de compressão: ${((base64Size - fileStats.size) / base64Size * 100).toFixed(2)}%`);
                }
              } catch (statError) {
                console.warn("⚠️ Não foi possível obter estatísticas do arquivo:", statError);
        }
      } else {
              console.warn("⚠️ Arquivo não encontrado após salvar:", savePath);
            }
          } catch (checkError) {
            console.warn("⚠️ Erro ao verificar existência do arquivo:", checkError);
          }
          
          // Definir permissões públicas para o arquivo
          const permResult = await this.setFileAccess(savePath);
          console.log(`🔒 Permissões definidas: ${permResult ? 'sucesso' : 'falha'}`);
          
          console.log(`✅ Imagem salva com sucesso em: ${savePath}`);
        } catch (fsError) {
          console.error("⚠️ Erro ao salvar no filesystem:", fsError);
          // Retornar base64 mesmo se falhar o salvamento
        }
        
        // Retornar o base64 para uso como fallback (ou principal se o fs falhar)
        return base64;
      } catch (error) {
        console.error("❌ Erro durante o download e salvamento da imagem:", error);
        return null;
      }
    },
    
    // Converter Blob para Base64
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          console.log(`🔍 Tipo do resultado da conversão: ${typeof result}`);
          if (typeof result === 'string') {
            this.analyzeBase64Image(result);
          }
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    // Converter Base64 para Uint8Array
    base64ToUint8Array(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    },
    
    // Método auxiliar para formatar tamanhos de arquivo
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
      else return (bytes / 1073741824).toFixed(2) + ' GB';
    },
    
    // Método para analisar e imprimir informações detalhadas sobre base64
    analyzeBase64Image(base64String) {
      if (!base64String || typeof base64String !== 'string') {
        console.error("❌ String base64 inválida ou não fornecida");
        return;
      }
      
      // Extrair informações do formato
      let format = "desconhecido";
      let mimeType = "desconhecido";
      
      if (base64String.startsWith('data:')) {
        // É uma data URL
        const matches = base64String.match(/^data:([^;]+);base64,/);
        if (matches && matches.length > 1) {
          mimeType = matches[1];
          format = mimeType.split('/')[1];
        }
        
        // Remover o prefixo para calcular o tamanho real
        const base64Data = base64String.split(',')[1];
        const sizeInBytes = Math.floor((base64Data.length * 3) / 4);
        
        console.log(`📝 === ANÁLISE DE IMAGEM BASE64 ===`);
        console.log(`📝 MIME Type: ${mimeType}`);
        console.log(`📝 Formato: ${format}`);
        console.log(`📝 Tamanho: ${this.formatFileSize(sizeInBytes)}`);
        console.log(`📝 Comprimento total da string: ${base64String.length} caracteres`);
        console.log(`📝 Início da data: ${base64Data.substring(0, 30)}...`);
        console.log(`📝 Final da data: ...${base64Data.substring(base64Data.length - 30)}`);
        
        // Verificar se há caracteres inválidos ou corrupção
        const invalidChars = base64Data.match(/[^A-Za-z0-9+/=]/g);
        if (invalidChars) {
          console.warn(`⚠️ AVISO: A string base64 contém ${invalidChars.length} caracteres inválidos`);
        } else {
          console.log(`✅ String base64 parece válida (sem caracteres inválidos)`);
        }
      } else {
        // Não é uma data URL
        console.log(`📝 === ANÁLISE DE IMAGEM BASE64 (formato bruto) ===`);
        console.log(`📝 Formato: String base64 bruta (sem prefixo data:))`);
        console.log(`📝 Tamanho aproximado: ${this.formatFileSize(Math.floor((base64String.length * 3) / 4))}`);
        console.log(`📝 Comprimento total da string: ${base64String.length} caracteres`);
        console.log(`📝 Início da data: ${base64String.substring(0, 30)}...`);
        console.log(`📝 Final da data: ...${base64String.substring(base64String.length - 30)}`);
        
        // Verificar se há caracteres inválidos ou corrupção
        const invalidChars = base64String.match(/[^A-Za-z0-9+/=]/g);
        if (invalidChars) {
          console.warn(`⚠️ AVISO: A string base64 contém ${invalidChars.length} caracteres inválidos`);
        } else {
          console.log(`✅ String base64 parece válida (sem caracteres inválidos)`);
        }
      }
    },
  },
  beforeUnmount() {
    // Clean up any intervals
    if (this.audioCheckInterval) {
      clearInterval(this.audioCheckInterval);
      console.log("Cleared audio check interval");
    }
    
    // Pause any playing audio
    const audioPlayer = this.$refs.audioPlayer;
    if (audioPlayer && !audioPlayer.paused) {
      audioPlayer.pause();
      console.log("Paused audio playback");
    }
  }
};

