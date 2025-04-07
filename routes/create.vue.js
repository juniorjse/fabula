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
        <img src="/assets/image/caxixi2.png" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-30 filter sepia-[0.3] brightness-[1.1] saturate-[1.2]" />
      </div>
      
      <!-- Navigation Header -->
      <nav class="relative z-10 py-3 px-4 sm:px-6 mb-4">
        <div class="flex justify-between items-center">
          <!-- Back button with rustic style -->
          <button 
            v-if="screen !== 'form'"
            @click="goBack" 
            class="flex items-center gap-1 py-2 px-4 bg-neutral hover:bg-neutral-dark btn-rustic text-secondary-dark font-heading font-medium text-sm shadow-md transition-all duration-200"
          >
            <i class="fas fa-arrow-left mr-1"></i> Voltar
          </button>
          <a 
            v-else
            href="javascript:history.back()" 
            class="flex items-center gap-1 py-2 px-4 bg-neutral hover:bg-neutral-dark btn-rustic text-secondary-dark font-heading font-medium text-sm shadow-md transition-all duration-200"
          >
            <i class="fas fa-arrow-left mr-1"></i> Voltar
          </a>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 pt-4 relative z-10">
        <!-- Form Content - Only shown when not generating story -->
        <div v-if="screen === 'form'" class="bg-[#fae1b1]/60 rounded-lg p-8 shadow-lg border-2 border-[#e2c08c] card-rustic">
          <div class="mb-8 text-center">
            <h1 class="font-heading font-bold text-3xl text-[#4b2707] mb-2">Criar Uma História</h1>
            <p class="text-[#4b2707] font-body">Personalize a história com o nome do seu filho e suas preferências</p>
          </div>
          
          <!-- Input Form -->
          <div class="space-y-8">
            <!-- Child's Name Input -->
            <div class="form-group">
              <label for="childName" class="block font-heading font-bold text-lg text-[#4b2707] mb-2">Nome da Criança</label>
              <input 
                type="text" 
                id="childName" 
                v-model="childName" 
                class="w-full p-3 bg-[#fef1d6] border-2 border-[#e2c08c] rounded-md font-body focus:border-primary focus:outline-none text-[#4b2707]"
                placeholder="Digite o nome da criança" 
              />
            </div>
            
            <!-- Brazilian Fauna Selection -->
            <div class="form-group">
              <label class="block font-heading font-bold text-lg text-[#4b2707] mb-2">Elemento Cultural</label>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="animal in brazilianAnimals" :key="animal.id" 
                     @click="selectAnimal(animal)"
                     :class="[
                       'bg-[#fef1d6] p-3 rounded-md border-2 cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center text-center gap-2',
                       selectedAnimal && selectedAnimal.id === animal.id ? 'border-primary shadow-md' : 'border-[#e2c08c]'
                     ]">
                  <div class="w-16 h-16 flex items-center justify-center text-primary">
                    <img v-if="animal.image" :src="animal.image" :alt="animal.name" class="w-12 h-12 rounded-full object-cover">
                    <i v-else :class="animal.icon" class="text-3xl"></i>
                  </div>
                  <span class="font-heading font-bold text-sm text-[#4b2707]">{{ animal.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Story Location Selection -->
            <div class="form-group">
              <label class="block font-heading font-bold text-lg text-[#4b2707] mb-2">Onde a História Acontece?</label>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="location in storyLocations" :key="location.id" 
                     @click="selectLocation(location)"
                     :class="[
                       'bg-[#fef1d6] p-3 rounded-md border-2 cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center text-center gap-2',
                       selectedLocation && selectedLocation.id === location.id ? 'border-primary shadow-md' : 'border-[#e2c08c]'
                     ]">
                  <div class="w-16 h-16 flex items-center justify-center text-tertiary">
                    <img v-if="location.image" :src="location.image" :alt="location.name" class="w-12 h-12 rounded-full object-cover">
                    <i v-else :class="location.icon" class="text-3xl"></i>
                  </div>
                  <span class="font-heading font-bold text-sm text-[#4b2707]">{{ location.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Voice Selection -->
            <div class="form-group mt-8">
              <label class="block font-heading font-bold text-lg text-[#4b2707] mb-2">Escolha o Narrador</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="voice in voiceOptions" :key="voice.id" 
                     @click="selectVoice(voice)"
                     :class="[
                       'bg-[#fef1d6] p-4 rounded-lg border-2 transition-all hover:shadow-lg',
                       selectedVoice && selectedVoice.id === voice.id ? 'border-primary shadow-md' : 'border-[#e2c08c]'
                     ]">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="flex-shrink-0">
                        <img 
                          :src="voice.avatar"
                          :alt="voice.name"
                          class="w-12 h-12 rounded-full"
                        />
                      </div>
                      <span class="text-lg font-medium text-[#4b2707]">{{ voice.name }}</span>
                    </div>
                    <button 
                      @click.stop="playVoicePreview(voice)"
                      :disabled="voice.isLoading"
                      class="bg-teal-500 hover:bg-teal-600 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
                      title="Ouvir prévia da voz"
                    >
                      <i :class="[
                        'text-lg',
                        voice.isLoading ? 'fas fa-spinner fa-spin' : 
                        isPreviewPlaying === voice.id ? 'fas fa-pause' : 'fas fa-play'
                      ]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Create Story Button -->
            <div class="mt-8">
              <button 
                @click="generateStory" 
                :disabled="!canGenerateStory"
                :class="['w-full py-4 font-heading font-bold text-xl transition-all btn-rustic', 
                  canGenerateStory ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-[#fef1d6] text-[#4b2707] cursor-not-allowed border-2 border-[#e2c08c]']">
                Criar História
              </button>
              <p v-if="!canGenerateStory" class="text-center text-[#4b2707] mt-2 font-body text-sm">
                Por favor, preencha todos os campos para continuar
              </p>
            </div>
          </div>
        </div>
        
        <!-- Hidden audio elements for voice previews -->
        <div style="display: none;">
          <audio 
            v-for="voice in voiceOptions" 
            :key="'preview-' + voice.id"
            :id="'preview-audio-' + voice.id"
            preload="none"
            @ended="audioEnded(voice)"
          >
            <source :src="voice.previewAudio" type="audio/mp3">
          </audio>
        </div>
        
        <!-- Loading Screen - Shown when generating story -->
        <div v-if="screen === 'generating'" class="bg-[#fae1b1]/60 rounded-lg p-8 shadow-lg border-2 border-[#e2c08c] card-rustic flex flex-col items-center justify-center min-h-[80vh]">
          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 relative overflow-hidden rounded-full">
              <div class="absolute inset-0 rounded-full bg-[#4b2707]/20 animate-pulse duration-1000"></div>
              <div class="absolute inset-4 rounded-full bg-[#4b2707]/40 animate-pulse duration-2000"></div>
              <i class="fas fa-feather-alt text-[#4b2707] text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
            </div>
            <h2 class="font-heading font-bold text-2xl text-[#4b2707] mb-8">Criando Sua História...</h2>
          </div>
          
          <!-- Progress Status -->
          <div class="max-w-md w-full">
            <div class="grid grid-cols-1 gap-6">
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.plot === 'done' ? 'bg-[#4b2707] text-white' : 
                  taskStatus.plot === 'processing' ? 'bg-[#4b2707]/60 text-white animate-pulse' : 
                  'bg-[#fef1d6] text-[#4b2707] border-2 border-[#e2c08c]']">
                  <i :class="[
                    taskStatus.plot === 'done' ? 'fas fa-check' : 
                    taskStatus.plot === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-[#4b2707] text-lg">Criando Enredo</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.story === 'done' ? 'bg-[#4b2707] text-white' : 
                  taskStatus.story === 'processing' ? 'bg-[#4b2707]/60 text-white animate-pulse' : 
                  'bg-[#fef1d6] text-[#4b2707] border-2 border-[#e2c08c]']">
                  <i :class="[
                    taskStatus.story === 'done' ? 'fas fa-check' : 
                    taskStatus.story === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-[#4b2707] text-lg">Escrevendo História</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.image === 'done' ? 'bg-[#4b2707] text-white' : 
                  taskStatus.image === 'processing' ? 'bg-[#4b2707]/60 text-white animate-pulse' : 
                  'bg-[#fef1d6] text-[#4b2707] border-2 border-[#e2c08c]']">
                  <i :class="[
                    taskStatus.image === 'done' ? 'fas fa-check' : 
                    taskStatus.image === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-[#4b2707] text-lg">Criando Ilustração</span>
              </div>
              
              <div class="flex items-center gap-3">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', 
                  taskStatus.audio === 'done' ? 'bg-[#4b2707] text-white' : 
                  taskStatus.audio === 'processing' ? 'bg-[#4b2707]/60 text-white animate-pulse' : 
                  'bg-[#fef1d6] text-[#4b2707] border-2 border-[#e2c08c]']">
                  <i :class="[
                    taskStatus.audio === 'done' ? 'fas fa-check' : 
                    taskStatus.audio === 'processing' ? 'fas fa-spinner fa-spin' : 
                    'fas fa-hourglass'
                  ]"></i>
                </div>
                <span class="font-body text-[#4b2707] text-lg">Gerando Narração</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Story Result Screen -->
        <div v-if="screen === 'result'" class="relative flex items-center justify-center min-h-[80vh]">
          <!-- Story Container -->
          <div class="bg-[#fae1b1]/60 rounded-lg p-8 shadow-lg border-2 border-[#e2c08c] relative overflow-hidden card-rustic w-full">
            <div class="flex flex-col items-center gap-8">
              <!-- Story Header -->
              <div class="flex flex-col items-center text-center">
                <!-- Story Image with Book Texture -->
                <div v-if="storyImage" class="relative w-full max-w-xs aspect-square rounded-lg mb-6 overflow-hidden shadow-lg">
                  <img :src="storyImage" alt="Story Illustration" class="w-full h-full object-cover absolute inset-0" @error="handleImageError" />
                  <div class="absolute inset-0 bg-[url('/assets/image/book-texture.svg')] bg-cover bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"></div>
                </div>
                <div v-else class="w-full max-w-xs rounded-lg shadow-md border-2 border-[#e2c08c] aspect-square bg-[#fef1d6] flex items-center justify-center mb-6">
                  <i class="fas fa-book-open text-5xl text-[#4b2707]"></i>
                </div>
                
                <!-- Story Title -->
                <div class="text-center w-full">
                  <h1 class="font-heading font-bold text-2xl text-[#4b2707] mb-4">{{ storyData?.title || 'Uma História Encantadora' }}</h1>
                </div>
              </div>
              
              <!-- Audio Player (show only if audio is available) -->
              <div v-if="audioSource" class="flex flex-col gap-2 mb-6 w-full max-w-md">
                <!-- Progress Bar -->
                <div class="w-full relative">
                  <div class="w-full h-1 bg-[#e2c08c] rounded-full cursor-pointer" @click="seekAudio">
                    <div class="h-1 bg-[#4b2707] rounded-full" :style="{ width: audioProgress + '%' }"></div>
                  </div>
                </div>
                
                <!-- Time Display -->
                <div class="flex justify-between w-full">
                  <span class="text-xs text-[#4b2707]">{{ formatTime(audioCurrentTime) }}</span>
                  <span class="text-xs text-[#4b2707]">{{ formatTime(audioDuration) }}</span>
                </div>
                
                <!-- Controls -->
                <div class="flex justify-center items-center gap-4 mt-4">
                  <button @click="downloadAudio" class="w-10 h-10 rounded-full bg-[#4b2707] flex items-center justify-center hover:bg-[#3e2212] transition-colors">
                    <i class="fas fa-download text-white"></i>
                  </button>
                  <button @click="toggleAudio" :disabled="audioLoading" class="w-16 h-16 rounded-full bg-[#4b2707] border-2 border-[#e2c08c] shadow-md flex items-center justify-center p-4 relative hover:bg-[#3e2212] transition-colors">
                    <i v-if="!audioLoading" :class="['fas', isPlaying ? 'fa-pause' : 'fa-play', 'text-white text-xl']"></i>
                    <!-- Loading spinner when audio is preparing -->
                    <div v-if="audioLoading" class="absolute inset-0 flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  </button>
                  <button @click="shareStory" class="w-10 h-10 rounded-full bg-[#4b2707] flex items-center justify-center hover:bg-[#3e2212] transition-colors">
                    <i class="fas fa-share-alt text-white"></i>
                  </button>
                </div>
                
                <!-- Audio loading message -->
                <div v-if="audioLoading" class="text-center text-xs text-[#4b2707] font-medium mt-2">
                  Preparando áudio... por favor aguarde
                </div>
              </div>
              
              <!-- Story Text -->
              <div class="prose prose-sm md:prose-base text-[#4b2707] font-body max-w-full">
                <div v-html="formattedStory" class="text-[#4b2707] space-y-4 px-2"></div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
                <button @click="goBack" class="btn-rustic bg-[#4b2707] hover:bg-[#3e2212] text-white font-heading font-bold py-3 px-6 flex-1 flex items-center justify-center gap-2 transition-colors">
                  <i class="fas fa-plus"></i> Criar Nova História
                </button>
                <router-link to="/my-stories" class="btn-rustic bg-[#4b2707] hover:bg-[#3e2212] text-white font-heading font-bold py-3 px-6 flex items-center justify-center gap-2 transition-colors">
                  <i class="fas fa-book"></i> Minhas Histórias
                </router-link>
              </div>
            </div>
          </div>
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
      selectedVoice: null, // Nova propriedade para a voz selecionada
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
      
      // Adicionar opções de voz
      voiceOptions: [
        {
          id: "D38z5RcWu1voky8WS1ja",
          name: "Tião",
          description: "O Guará Contador",
          animal: "Guará",
          avatar: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/guara.png",
          icon: "fas fa-feather-alt",
          voiceId: "D38z5RcWu1voky8WS1ja",
          previewAudio: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/tiao.mp3",
          isPlaying: false,
          isLoading: false,
          settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0,
            speed: 1.0
          }
        },
        {
          id: "jsCqWAovK2LkecY7zXl4",
          name: "Nala",
          description: "A Onça Narradora",
          animal: "Onça",
          avatar: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/onca.png",
          icon: "fas fa-paw",
          voiceId: "jsCqWAovK2LkecY7zXl4",
          previewAudio: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/nala.mp3",
          isPlaying: false,
          isLoading: false,
          settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0,
            speed: 1.0
          }
        },
        {
          id: "VR6AewLTigWG4xSOukaG",
          name: "Aruanã",
          description: "O Tatu Canastra",
          animal: "Tatu",
          avatar: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/tatu.png",
          icon: "fas fa-shield-alt",
          voiceId: "VR6AewLTigWG4xSOukaG",
          previewAudio: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/tatu.mp3",
          isPlaying: false,
          isLoading: false,
          settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0,
            speed: 1.0
          }
        },
        {
          id: "S9EY1qVDizdxKWghP5FL",
          name: "Nina",
          description: "A Arara Contadora",
          animal: "Arara",
          avatar: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/arara.png",
          icon: "fas fa-dove",
          voiceId: "S9EY1qVDizdxKWghP5FL",
          previewAudio: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/nina.mp3",
          isPlaying: false,
          isLoading: false,
          settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0,
            speed: 1.0
          }
        }
      ],
      
      // Brazilian Fauna Options with Font Awesome icons instead of images
      brazilianAnimals: [
        {
          id: 1,
          name: "Caxixi",
          icon: null,
          image: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/caxixi.png"
        },
        {
          id: 2,
          name: "Cerâmica",
          icon: "fas fa-paint-brush",
          image: null
        },
        {
          id: 3,
          name: "Samba de Roda",
          icon: "fas fa-music",
          image: null
        },
        {
          id: 4,
          name: "Berinbau",
          icon: "fas fa-guitar",
          image: null
        }
      ],
      
      // Story Locations with Font Awesome icons instead of images
      storyLocations: [
        {
          id: 1,
          name: "Mangue",
          icon: "fas fa-tree",
          image: null
        },
        {
          id: 2,
          name: "Aldeia",
          icon: "fas fa-home",
          image: null
        },
        {
          id: 3,
          name: "Rio",
          icon: null,
          image: "https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/rio.png"
        },
        {
          id: 4,
          name: "Praia",
          icon: "fas fa-umbrella-beach",
          image: null
        }
      ],
      isPreviewPlaying: null, // Track which voice preview is currently playing
    };
  },
  computed: {
    canGenerateStory() {
      return this.childName.trim() !== "" && 
             this.selectedAnimal !== null && 
             this.selectedLocation !== null &&
             this.selectedVoice !== null; // Adicionar verificação da voz
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
    
    selectVoice(voice) {
      // Parar qualquer preview que esteja tocando
      if (this.isPreviewPlaying) {
        const audioElement = document.getElementById(`preview-audio-${this.isPreviewPlaying}`);
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        this.isPreviewPlaying = null;
      }
      
      this.selectedVoice = voice;
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
              const imagePrompt = `Create a hand-drawn, rustic illustration showing a young girl interacting with clay pots. 
              IMPORTANT DETAILS:
              - Focus on the girl and the clay pots, with no text or words in the image
              - The girl should be depicted in a simple, child-friendly style
              - Show various clay pots of different sizes and shapes
              - Use a warm color palette with earthy tones like browns, soft reds, and yellows
              - The style should resemble a hand-drawn children's book illustration with visible pencil/crayon strokes
              - Keep the background simple and uncluttered
              - No text, words, or speech bubbles should appear in the image`;
              
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
              console.log("Starting audio generation with voice:", this.selectedVoice.name);
              
              const audioText = `${storyObject.title}. ${storyObject.plot}`;
              
              const audioResponse = await sdk.ai.generateAudio({
                model: "elevenlabs:tts",
                prompt: audioText,
                providerOptions: {
                  elevenLabs: {
                    voiceId: this.selectedVoice.voiceId,
                    model_id: "eleven_turbo_v2_5",
                    optimize_streaming_latency: 0,
                    output_format: "mp3",
                    voice_settings: this.selectedVoice.settings
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
      // Limpar áudio em reprodução
      if (this.isPreviewPlaying) {
        const audioElement = document.getElementById(`preview-audio-${this.isPreviewPlaying}`);
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        this.isPreviewPlaying = null;
      }

      // Limpar áudio principal se estiver tocando
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
      }

      // Resetar o estado do formulário
      this.childName = "";
      this.selectedAnimal = null;
      this.selectedLocation = null;
      this.selectedVoice = null;
      this.storyData = null;
      this.storyImage = null;
      this.audioSource = null;
      this.audioLoading = false;
      this.isPlaying = false;
      this.audioProgress = 0;
      this.audioDuration = 0;
      this.audioCurrentTime = 0;

      // Limpar intervalos de verificação
      if (this.audioCheckInterval) {
        clearInterval(this.audioCheckInterval);
        this.audioCheckInterval = null;
      }

      // Resetar status das tasks
      this.taskStatus = {
        plot: "waiting",
        story: "waiting",
        image: "waiting",
        audio: "waiting"
      };

      // Voltar para a tela do formulário
      this.screen = "form";

      // Usar nextTick para garantir que a mudança de tela seja processada antes de qualquer outra operação
      this.$nextTick(() => {
        // Limpar qualquer texto formatado ou streaming
        this.streamingText = "";
        this.formattedStory = "";
      });
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
            console.warn("⚠️ Erro de cota excedida ao salvar, tentando gerenciar armazenamento");
            
            // Remover a história que tentamos adicionar
            savedStories.pop();
            
            // Tentar gerenciar o armazenamento
            const storageManaged = await this.manageStorage();
            
            if (storageManaged) {
              // Tentar salvar novamente após liberar espaço
              try {
                savedStories.push(compressedStory);
                localStorage.setItem("savedStories", JSON.stringify(savedStories));
                console.log("✅ História salva com sucesso após gerenciar armazenamento");
              } catch (retryError) {
                console.error("❌ Erro ao salvar mesmo após gerenciar armazenamento:", retryError);
                if (!isAutoSave) {
                  alert("Não foi possível salvar sua história. O armazenamento local está cheio mesmo após otimização.");
                }
              }
            } else {
              console.error("❌ Não foi possível liberar espaço suficiente");
              if (!isAutoSave) {
                alert("Não foi possível salvar sua história. O armazenamento local está completamente cheio.");
              }
            }
          }
        } catch (error) {
          console.error("❌ Erro ao acessar localStorage:", error);
          if (!isAutoSave) {
            alert("Ocorreu um erro ao tentar salvar sua história. Por favor, tente novamente.");
          }
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
      try {
        console.log("Setting permissions for story files before sharing...");
        
        // First set permissions on any files before trying to share
        this.ensureStoryIsPubliclyAccessible();
        
        // Define the production URL for sharing
        const PRODUCTION_ORIGIN = "https://webdraw.com/apps/ai-storyteller";
        
        // Determine if we're on localhost for development
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('192.168.');
        
        // Use localhost for development, production URL otherwise
        let baseUrl;
        if (isLocalhost) {
            baseUrl = window.location.origin;
            console.log("Using localhost URL for sharing (development mode):", baseUrl);
        } else {
            baseUrl = PRODUCTION_ORIGIN;
            console.log("Using production URL for sharing:", baseUrl);
        }
        
        // Default to current URL
        let shareUrl = window.location.href;
        
        // Track share event with PostHog
        if (sdk && sdk.posthogEvent) {
            sdk.posthogEvent("story_shared", {
                story_title: this.storyData.title || "Untitled Story"
            });
        }
        
        // Try to use the Web Share API if available
        if (navigator.share) {
            console.log("Web Share API is available, attempting to share...");
            
            navigator.share({
                title: this.storyData.title || "Shared Story",
                text: 'Confira esta história incrível que criei com IA!',
                url: shareUrl
            })
            .then(() => console.log('Successful share'))
            .catch((error) => {
                console.error("Error sharing:", error);
                this.fallbackShare(shareUrl);
            });
        } else {
            console.log("Web Share API not available, using fallback...");
            this.fallbackShare(shareUrl);
        }
      } catch (overallError) {
          console.error("Unexpected error in shareStory:", overallError);
          alert('Erro ao compartilhar. Por favor, tente novamente.');
      }
    },
    
    // New method to ensure the story is publicly accessible
    async ensureStoryIsPubliclyAccessible() {
      try {
        console.log("Ensuring story is publicly accessible...");
        
        // Get current working directory
        if (sdk && sdk.fs && typeof sdk.fs.cwd === 'function') {
          const cwdPath = await sdk.fs.cwd();
          console.log("Current working directory:", cwdPath);
          
          // First, let's make sure the AI Storyteller directory exists and has correct permissions
          // Extract the user directory from the path
          const userDirMatch = cwdPath.match(/^\/users\/([^\/]+)/);
          if (!userDirMatch) {
            console.warn("Could not determine user directory from path:", cwdPath);
            return false;
          }
          
          const userId = userDirMatch[1];
          console.log("User ID:", userId);
          
          // Try different possible locations for the AI Storyteller directory
          const possibleDirectories = [
            `/users/${userId}/AI Storyteller`,
            `/users/${userId}/Apps/AI Storyteller`,
            `/users/${userId}/Apps/fabula/AI Storyteller`,
            cwdPath + "/AI Storyteller"
          ];
          
          // Try to find and set permissions on any directories we can
          let foundDirectories = 0;
          for (const dir of possibleDirectories) {
            try {
              const exists = await sdk.fs.exists(dir);
              if (exists) {
                console.log(`Found AI Storyteller directory: ${dir}`);
                const success = await this.setFileAccess(dir);
                if (success) {
                  console.log(`✅ Set permissions for directory: ${dir}`);
                  foundDirectories++;
                }
                
                // Also check for localStorage file in this directory
                const localStoragePath = `${dir}/localStorage`;
                const localStorageExists = await sdk.fs.exists(localStoragePath);
                if (localStorageExists) {
                  console.log(`Found localStorage file: ${localStoragePath}`);
                  const success = await this.setFileAccess(localStoragePath);
                  if (success) {
                    console.log(`✅ Set permissions for localStorage file: ${localStoragePath}`);
                  }
                }
                
                // Check for any JSON files in this directory
                try {
                  const files = await sdk.fs.list(dir);
                  if (Array.isArray(files)) {
                    console.log(`Found ${files.length} files in ${dir}`);
                    let jsonCount = 0;
                    
                    // Process each file
                    for (const file of files) {
                      // Handle different return formats
                      let filePath;
                      if (typeof file === 'string') {
                        filePath = file;
                      } else if (file && typeof file === 'object') {
                        filePath = file.path || `${dir}/${file.name}`;
                      } else {
                        continue;
                      }
                      
                      // Check if it's a JSON file
                      if (filePath.endsWith('.json')) {
                        console.log(`Found JSON file: ${filePath}`);
                        const success = await this.setFileAccess(filePath);
                        if (success) {
                          console.log(`✅ Set permissions for JSON file: ${filePath}`);
                          jsonCount++;
                        }
                      }
                    }
                    
                    console.log(`Set permissions for ${jsonCount} JSON files in ${dir}`);
                  }
                } catch (listError) {
                  console.warn(`Could not list files in ${dir}:`, listError);
                }
              }
            } catch (dirError) {
              console.warn(`Error checking directory ${dir}:`, dirError);
            }
          }
          
          // If we found and fixed permissions on any directories, consider it a success
          if (foundDirectories > 0) {
            console.log(`✅ Set permissions for ${foundDirectories} AI Storyteller directories`);
            
            // Additionally, check for image and audio files that might need permissions
            const mediaDirectories = [
              `/users/${userId}/Pictures`,
              `/users/${userId}/Audio`
            ];
            
            for (const mediaDir of mediaDirectories) {
              try {
                const exists = await sdk.fs.exists(mediaDir);
                if (exists) {
                  console.log(`Found media directory: ${mediaDir}`);
                  await this.setFileAccess(mediaDir);
                  
                  // If this story has image or audio, make sure those files have permissions
                  if (this.storyImage && this.storyImage.includes('fs.webdraw.com')) {
                    try {
                      const imageUrl = new URL(this.storyImage);
                      const imagePath = imageUrl.pathname;
                      console.log(`Setting permissions for image: ${imagePath}`);
                      await this.setFileAccess(imagePath);
                    } catch (imageError) {
                      console.warn("Error setting permissions for image:", imageError);
                    }
                  }
                  
                  if (this.audioSource && this.audioSource.includes('fs.webdraw.com')) {
                    try {
                      const audioUrl = new URL(this.audioSource);
                      const audioPath = audioUrl.pathname;
                      console.log(`Setting permissions for audio: ${audioPath}`);
                      await this.setFileAccess(audioPath);
                    } catch (audioError) {
                      console.warn("Error setting permissions for audio:", audioError);
                    }
                  }
                }
              } catch (mediaError) {
                console.warn(`Error checking media directory ${mediaDir}:`, mediaError);
              }
            }
            
            return true;
          }
          
          console.warn("Could not find any AI Storyteller directories");
          return false;
        } else {
          console.warn("sdk.fs.cwd is not available");
          return false;
        }
      } catch (error) {
        console.error("Error ensuring story is publicly accessible:", error);
        return false;
      }
    },
    
    fallbackShare(url) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url).then(() => {
          // Show toast notification
          alert('Link copiado para a área de transferência!');
      }).catch(err => {
          console.error('Failed to copy:', err);
          // Alternative fallback using document.execCommand
          try {
              const textArea = document.createElement('textarea');
              textArea.value = url;
              textArea.style.position = 'fixed';  // Avoid scrolling to bottom
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              
              const successful = document.execCommand('copy');
              document.body.removeChild(textArea);
              
              if (successful) {
                  alert('Link copiado para a área de transferência!');
              } else {
                  alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente: ' + url);
              }
          } catch (execError) {
              console.error('Failed to copy using execCommand:', execError);
              alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente: ' + url);
          }
      });
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
    
    // Method for setting file access to public using ACL
    async setFileAccess(filepath) {
      if (!filepath) return false;
      
      try {
        // Normalize path, remove leading/trailing spaces and ensure it starts with "/"
        const normalizedPath = filepath.trim().startsWith('/') ? filepath.trim() : `/${filepath.trim()}`;
        console.log(`Setting public permissions for file: ${normalizedPath}`);
        
        // Check if the file exists
        const exists = await sdk.fs.exists(normalizedPath);
        if (!exists) {
          console.warn(`File does not exist: ${normalizedPath}`);
          return false;
        }
        
        // Set file permissions using chmod only - the other methods aren't available
        if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
          await sdk.fs.chmod(normalizedPath, 0o644); // Use 0o644 (rw-r--r--) to ensure web server can access the files
          console.log(`✅ Set public permissions (0o644) for: ${normalizedPath}`);
          return true;
        } else {
          console.warn(`⚠️ chmod method not available in sdk.fs`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Error setting permissions for file: ${error.message}`);
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
    
    playVoicePreview(voice) {
      // Get the audio element for this voice
      const audioElement = document.getElementById(`preview-audio-${voice.id}`);
      if (!audioElement) {
        console.error(`Audio element for voice ${voice.name} not found`);
        return;
      }

      if (this.isPreviewPlaying === voice.id) {
        // User clicked the same voice that's currently playing - pause it
        audioElement.pause();
        this.isPreviewPlaying = null;
        return;
      }

      // If another voice preview is playing, stop it first
      if (this.isPreviewPlaying) {
        const previousAudio = document.getElementById(`preview-audio-${this.isPreviewPlaying}`);
        if (previousAudio) {
          previousAudio.pause();
          previousAudio.currentTime = 0;
        }
        this.isPreviewPlaying = null;
      }

      voice.isLoading = true;

      // Try to play the audio
      audioElement.play()
        .then(() => {
          voice.isLoading = false;
          this.isPreviewPlaying = voice.id;
          console.log(`Successfully playing audio for ${voice.name}`);
        })
        .catch(playError => {
          console.error(`Error playing audio for ${voice.name}:`, playError);
          voice.isLoading = false;
          alert(`Não foi possível reproduzir o preview de áudio para ${voice.name}. O arquivo de áudio pode estar indisponível.`);
        });
    },
    
    audioEnded(voice) {
      if (this.isPreviewPlaying === voice.id) {
        this.isPreviewPlaying = null;
      }
    },
    
    stopVoicePreview(voice) {
      const audioElement = document.getElementById(`preview-audio-${voice.id}`);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    },

    // Método para obter uma imagem de fallback aleatória
    getRandomFallbackImage() {
      const fallbackImages = [
        'https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/fallback/story_1.jpg',
        'https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/fallback/story_2.jpg',
        'https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/fallback/story_3.jpg'
      ];
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    },

    // Método para gerenciar o armazenamento quando exceder a cota
    async manageStorage() {
      try {
        // Obter histórias salvas
        const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
        
        if (savedStories.length === 0) return true;
        
        console.log(`📦 Gerenciando armazenamento - ${savedStories.length} histórias encontradas`);
        
        // Se temos mais de 10 histórias, remover as mais antigas
        if (savedStories.length > 10) {
          console.log("🔄 Removendo histórias antigas para liberar espaço");
          // Ordenar por data de criação e manter apenas as 10 mais recentes
          savedStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const storiestoKeep = savedStories.slice(0, 10);
          
          try {
            localStorage.setItem("savedStories", JSON.stringify(storiestoKeep));
            console.log(`✅ Armazenamento otimizado - mantidas ${storiestoKeep.length} histórias mais recentes`);
            return true;
          } catch (error) {
            console.warn("⚠️ Ainda sem espaço após remover histórias antigas");
          }
        }
        
        // Se ainda não temos espaço, tentar remover imagens base64 das histórias mais antigas
        console.log("🔄 Tentando remover imagens base64 das histórias mais antigas");
        for (let i = 0; i < savedStories.length; i++) {
          if (savedStories[i].imageBase64) {
            delete savedStories[i].imageBase64;
            // Garantir que temos uma URL de fallback se necessário
            if (savedStories[i].image && savedStories[i].image.startsWith('data:')) {
              savedStories[i].image = this.getRandomFallbackImage();
            }
            
            try {
              localStorage.setItem("savedStories", JSON.stringify(savedStories));
              console.log(`✅ Espaço liberado removendo base64 da história ${i + 1}`);
              return true;
            } catch (error) {
              console.warn(`⚠️ Ainda sem espaço após remover base64 da história ${i + 1}`);
              continue;
            }
          }
        }
        
        // Se ainda não temos espaço, remover a história mais antiga
        if (savedStories.length > 0) {
          savedStories.shift();
          try {
            localStorage.setItem("savedStories", JSON.stringify(savedStories));
            console.log("✅ Espaço liberado removendo a história mais antiga");
            return true;
          } catch (error) {
            console.error("❌ Não foi possível liberar espaço mesmo removendo história");
            return false;
          }
        }
        
        return false;
      } catch (error) {
        console.error("❌ Erro ao gerenciar armazenamento:", error);
        return false;
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
    
    // Limpar todos os previews de áudio
    this.voiceOptions.forEach(voice => {
      const audioElement = document.getElementById(`preview-audio-${voice.id}`);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    });
    
    // Stop any playing preview
    if (this.isPreviewPlaying) {
      const audioElement = document.getElementById(`preview-audio-${this.isPreviewPlaying}`);
      if (audioElement) {
        audioElement.pause();
      }
    }
  }
};

