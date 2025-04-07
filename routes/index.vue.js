import { sdk } from "../sdk.js";

window.IndexPage = {
  template: `
        <div class="min-h-screen bg-gradient-to-b from-neutral-light to-neutral relative">
            <!-- Background image for all devices - African/artisanal pattern -->
            <div class="absolute inset-0 z-0">
                <img src="/assets/image/caxixi2.png" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-80" />
            </div>
            
            <!-- Fixed full-height gradient overlay -->
            <div class="absolute inset-0 z-0 bg-gradient-to-t from-[#f7dda2]/80 to-transparent from-0% to-90% h-full pointer-events-none"></div>
                    
            <!-- Navigation -->
            <div class="relative z-10">
                <!-- Navigation Menu -->
                <nav class="py-3 px-0 sm:px-0 relative">
                    <!-- Background Image -->
                    <div class="absolute inset-0 w-full h-full">
                        <img src="/assets/image/footer.png" alt="Footer Background" class="w-full h-full object-cover" />
                    </div>
                    
                    <!-- Content -->
                    <div class="flex justify-between items-center relative z-10">
                        <!-- Logo centered -->
                        <div class="flex-1"></div>
                        <div class="flex justify-center flex-1">
                            <a class="logo" href="/" title="Fábula">
                                <img src="/assets/image/fabula.png" alt="Logo Fábula" class="h-12 w-auto" />
                            </a>
                        </div>
                        <!-- My Stories Button -->
                        <div class="flex justify-end flex-1">
                            <router-link
                                to="/my-stories"
                                class="px-6 py-2 text-[#3e2212] bg-transparent border-2 border-[#3e2212] rounded-xl hover:bg-[#3e2212]/10 transition-colors duration-200 chalk-texture ml-4"
                            >
                                Minhas Histórias
                            </router-link>
                        </div>
                    </div>
                </nav>
            </div>
            
            <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-4 relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
                <!-- Hero Section -->
                <div class="relative z-10 flex flex-col items-center gap-4 max-w-[500px] md:max-w-[650px] mx-auto py-4 px-6">                      
                    <!-- Decorative elements - African patterns/illustration -->
                    <div class="w-full flex justify-center mb-4">
                        <img src="/assets/image/caxixi.png" alt="caxixi" class="w-[33rem] h-auto" />
                    </div>
                    
                    <!-- Main heading with handmade text style - mobile optimized for exactly 2 lines -->
                    <h1 class="font-heading font-bold text-[20px] xs:text-[24px] sm:text-[32px] md:text-[42px] lg:text-[48px] leading-[1.2] text-center m-0 text-[#3e2212] max-w-[280px] xs:max-w-[320px] sm:max-w-[480px] md:max-w-[640px] mx-auto">{{ $t('home.welcome') }}</h1>
                    
                    <!-- CTA section -->
                    <div class="flex flex-col items-center w-full gap-2">
                        <div class="flex flex-col sm:flex-row gap-4 mt-8 sm:mt-10">
                            <button
                                class="px-8 py-3 text-[#3e2212] bg-[#eecd88] border-2 border-[#3e2212] rounded-xl hover:bg-[#eecd88]/90 transition-colors duration-200 text-[16px] sm:text-[18px] font-medium drop-shadow-[2px_2px_0_#3e2212] chalk-texture"
                                @click="nav('/create')"
                            >
                                Criar Uma História
                            </button>
                        </div>
                        <p class="font-body font-normal text-[14px] sm:text-[16px] leading-[1.6] text-[#3e2212] m-0 mt-4 sm:mt-6 text-center max-w-[320px] sm:max-w-[400px] mx-auto">Embarque em uma nova história! Das tradições, das gerações, do coração.</p>
                    </div>
                </div>
            </main>
        </div>
    `,
  data() {
    return {
      user: null,
      isAdmin: false,
      _componentMounted: true // Track whether the component is mounted
    };
  },
  async mounted() {
    console.log("IndexPage mounted");
    
    // Check for custom translator file
    await this.checkTranslatorFile();

    // Check if the user is logged in
    this.checkLoggedInUser();

    // Add style tag for chalk texture
    const style = document.createElement('style');
    style.textContent = `
      .chalk-texture {
        position: relative;
      }
      .chalk-texture::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('/assets/image/chalk-texture.png') repeat;
        opacity: 0.15;
        mix-blend-mode: overlay;
        pointer-events: none;
        border-radius: inherit;
      }
      .chalk-text {
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.7);
        letter-spacing: 0.5px;
      }
      .chalk-button {
        border-image-source: url('/assets/image/chalk-border.png');
        border-image-slice: 30;
        border-image-repeat: round;
        border-style: solid;
        border-width: 4px;
      }
      .chalk-button:hover {
        border-image-slice: 35;
        filter: brightness(0.95);
      }
    `;
    document.head.appendChild(style);
  },
  methods: {
    handleLogin() {
      this.$router.push('/login');
    },
    
    // Simplified methods for the POC
    trackMyStoriesClick() {
      console.log('My Stories clicked');
    },
    
    trackCreateStoryClick() {
      console.log('Create Story clicked');
    },
    
    async checkLoggedInUser() {
      // Simple user check for the POC
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    },
    
    async checkTranslatorFile() {
      // Simplified translation check
      console.log("Checking for custom translator file");
    },
    
    getOptimizedImageUrl(url, width, height) {
      // Just return the URL for the POC
      return url;
    },

    nav(path) {
      this.$router.push(path);
    }
  },
  beforeUnmount() {
    this._componentMounted = false;
  }
};

// Export for module systems while maintaining window compatibility
export default window.IndexPage;