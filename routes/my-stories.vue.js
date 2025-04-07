import { sdk } from "../sdk.js";

window.MyStoriesPage = {
  template: `
    <div class="min-h-screen bg-neutral-light">
      <!-- Background pattern -->
      <div class="absolute inset-0 z-0">
        <img src="/assets/image/caxixi2.png" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-30 filter sepia-[0.3] brightness-[1.1] saturate-[1.2]" />
      </div>
      
      <!-- Navigation Header -->
      <nav class="relative z-10 py-3 px-4 sm:px-6 mb-4">
        <div class="flex justify-between items-center">
          <!-- Back button with rustic style -->
          <router-link 
            to="/" 
            class="flex items-center gap-1 py-2 px-4 bg-transparent border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#3e2212]/10 rounded-xl font-heading font-medium text-sm transition-all duration-200 chalk-texture"
          >
            <i class="fas fa-arrow-left mr-1"></i> Voltar
          </router-link>
          
          <!-- Create Story Button -->
          <router-link 
            to="/create" 
            class="flex items-center gap-1 py-2 px-4 bg-[#eecd88] border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#eecd88]/90 rounded-xl font-heading font-medium text-sm transition-all duration-200 chalk-texture drop-shadow-[2px_2px_0_#3e2212]"
          >
            <i class="fas fa-plus mr-1"></i> Nova História
          </router-link>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 pt-4 pb-16 relative z-10">
        <div class="bg-[#fae1b1]/60 rounded-lg p-8 shadow-lg border-2 border-[#e2c08c] card-rustic">
          <div class="mb-8 text-center">
            <h1 class="font-heading font-bold text-3xl text-[#4b2707] mb-2">Minhas Histórias</h1>
          </div>

          <!-- Stories Grid -->
          <div v-if="stories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div v-for="story in stories" :key="story.id" class="bg-[#fef1d6] rounded-lg overflow-hidden shadow-lg border-2 border-[#e2c08c] card-rustic">
              <div class="flex flex-col h-full">
                <!-- Story Image - Square format -->
                <div class="aspect-square overflow-hidden bg-[#fef1d6] flex items-center justify-center relative">
                  <img v-if="story.image" :src="story.image" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                  <img v-else-if="story.imageBase64" :src="story.imageBase64" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                  <i v-else class="fas fa-book-open text-4xl text-[#4b2707]"></i>
                </div>

                <!-- Story Info -->
                <div class="p-4 flex flex-col flex-grow">
                  <h2 class="font-heading font-bold text-lg md:text-xl text-[#4b2707] mb-2">{{ story.title }}</h2>
                  
                  <div class="flex gap-2 mb-3">
                    <span class="bg-[#fae1b1] text-xs font-medium px-2 py-1 rounded border-2 border-[#e2c08c] text-[#4b2707] truncate max-w-[120px]" :title="story.animal">{{ story.animal }}</span>
                    <span class="bg-[#fae1b1] text-xs font-medium px-2 py-1 rounded border-2 border-[#e2c08c] text-[#4b2707] truncate max-w-[120px]" :title="story.location">{{ story.location }}</span>
                  </div>

                  <p class="text-[#4b2707] text-xs md:text-sm mb-4 line-clamp-3">
                    {{ story.content.substring(0, 100) }}...
                  </p>
                  
                  <div class="text-xs text-[#4b2707] font-medium mb-4 mt-auto">
                    Criado em {{ formatDate(story.createdAt) }}
                  </div>

                  <!-- Story Actions -->
                  <div class="flex justify-between gap-2">
                    <button @click="viewStory(story)" class="flex-1 py-2 px-3 bg-transparent border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#3e2212]/10 rounded-xl font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1 transition-all duration-200 chalk-texture">
                      <i class="fas fa-book-open"></i> Ler
                    </button>
                    
                    <button @click="deleteStory(story)" class="flex-1 py-2 px-3 bg-[#eecd88] border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#eecd88]/90 rounded-xl font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1 transition-all duration-200 chalk-texture drop-shadow-[2px_2px_0_#3e2212]">
                      <i class="fas fa-trash"></i> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
                    
          <!-- Empty State -->
          <div v-else class="bg-[#fef1d6] rounded-lg p-8 shadow-lg border-2 border-[#e2c08c] text-center card-rustic">
            <div class="mb-8">
              <div class="w-24 h-24 mx-auto mb-4 relative">
                <i class="fas fa-book text-[#4b2707] text-4xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                <div class="absolute inset-0 rounded-full bg-[#4b2707]/10"></div>
                <div class="absolute inset-3 rounded-full bg-[#4b2707]/20"></div>
              </div>
              <h2 class="font-heading font-bold text-2xl text-[#4b2707]">Nenhuma História Ainda</h2>
              <p class="text-[#4b2707] mt-2 font-body mb-6">Você ainda não criou nenhuma história personalizada</p>
              
              <router-link to="/create" class="inline-flex justify-center items-center gap-2 py-3 px-6 bg-[#eecd88] border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#eecd88]/90 rounded-xl font-heading font-bold text-lg transition-all duration-200 chalk-texture drop-shadow-[2px_2px_0_#3e2212]">
                <i class="fas fa-plus"></i> Criar Minha Primeira História
              </router-link>
            </div>
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
    this.loadStories();
  },
  methods: {
    loadStories() {
      try {
        const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
        this.stories = savedStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error("Error loading stories:", error);
        this.stories = [];
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Hoje às " + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Ontem às " + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    
    viewStory(story) {
      try {
        console.log(`👁️ Abrindo história: ${story.id} - ${story.title}`);
        
        // Garantir que usamos imageBase64 quando disponível
        const storyToSave = { ...story };
        if (story.imageBase64) {
          console.log(`🖼️ Usando imageBase64 para visualização`);
          storyToSave.image = story.imageBase64;
        }
        
        // Tentar salvar a história completa primeiro
        try {
          localStorage.setItem('currentStory', JSON.stringify(storyToSave));
          console.log("✅ História salva com sucesso no localStorage como currentStory");
          // Navigate to story page
          this.$router.push('/story');
        } catch (quotaError) {
          console.warn("⚠️ Erro de cota excedida, tentando comprimir imagem:", quotaError);
          this.saveStoryWithoutImage(story);
        }
      } catch (error) {
        console.error("❌ Erro ao abrir história:", error);
        alert("Erro ao abrir história. Por favor, tente novamente.");
      }
    },
    
    async deleteStory(story) {
      if (confirm(`Tem certeza que deseja excluir "${story.title}"? Esta ação não pode ser desfeita.`)) {
        try {
          const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
          const updatedStories = savedStories.filter(s => s.id !== story.id);
          localStorage.setItem("savedStories", JSON.stringify(updatedStories));
          this.stories = updatedStories;
        } catch (error) {
          console.error("Error deleting story:", error);
          alert("Erro ao excluir história. Por favor, tente novamente.");
        }
      }
    },
    
    handleImageError(event, story) {
      console.warn(`⚠️ Erro ao carregar imagem para história: ${story.title}`);
      event.target.src = '/assets/image/fallback/story_1.jpg';
    },
    
    // Método auxiliar para salvar história sem as imagens base64
    saveStoryWithoutImage(story) {
      try {
        console.log("🔄 Tentando salvar história sem imagem base64");
        
        // Criar uma versão da história sem o imageBase64
        const lightStory = { ...story };
        
        // Remover o imageBase64 grande
        lightStory.imageBase64 = null;
        
        // Se a imagem atual é base64, substitui por uma imagem fallback
        if (lightStory.image && lightStory.image.startsWith('data:')) {
          lightStory.image = '/assets/image/ex1.webp'; // Imagem de fallback
        }
        
        try {
          localStorage.setItem('currentStory', JSON.stringify(lightStory));
          console.log("✅ História salva sem a imagem base64");
          this.$router.push('/story');
        } catch (finalError) {
          console.error("❌ Falha total ao salvar história:", finalError);
          alert("Não foi possível carregar a história devido a limitações de armazenamento. Tente excluir outras histórias para liberar espaço.");
        }
      } catch (error) {
        console.error("❌ Erro ao salvar versão leve da história:", error);
        alert("Erro ao preparar a história para visualização.");
      }
    }
  }
};

export default window.MyStoriesPage;
