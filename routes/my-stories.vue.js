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
        <div v-if="stories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div v-for="story in stories" :key="story.id" class="bg-neutral-light/70 rounded-lg overflow-hidden shadow-lg border border-neutral-dark card-rustic">
            <div class="flex flex-col h-full">
              <!-- Story Image - Square format -->
              <div class="aspect-square overflow-hidden bg-tertiary flex items-center justify-center relative">
                <img v-if="story.image" :src="story.image" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                <img v-else-if="story.imageBase64" :src="story.imageBase64" :alt="story.title" class="w-full h-full object-cover absolute inset-0" @error="handleImageError($event, story)" />
                <i v-else class="fas fa-book-open text-4xl text-white"></i>
                </div>

              <!-- Story Info -->
              <div class="p-3 md:p-4 flex flex-col flex-grow">
                <h2 class="font-heading font-bold text-lg md:text-xl text-secondary-dark mb-2">{{ story.title }}</h2>
                
                <div class="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                  <span class="bg-tertiary/20 text-xs font-medium px-2 py-1 rounded text-secondary-dark">{{ story.animal }}</span>
                  <span class="bg-accent/20 text-xs font-medium px-2 py-1 rounded text-primary-dark">{{ story.location }}</span>
                </div>

                <p class="text-black text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">
                  {{ story.content.substring(0, 100) }}...
                </p>
                
                <div class="text-xs text-gray-700 font-medium mb-3 md:mb-4 mt-auto">
                  Criado em {{ formatDate(story.createdAt) }}
                </div>

                <!-- Story Actions -->
                <div class="flex justify-between gap-2">
                  <button @click="viewStory(story)" class="flex-1 py-2 px-3 btn-rustic bg-neutral hover:bg-neutral-dark text-secondary-dark font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1">
                    <i class="fas fa-book-open"></i> Ler
                                </button>
                  
                  <button @click="deleteStory(story)" class="flex-1 py-2 px-3 btn-rustic bg-primary hover:bg-primary-dark text-white font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1">
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
    // Load saved stories from localStorage
    const savedStoriesJson = localStorage.getItem('savedStories');
    console.log("📚 Carregando histórias salvas do localStorage");
    
    if (savedStoriesJson) {
      try {
        this.stories = JSON.parse(savedStoriesJson);
        console.log(`📋 Número de histórias carregadas: ${this.stories.length}`);
        
        // Processar cada história para usar imageBase64 quando disponível
        this.stories = this.stories.map(story => {
          const processedStory = { ...story };
          
          // Se temos imageBase64, usá-lo como source principal
          if (story.imageBase64) {
            console.log(`🖼️ História "${story.title}" tem imageBase64, usando como imagem principal`);
            processedStory.image = story.imageBase64;
          } 
          // Se não temos imageBase64 mas temos URL, logar
          else if (story.image && story.image.startsWith('http')) {
            console.log(`⚠️ História "${story.title}" usa URL externa: ${story.image}`);
          }
          
          return processedStory;
        });
      } catch (error) {
        console.error('Error parsing saved stories:', error);
        this.stories = [];
      }
              } else {
      console.log("⚠️ Nenhuma história encontrada no localStorage");
      this.stories = [];
    }
  },
  methods: {
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
          
          // Se temos base64, tentar comprimir
          if (storyToSave.imageBase64) {
            try {
              // Comprimir a imagem para 50% da qualidade
              this.compressImage(storyToSave.imageBase64, 0.5)
                .then(compressedImage => {
                  if (compressedImage) {
                    const originalSize = Math.round((storyToSave.imageBase64.length * 3) / 4);
                    const compressedSize = Math.round((compressedImage.length * 3) / 4);
                    
                    console.log(`🗜️ Imagem comprimida: ${this.formatFileSize(originalSize)} → ${this.formatFileSize(compressedSize)}`);
                    
                    const compressedStory = { ...storyToSave };
                    compressedStory.imageBase64 = compressedImage;
                    compressedStory.image = compressedImage;
                    
                    try {
                      localStorage.setItem('currentStory', JSON.stringify(compressedStory));
                      console.log("✅ História salva com imagem comprimida");
                      this.$router.push('/story');
                    } catch (compressError) {
                      console.error("❌ Erro ao salvar mesmo com imagem comprimida:", compressError);
                      this.saveStoryWithoutImage(storyToSave);
                    }
                } else {
                    console.error("❌ Falha ao comprimir imagem");
                    this.saveStoryWithoutImage(storyToSave);
                  }
                })
                .catch(error => {
                  console.error("❌ Erro durante compressão de imagem:", error);
                  this.saveStoryWithoutImage(storyToSave);
                });
          } catch (error) {
              console.error("❌ Erro ao iniciar compressão:", error);
              this.saveStoryWithoutImage(storyToSave);
          }
        } else {
            this.saveStoryWithoutImage(storyToSave);
          }
        }
      } catch (error) {
        console.error('Error saving current story to localStorage:', error);
        alert('Houve um erro ao abrir a história. Por favor, tente novamente.');
      }
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
    },
    
    // Método para comprimir imagens
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
    
    // Método auxiliar para formatar tamanhos de arquivo
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
      else return (bytes / 1073741824).toFixed(2) + ' GB';
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
      console.error("❌ Error loading image:", event);
      console.log("🖼️ Imagem que falhou:", event.target.src);
      
      // Try to use imageBase64 if available
      if (story.imageBase64 && event.target.src !== story.imageBase64) {
        console.log("🔄 Tentando usar imageBase64 como fallback");
        event.target.src = story.imageBase64;
        return;
      }
      
      // Otherwise just show the icon (by removing the image)
      console.log("⚠️ Removendo imagem e mostrando ícone como fallback");
      event.target.style.display = 'none';
    }
  }
};

// Export for module systems while maintaining window compatibility
export default window.MyStoriesPage;
