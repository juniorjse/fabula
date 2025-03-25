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
            </div>
          </div>
        </div>
        
        <!-- Story Result Screen -->
        <div v-if="screen === 'result'" class="relative">
          <!-- Story Container -->
          <div class="bg-neutral-light/90 rounded-lg p-8 shadow-lg border border-neutral-dark relative overflow-hidden">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Story Image -->
              <div class="md:w-1/3 flex-shrink-0">
                <div class="w-full rounded-md shadow-md border border-neutral-dark aspect-square bg-tertiary-light flex items-center justify-center">
                  <i class="fas fa-book-open text-5xl text-secondary"></i>
                </div>
              </div>
              
              <!-- Story Text -->
              <div class="md:w-2/3">
                <h1 class="font-heading font-bold text-2xl md:text-3xl text-secondary-dark mb-4">{{ storyData?.title || 'Uma História Encantadora' }}</h1>
                
                <div class="prose prose-sm md:prose-base text-neutral-dark font-body mb-8">
                  <p v-html="formattedStory"></p>
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
          </div>
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
      taskStatus: {
        plot: "waiting",
        story: "waiting",
        image: "waiting",
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
      
      // Start plot generation
      this.taskStatus.plot = "processing";
      
      // For the POC, simulate an API call with setTimeout
      setTimeout(() => {
        this.taskStatus.plot = "done";
        this.taskStatus.story = "processing";
        
        // Simulate story generation
        setTimeout(() => {
          this.taskStatus.story = "done";
          this.taskStatus.image = "processing";
          
          // Simulate image generation
            setTimeout(() => {
            this.taskStatus.image = "done";
            
            // Create mock story data
            this.storyData = {
              title: `${this.childName} e o ${this.selectedAnimal.name} na ${this.selectedLocation.name}`,
              content: this.generateMockStory()
            };
            
            // Set mock image (for POC, just using the animal image)
            this.storyImage = this.selectedLocation.image;
            
            // Format the story text
            this.formattedStory = this.formatStoryText(this.storyData.content);
            
            // Change to result screen
          this.screen = "result";
          }, 3000); // 3 seconds for image generation
        }, 4000); // 4 seconds for story generation
      }, 2000); // 2 seconds for plot generation
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
          childName: this.childName,
        animal: this.selectedAnimal.name,
        location: this.selectedLocation.name,
        createdAt: new Date().toISOString()
      };
      
      savedStories.push(newStory);
      localStorage.setItem("savedStories", JSON.stringify(savedStories));
      
      // Redirect to my stories page
      this.$router.push("/my-stories");
    }
  }
};

