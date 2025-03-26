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
        <div v-if="screen === 'form'" class="bg-neutral-light/80 rounded-lg p-8 shadow-lg border border-neutral-dark">
          <div class="mb-8 text-center">
            <h1 class="font-heading font-bold text-3xl text-secondary-dark mb-2">Criar Uma História</h1>
            <p class="text-neutral-dark font-body">Personalize a história com o nome do seu filho e suas preferências</p>
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
              <label class="block font-heading font-bold text-lg text-secondary-dark mb-2">Animal Favorito da Fauna Brasileira</label>
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
        <div v-if="screen === 'generating'" class="bg-neutral-light/80 rounded-lg p-8 shadow-lg border border-neutral-dark text-center">
          <div class="mb-8">
            <div class="w-24 h-24 mx-auto mb-4 relative">
              <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              <div class="absolute inset-4 rounded-full bg-primary/40 animate-pulse"></div>
              <div class="absolute inset-8 rounded-full bg-primary/60 animate-pulse"></div>
              <i class="fas fa-feather-alt text-primary text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
            </div>
            <h2 class="font-heading font-bold text-2xl text-secondary-dark">Criando Sua História...</h2>
            <p class="text-neutral-dark mt-2 font-body">Aguarde enquanto nossa inteligência artificial personaliza uma história especial</p>
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
                <span class="font-body text-neutral-dark">Criando Enredo</span>
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
                <span class="font-body text-neutral-dark">Escrevendo História</span>
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
                <span class="font-body text-neutral-dark">Criando Ilustração</span>
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
                <span class="font-body text-neutral-dark">Gerando Narração</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Story Result Screen -->
        <div v-if="screen === 'result'" class="relative">
          <!-- Story Container -->
          <div class="bg-neutral-light/90 rounded-lg p-8 shadow-lg border border-neutral-dark relative overflow-hidden">
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
                  <div class="w-full h-1 bg-neutral rounded-full cursor-pointer" @click="seekAudio">
                    <div class="h-1 bg-primary rounded-full" :style="{ width: audioProgress + '%' }"></div>
                  </div>
                </div>
                
                <!-- Time Display -->
                <div class="flex justify-between w-full">
                  <span class="text-xs text-neutral-dark opacity-50">{{ formatTime(audioCurrentTime) }}</span>
                  <span class="text-xs text-neutral-dark opacity-50">{{ formatTime(audioDuration) }}</span>
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
                <div v-if="audioLoading" class="text-center text-xs text-neutral-dark mt-2">
                  Preparando áudio... por favor aguarde
                </div>
              </div>
              
              <!-- Divider -->
              <div class="border-b border-neutral-dark my-4"></div>
              
              <!-- Story Text -->
              <div class="prose prose-sm md:prose-base text-neutral-dark font-body">
                <div v-html="formattedStory"></div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mt-6">
                <button @click="goBack" class="btn-rustic bg-neutral hover:bg-neutral-dark text-secondary-dark font-heading font-bold py-3 px-6 flex-1 flex items-center justify-center gap-2">
                  <i class="fas fa-plus"></i> Criar Nova História
                </button>
                
                <button @click="saveStory" class="btn-rustic bg-primary hover:bg-primary-dark text-white font-heading font-bold py-3 px-6 flex-1 flex items-center justify-center gap-2">
                  <i class="fas fa-save"></i> Salvar História
                </button>
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
          name: "Mico-Leão-Dourado",
          icon: "fas fa-paw"
        },
        {
          id: 2,
          name: "Onça-Pintada",
          icon: "fas fa-cat"
        },
        {
          id: 3,
          name: "Lobo-Guará",
          icon: "fas fa-dog"
        },
        {
          id: 4,
          name: "Tucano-Toco",
          icon: "fas fa-kiwi-bird"
        },
        {
          id: 5,
          name: "Arara-Azul",
          icon: "fas fa-dove"
        },
        {
          id: 6,
          name: "Boto-Cor-de-Rosa",
          icon: "fas fa-fish"
        }
      ],
      
      // Story Locations with Font Awesome icons instead of images
      storyLocations: [
        {
          id: 1,
          name: "Floresta Amazônica",
          icon: "fas fa-tree"
        },
        {
          id: 2,
          name: "Pantanal",
          icon: "fas fa-water"
        },
        {
          id: 3,
          name: "Cerrado",
          icon: "fas fa-seedling"
        },
        {
          id: 4,
          name: "Chapada Diamantina",
          icon: "fas fa-mountain"
        },
        {
          id: 5,
          name: "Litoral Brasileiro",
          icon: "fas fa-umbrella-beach"
        },
        {
          id: 6,
          name: "Mata Atlântica",
          icon: "fas fa-leaf"
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
        const storyTitle = `${this.childName} e o ${this.selectedAnimal.name} na ${this.selectedLocation.name}`;
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
              const imagePrompt = `Create a cheerful and child-friendly illustration for a children's story titled "${storyObject.title}". Use bright, soft colors and a warm, engaging style. The image should depict a main scene from the story in a magical, inspiring way that's appropriate for young children.`;
              
              console.log("Starting image generation with prompt:", imagePrompt);
              
              // Generate the image using SDK
              const imageResult = await sdk.ai.generateImage({
            model: "stability:ultra",
                prompt: imagePrompt,
            aspect_ratio: "1:1",
            providerOptions: {
              stability: {
                negative_prompt: "ugly, deformed, disfigured, poor quality, low resolution, bad anatomy",
                style_preset: "fantasy-art", // Using fantasy-art style which is perfect for children's stories
                output_format: "webp",
                aspect_ratio: "1:1",
                seed: Math.floor(Math.random() * 4294967294)
              }
            }
          });
              
              console.log("Image generation result:", imageResult);
              
              // Process the response
              if (imageResult && imageResult.images && imageResult.images.length > 0) {
                // For stability:ultra model, the response structure is different
            if (typeof imageResult.images[0] === 'string') {
                  // It's a base64 string
                  this.storyData.imageBase64 = `data:image/webp;base64,${imageResult.images[0]}`;
                  this.storyImage = this.storyData.imageBase64;
            } else {
                  // It's a URL
              this.storyImage = imageResult.images[0];
                }
              } else if (imageResult && imageResult.url) {
                // Fallback to URL if available
            this.storyImage = imageResult.url;
              } else if (imageResult && imageResult.filepath) {
                // Use filepath if available
                const baseUrl = "https://fs.webdraw.com";
                this.storyImage = `${baseUrl}${imageResult.filepath.startsWith('/') ? '' : '/'}${imageResult.filepath}`;
          } else {
                // Use fallback image
                this.storyImage = this.getRandomFallbackImage();
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
    
    generateMockStory() {
      return `Era uma vez ${this.childName}, uma criança muito curiosa que adorava conhecer os animais da natureza brasileira. Em uma viagem especial à ${this.selectedLocation.name}, ${this.childName} estava muito animado para explorar este lugar maravilhoso.\n\nEnquanto caminhava entre as árvores, observando as flores e ouvindo os sons da natureza, ${this.childName} viu algo se movendo entre as folhagens. Para sua surpresa, era um ${this.selectedAnimal.name} que o observava com olhos curiosos!\n\n"Olá," disse ${this.childName} gentilmente. "Não vou machucar você."\n\nPara sua surpresa, o ${this.selectedAnimal.name} se aproximou e começou a falar! "Olá, ${this.childName}! Meu nome é Tiba, e sou o guardião desta parte da ${this.selectedLocation.name}. Estou procurando ajuda para proteger nossa casa."\n\n${this.childName} ficou maravilhado. "Eu adoraria ajudar! O que está acontecendo?"\n\nTiba explicou que as nascentes de água estavam secando porque algumas pessoas estavam desmatando áreas importantes. "Precisamos mostrar a elas como a natureza é importante para todos nós."\n\nAssim, ${this.childName} e Tiba embarcaram em uma grande aventura, conversando com outros animais e aprendendo sobre o delicado equilíbrio da natureza na ${this.selectedLocation.name}. Juntos, eles plantaram sementes, limparam trilhas e até mesmo conversaram com visitantes sobre a importância de preservar o ambiente.\n\nNo final do dia, Tiba presenteou ${this.childName} com uma semente mágica. "Plante esta semente em seu jardim. Ela crescerá e lembrará você da nossa amizade e da importância de cuidar da natureza."\n\n${this.childName} voltou para casa cheio de histórias incríveis para contar e com um novo propósito: ajudar a proteger os animais e a natureza brasileira. E toda vez que olhava para a pequena árvore que crescia de sua semente mágica, lembrava-se de seu amigo ${this.selectedAnimal.name} e da aventura maravilhosa que tiveram na ${this.selectedLocation.name}.`;
    },
    
    formatStoryText(text) {
      if (!text) return "";
      
      // Split by paragraphs and wrap in <p> tags
      const paragraphs = text.split("\n\n");
      return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join("");
    },
    
    goBack() {
      // Fix back functionality to always go back to home
      this.$router.push('/');
    },

    async saveStory() {
      // For the POC, just show a success message
      alert("História salva com sucesso!");
      
      // In a real implementation, this would save to localStorage or backend
      const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
      
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
      
      savedStories.push(newStory);
      localStorage.setItem("savedStories", JSON.stringify(savedStories));
      
      // Redirect to my stories page
      this.$router.push("/my-stories");
    },

    getRandomFallbackImage() {
      // List of fallback images available
      const fallbackImages = [
        '/assets/image/ex1.webp',
        '/assets/image/ex2.webp',
        '/assets/image/ex3.webp',
        '/assets/image/ex4.webp',
        '/assets/image/bg.webp'
      ];
      
      // Select a random image
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return fallbackImages[randomIndex];
    },

    handleImageError(event) {
      console.error("Error loading image:", event);
      
      // If we have a base64 image in the storyData, try to use that
      if (this.storyData && this.storyData.imageBase64) {
        event.target.src = this.storyData.imageBase64;
        return;
      }
      
      // Otherwise use a random fallback image
      const fallbackImage = this.getRandomFallbackImage();
      event.target.src = fallbackImage;
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
      // Get proxied URL
      const proxiedUrl = this.getProxiedUrl(this.audioSource);
      
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
        <p style="margin-bottom: 10px;">Não foi possível reproduzir o áudio automaticamente. Use o player abaixo:</p>
        <audio controls style="width: 100%;" crossorigin="anonymous">
          <source src="${this.audioSource}" type="audio/mp3">
          <source src="${this.audioSource}" type="audio/mpeg">
          <source src="${this.audioSource}" type="audio/wav">
          <source src="${proxiedUrl}" type="audio/mp3">
          <source src="${proxiedUrl}" type="audio/mpeg">
          <source src="${proxiedUrl}" type="audio/wav">
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
      
      // If it's already a data URL, no need for proxying
      if (url.startsWith('data:')) return url;
      
      // If it's a WebDraw filesystem URL, try to proxy it
      if (url.includes('fs.webdraw.com') || url.includes('api.webdraw.com')) {
        // Use a CORS proxy if needed
        // Common proxies: https://corsproxy.io/, https://cors-anywhere.herokuapp.com/
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      }
      
      return url;
    },
    
    // Update the prepareAudio method to use proxied URLs
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
      
      // For network URLs, check if they're accessible first
      if (!this.audioSource.startsWith('data:')) {
        try {
          const response = await fetch(this.audioSource, { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          
          if (!response.ok) {
            console.warn(`Audio file not accessible, status: ${response.status}. Will use proxy.`);
          } else {
            console.log("Audio file is directly accessible, no need for proxy");
          }
        } catch (error) {
          console.warn(`Error checking audio file: ${error.message}. Will use proxy.`);
        }
      }
      
      // Get proxied URL
      const proxiedUrl = this.getProxiedUrl(this.audioSource);
      console.log("Using proxied URL:", proxiedUrl);
      
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
      
      // Try different source formats with both direct and proxied URLs
      const sourceFormats = [
        // First try direct URL with different formats
        { type: "audio/mp3", src: this.audioSource },
        { type: "audio/mpeg", src: this.audioSource },
        { type: "audio/wav", src: this.audioSource },
        
        // Then try proxied URL if different from direct URL
        ...(proxiedUrl !== this.audioSource ? [
          { type: "audio/mp3", src: proxiedUrl },
          { type: "audio/mpeg", src: proxiedUrl },
          { type: "audio/wav", src: proxiedUrl }
        ] : [])
      ];
      
      // Add sources to the audio element
      sourceFormats.forEach(format => {
        const source = document.createElement('source');
        source.type = format.type;
        source.src = format.src;
        audioPlayer.appendChild(source);
      });
      
      // Add fallback text
      const fallbackText = document.createTextNode('Your browser does not support the audio element.');
      audioPlayer.appendChild(fallbackText);
      
      // Load the audio
      audioPlayer.load();
      
      console.log("Audio prepared with multiple sources");
    },
    
    // Update screen method to call prepareAudio when result screen is shown
    updateScreen(newScreen) {
      this.screen = newScreen;
      
      // If changing to result screen and we have audio, prepare it
      if (newScreen === 'result' && this.audioSource) {
        // Wait for the DOM to update
        this.$nextTick(() => {
          this.prepareAudio();
        });
      }
    },
    
    // Add new methods for audio file handling
    async setFilePermissions(filepath) {
      if (!filepath) return;
      
      try {
        // If the path doesn't start with /, add it
        const normalizedPath = filepath.startsWith('/') ? filepath : `/${filepath}`;
        
        // Set the file to be publicly accessible
        await sdk.fs.setPublic(normalizedPath);
        console.log(`Successfully set permissions for file: ${normalizedPath}`);
        return true;
      } catch (error) {
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
    }
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

