import { sdk } from "../sdk.js";

window.MyStoriesPage = {
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
          
          <!-- Create Story Button -->
          <router-link to="/create" class="flex items-center gap-1 py-2 px-4 bg-primary hover:bg-primary-dark btn-rustic text-white font-heading font-medium text-sm shadow-md transition-all duration-200">
            <i class="fas fa-plus mr-1"></i> Nova História
                </router-link>
                </div>
              </nav>

            <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 pt-4 relative z-10">
        <div class="mb-8 text-center">
          <h1 class="font-heading font-bold text-3xl text-secondary-dark mb-2">Minhas Histórias</h1>
          <p class="text-black font-body">Histórias personalizadas da fauna brasileira criadas para você</p>
                    </div>
        
        <!-- Stories Grid -->
        <div v-if="stories.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="story in stories" :key="story.id" class="bg-neutral-light/70 rounded-lg overflow-hidden shadow-lg border border-neutral-dark card-rustic">
            <div class="flex flex-col h-full">
              <!-- Story Image -->
              <div class="h-48 overflow-hidden bg-tertiary flex items-center justify-center relative">
                <img v-if="story.image" :src="story.image" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                <img v-else-if="story.imageBase64" :src="story.imageBase64" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                <i v-else class="fas fa-book-open text-4xl text-white"></i>
                </div>

              <!-- Story Info -->
              <div class="p-4 flex flex-col flex-grow">
                <h2 class="font-heading font-bold text-xl text-secondary-dark mb-2">{{ story.title }}</h2>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="bg-tertiary/20 text-xs font-medium px-2 py-1 rounded text-secondary-dark">{{ story.animal }}</span>
                  <span class="bg-accent/20 text-xs font-medium px-2 py-1 rounded text-primary-dark">{{ story.location }}</span>
                </div>

                <p class="text-black text-sm mb-4 line-clamp-3">
                  {{ story.content.substring(0, 120) }}...
                </p>
                
                <div class="text-xs text-gray-700 font-medium mb-4 mt-auto">
                  Criado em {{ formatDate(story.createdAt) }}
                </div>

                <!-- Story Actions -->
                <div class="flex justify-between gap-2">
                  <button @click="viewStory(story)" class="flex-1 py-2 px-3 btn-rustic bg-neutral hover:bg-neutral-dark text-secondary-dark font-heading font-medium text-sm flex items-center justify-center gap-1">
                    <i class="fas fa-book-open"></i> Ler
                                </button>
                  
                  <button @click="deleteStory(story)" class="flex-1 py-2 px-3 btn-rustic bg-primary hover:bg-primary-dark text-white font-heading font-medium text-sm flex items-center justify-center gap-1">
                    <i class="fas fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                        </div>
                    </div>
                    
        <!-- Empty State -->
        <div v-else class="bg-neutral-light/70 rounded-lg p-8 shadow-lg border border-neutral-dark text-center card-rustic">
          <div class="mb-8">
            <div class="w-24 h-24 mx-auto mb-4 relative">
              <i class="fas fa-book text-primary text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
              <div class="absolute inset-0 rounded-full bg-primary/10"></div>
              <div class="absolute inset-3 rounded-full bg-primary/20"></div>
            </div>
            <h2 class="font-heading font-bold text-2xl text-secondary-dark">Nenhuma História Ainda</h2>
            <p class="text-black mt-2 font-body mb-6">Você ainda não criou nenhuma história personalizada</p>
            
            <router-link to="/create" class="inline-flex justify-center items-center gap-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-heading font-bold text-lg transition-all btn-rustic">
              <i class="fas fa-plus"></i> Criar Minha Primeira História
            </router-link>
            </div>
        </div>
      </main>
        </div>
    `,
  data() {
    return {
      stories: []
    };
  },
  mounted() {
    // Load stories from localStorage (for the POC)
    this.loadStories();
  },
  methods: {
    loadStories() {
      // For the POC, just load from localStorage
      const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
      this.stories = savedStories;
    },
    
    formatDate(dateString) {
      if (!dateString) return "";
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    viewStory(story) {
      // For the POC, store the story in localStorage and navigate to the story page
      console.log("Abrindo história:", story);
      console.log("ID da história:", story.id);
      console.log("Conteúdo completo da história:", JSON.stringify(story));
      console.log("Título:", story.title);
      console.log("Propriedade content:", story.content ? story.content.substring(0, 50) + "..." : "undefined");
      console.log("Propriedade story:", story.story ? story.story.substring(0, 50) + "..." : "undefined");
        
      // Salvar a história atual no localStorage
      try {
        localStorage.setItem("currentStory", JSON.stringify(story));
        console.log("História salva no localStorage com sucesso");
      } catch (error) {
        console.error("Erro ao salvar história no localStorage:", error);
      }
      
      // Navegar para a página da história
      console.log("Navegando para:", `/story?id=${story.id}`);
      this.$router.push(`/story?id=${story.id}`);
    },
    
    deleteStory(story) {
      if (confirm(`Tem certeza que deseja excluir "${story.title}"?`)) {
        // Remove the story from the array
        this.stories = this.stories.filter(s => s.id !== story.id);
        
        // Update localStorage
        localStorage.setItem("savedStories", JSON.stringify(this.stories));
      }
    },
    
    handleImageError(event, story) {
      console.error("Error loading image:", event);
      
      // Try to use imageBase64 if available
      if (story.imageBase64 && event.target.src !== story.imageBase64) {
        event.target.src = story.imageBase64;
        return;
      }
      
      // Otherwise just show the icon (by removing the image)
      event.target.style.display = 'none';
    }
  }
};

// Export for module systems while maintaining window compatibility
export default window.MyStoriesPage;
