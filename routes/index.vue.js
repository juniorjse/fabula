import { sdk } from "../sdk.js";

window.IndexPage = {
  template: `
        <div class="min-h-screen bg-gradient-to-b from-neutral-light to-neutral pb-16 relative">
            <!-- Background image for all devices - African/artisanal pattern -->
            <div class="absolute inset-0 z-0">
                <img src="/assets/image/background.jpg" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-15" />
            </div>
            
            <!-- Fixed full-height gradient overlay -->
            <div class="absolute inset-0 z-0 bg-gradient-to-b from-neutral-light/70 to-neutral from-0% to-60% h-screen pointer-events-none"></div>
                    
            <!-- Navigation -->
            <div class="relative z-10">
                <!-- Navigation Menu -->
                <nav class="py-3 px-4 sm:px-6">
                    <div class="flex justify-between items-center">
                        <!-- My Stories Button with rustic style -->
                        <div></div> <!-- Empty div for spacing -->
                        
                        <router-link to="/my-stories" @click="trackMyStoriesClick" class="flex justify-center items-center gap-1 py-2 px-4 w-auto min-w-[120px] h-10 bg-primary hover:bg-primary-dark btn-rustic text-white font-heading font-medium text-sm shadow-md transition-all duration-200">
                            <span class="flex items-center justify-center">
                                <i class="fa-solid fa-book"></i>
                            </span>
                            {{ $t('ui.myStories') }}
                        </router-link>
                    </div>
                </nav>
            </div>
            
            <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-4 md:pt-8 relative z-10">
                <!-- Hero Section -->
                <div class="relative z-10 flex flex-col items-center gap-8 max-w-[500px] md:max-w-[650px] mx-auto py-4 px-6 mb-16">                      
                    <!-- Decorative elements - African patterns/illustration -->
                    <div class="w-full flex justify-center mb-4">
                        <img src="/assets/image/caxixi.png" alt="caxixi" class="w-[33rem] h-auto" />
                    </div>
                    
                    <!-- Main heading with handmade text style -->
                    <h1 class="font-heading font-bold text-4xl md:text-5xl leading-tight text-center m-0 text-primary-dark">{{ $t('home.welcome') }}</h1>
                    
                    <!-- Subheading -->
                    <p class="font-body text-lg text-[#A67C52] text-center max-w-md">Histórias encantadoras da fauna brasileira para crianças, criadas com inteligência artificial</p>
                        
                        <!-- CTA section -->
                        <div class="flex flex-col items-center w-full gap-2">
                        <button @click="$router.push('/create')" 
                                class="flex justify-center items-center gap-2 py-3 px-6 w-full md:w-auto md:min-w-[250px] h-14 
                                       bg-primary hover:bg-primary-dark btn-rustic
                                       shadow-md transition-all duration-200 
                                       font-heading font-bold text-xl text-white">
                                <span class="flex items-center justify-center">
                                <i class="fas fa-feather-alt mr-2"></i>
                                </span>
                            Criar Uma História
                            </button>
                        <p class="font-body font-normal text-sm leading-[1.67] text-[#A67C52] m-0 mt-2">Experimente agora! É gratuito e leva apenas 30 segundos.</p>
                                    </div>
                                    
                    <!-- Nosso Diferencial Section -->
                    <section class="py-12 px-6 max-w-7xl mx-auto">
                        <h2 class="font-heading text-2xl md:text-3xl font-bold text-secondary-dark text-center mb-6">Nosso Diferencial</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <!-- Card 1 -->
                            <div class="bg-neutral-light/70 rounded-lg overflow-hidden shadow-md border border-neutral-dark transform transition hover:scale-[1.02] min-h-[220px]">
                                <div class="p-6 flex flex-col items-center h-full">
                                    <div class="text-primary mb-3 flex justify-center">
                                        <i class="fas fa-child text-4xl"></i>
                                    </div>
                                    <h3 class="font-heading font-bold text-xl text-secondary-dark mb-2 text-center">Histórias Personalizadas</h3>
                                    <p class="font-body text-[#A67C52] max-w-xl text-justify">Cada história é única e personalizada para seu filho.</p>
                                </div>
                            </div>
                            
                            <!-- Card 2 -->
                            <div class="bg-neutral-light/70 rounded-lg overflow-hidden shadow-md border border-neutral-dark transform transition hover:scale-[1.02] min-h-[220px]">
                                <div class="p-6 flex flex-col items-center h-full">
                                    <div class="text-primary mb-3 flex justify-center">
                                        <i class="fas fa-globe-americas text-4xl"></i>
                                    </div>
                                    <h3 class="font-heading font-bold text-xl text-secondary-dark mb-2 text-center">Fauna Brasileira</h3>
                                    <p class="font-body text-[#A67C52] max-w-xl text-justify">Conectando crianças com a rica biodiversidade do Brasil de forma lúdica e educativa.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                <!-- Footer SVG Logo -->
                <div class="flex justify-center mt-8">
                    <a class="logo" href="/" title="Fábula">
                        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="32.88" viewBox="0 0 140 32.883">
                            <defs>
                                <style>.cls-2{fill:#006fb9}</style>
                            </defs>
                            <title>logo</title>
                            <g id="Grupo_68" data-name="Grupo 68" transform="translate(-49.059 -200.713)">
                                <path id="Caminho_39" fill="#ef773a" d="M169.981 330.808c.206-.547.355-.95.513-1.349.076-.193.188-.373.258-.568 1.142-3.2 3.7-4.628 6.762-5.442.382-.1.517.084.613.414.337 1.157.72 2.3 1.032 3.466a1.612 1.612 0 0 0 .96 1.207 4.32 4.32 0 0 1 .694.417c.394.264.647.164 1.011-.163a2.409 2.409 0 0 0 .7-2.729c-.326-1.178-.421-2.417-.706-3.609a3.7 3.7 0 0 0-2.114-2.591 8.279 8.279 0 0 0-4.643-.631 8.745 8.745 0 0 0-4.321 1.734 4.149 4.149 0 0 0-.884 1.106c-.253.381-.449.8-.665 1.2-.154.289-.335.355-.656.2-1.166-.572-1.822-.164-1.877 1.153-.076 1.829-.153 3.657-.2 5.487-.012.467-.121.718-.642.778-1.176.133-2.343.352-3.521.487a1.376 1.376 0 0 0-.964.656c-.9 1.111-.258 2.066.225 3.034.077.153.374.229.584.274 1.077.229 2.154.477 3.242.639.618.091.719.366.642.92-.183 1.338-.32 2.683-.463 4.028a4.77 4.77 0 0 0 .231 2.5 17.9 17.9 0 0 1 .727 2.384c.114.408.342.608.764.543a2.351 2.351 0 0 0 1.9-.986 5.509 5.509 0 0 0 1.013-3.5c-.128-1.758-.045-3.533-.089-5.3-.01-.442.168-.574.556-.634 1.315-.2 2.629-.408 3.939-.637a2.663 2.663 0 0 0 1.937-3.106 2.818 2.818 0 0 0-1.915-1.4c-1.289 0-2.578.012-3.867.018h-.773" data-name="Caminho 39" transform="translate(-73.43 -115.694)"></path>
                                <path id="Caminho_40" d="M316.152 340.94c-.652.709-1.276 1.452-1.942 2.14a1.375 1.375 0 0 0-.407 1.278 4.709 4.709 0 0 1 .026.766.841.841 0 0 0 .568.847 1.625 1.625 0 0 0 2.211-.335c.672-.706 1.49-1.226 2.189-1.9s.543-1.248.406-2.461a1.816 1.816 0 0 0-3.05-.335" class="cls-2" data-name="Caminho 40" transform="translate(-200.167 -133.061)"></path>
                                <path id="Caminho_41" d="M273.892 394.236c-.154.661-.386 1.788-1.019 2.2l-.515.333a5.6 5.6 0 0 1-1.288.594 1.258 1.258 0 0 1-.9-.183 2.511 2.511 0 0 1-.952-3.055l.446-.862.586-.778.813-.477.784-.167a1.074 1.074 0 0 1 .276-.015 2.773 2.773 0 0 1 1.531.606 1.979 1.979 0 0 1 .235 1.808m6.6 8.583c-.483-.727-.955-1.465-1.493-2.151a2.15 2.15 0 0 1-.516-1.417c.018-1.675-.1-3.337.049-5.03a10.96 10.96 0 0 0-1.122-6.17c-.168-.318-.713-.489-1.12-.605a1.4 1.4 0 0 0-.914.111 8.06 8.06 0 0 1-3.738.365 5.807 5.807 0 0 0-4.27 1.569 9.411 9.411 0 0 0-1.181 2.085c-1.121 1.955-.914 4.11-.646 6.153a5.037 5.037 0 0 0 2.244 3.795 1.583 1.583 0 0 0 .643.194c.971.1 1.945.213 2.919.229a1.569 1.569 0 0 0 1.028-.4c.824-.812 1.58-1.694 2.5-2.7.262.911.481 1.661.694 2.41a3.537 3.537 0 0 1 .146.605 3.416 3.416 0 0 0 2.2 2.707c.674.359 2.581-.5 2.719-1.238a.785.785 0 0 0-.144-.511" class="cls-2" data-name="Caminho 41" transform="translate(-160.01 -172.158)"></path>
                                <path id="Caminho_42" fill="#ffb438" d="M380.628 336.493l-.983.916c-1.162 1.085-3.236.745-3.245-1.013 0-.37.376-.733.582-1.028l.273-.262 1.211-1.069.787-.328h.983c.2.1.61.2.741.376a.718.718 0 0 1 .087.2 2.109 2.109 0 0 1-.435 2.21m3.627-5.82a2.5 2.5 0 0 0-1.755-1.617 1.766 1.766 0 0 0-1 0c-5.117-1.347-6.491 6.1-6.693 1.052.386-2.746-.086-5.476-.2-8.213-.084-2.037-.2-4.072-.314-6.109a2.283 2.283 0 0 0-2.014-1.887h-.81c-.961 0-1.442.635-1.384 1.608.153 2.51.288 5.024.345 7.538.039 1.723-.139 3.452-.084 5.176s.278 3.438.438 5.155c.112 1.222.223 2.446.376 3.663a3.515 3.515 0 0 0 .355 1.114 20.878 20.878 0 0 0 1.133 2.009 3.642 3.642 0 0 0 .844.857 5.479 5.479 0 0 0 3.916.972c2.1-.117 3.657-1.373 5.447-2.139a.451.451 0 0 0 .181-.165 11.846 11.846 0 0 0 2.267-5.924c.043-1.011-.713-2.044-1.048-3.083" data-name="Caminho 42" transform="translate(-246.832 -111.222)"></path>
                                <path id="Caminho_43" fill="#e175ab" d="M668.827 396.545c-.138.59-.344 1.594-.908 1.958l-.459.3a4.934 4.934 0 0 1-1.148.529 1.113 1.113 0 0 1-.8-.162 2.244 2.244 0 0 1-.85-2.724l.4-.769.523-.694.723-.424.7-.15a.969.969 0 0 1 .245-.015 2.476 2.476 0 0 1 1.366.54 1.764 1.764 0 0 1 .21 1.613m7.851 5.906a11.6 11.6 0 0 1-2.533-4.464 24.2 24.2 0 0 1-.532-3.371c-.094-.7-.15-1.4-.218-2.107-.128-1.292-1.036-2.138-1.775-3.076a.8.8 0 0 0-.509-.188c-.33-.034-.67.012-1-.042a1.553 1.553 0 0 0-1.951 1.072c-.171.463-.621.5-1.041.543-.806.09-1.608.21-2.414.28a2.7 2.7 0 0 0-2.2 1.817 21.486 21.486 0 0 0-1.443 4.3 5.159 5.159 0 0 0 1.914 5.574 6.878 6.878 0 0 0 3.806 1.127 1.13 1.13 0 0 0 .628-.235 5.808 5.808 0 0 0 2.554-2.722 6.728 6.728 0 0 1 .342-.626c.531.649 1 1.219 1.464 1.794.522.648 1.008 1.329 1.571 1.937a2.069 2.069 0 0 0 .944.464 2.846 2.846 0 0 0 .8 0 1.638 1.638 0 0 0 1.832-1.324.974.974 0 0 0-.247-.754" data-name="Caminho 43" transform="translate(-487.882 -173.611)" style="mix-blend-mode:multiply;isolation:isolate"></path>
                                <path id="Caminho_44" fill="#52b9d0" d="M569.594 346.945c-1.082-3-.4-6.4-.39-9.769 0-.289.021-.58.042-.871a2.212 2.212 0 0 0-.372-1.7 11.015 11.015 0 0 1-.735-1.43.574.574 0 0 0-.466-.247 16.637 16.637 0 0 0-1.87.455.857.857 0 0 0-.506.423 5.611 5.611 0 0 0-.622 2.759c.346 2.783.7 5.568.959 8.36.18 1.984.137 3.984.306 5.968a9.3 9.3 0 0 0 2.849 6.182c1.569 1.42 3.518 1.469 5.5 1.2 1.532-.211 3.527-.817 3.9-2.839a16.549 16.549 0 0 0 .515-4.311 2.753 2.753 0 0 0-1.289-1.566.766.766 0 0 0-.555.187c-.63.592-1.229 1.216-1.843 1.823a1.24 1.24 0 0 1-.386.3c-.782.28-1.564.571-2.365.785a1.012 1.012 0 0 1-.767-.2 3.614 3.614 0 0 1-1.545-2.965 19.282 19.282 0 0 0-.356-2.544" data-name="Caminho 44" transform="translate(-408.105 -126.998)"></path>
                                <path id="Caminho_45" fill="#247b40" d="M405.06 121.037c.823-.083 1.611-.154 2.4-.245a3.692 3.692 0 0 0 3.4-2.4c.182-.49.43-.955.649-1.431 1.529-3.317.141-5.672-2.607-7.169a.971.971 0 0 0-.43-.106c-1.93-.051-3.845-.054-5.573 1.032-.3.185-.689.669-1.074.076-.571-.878-.566-1.547-.05-1.968.883-.722 1.734-1.484 2.635-2.183a.837.837 0 0 1 .774-.081c1.477 1.258 2.923.368 4.371-.019.511-.137.507-.445.232-.849a8.694 8.694 0 0 0-3.415-2.481c-1.237-.671-1.261-.627-.845-1.979.531-1.728.531-1.728-1.3-1.624-1.877.106-1.954.189-2.015 2.046-.017.524-.075 1.046-.078 1.57-.008 1.382-1.039 2.182-1.769 3.37a13.5 13.5 0 0 0-.871-1.1c-.326-.33-.667-.783-1.071-.873a32.259 32.259 0 0 0-3.331-.462.67.67 0 0 0-.491.111c-.808.79-1.794 1.407-2.1 2.64-.381 1.522-.92 3-1.357 4.511-.132.458-.369.488-.779.42-1.551-.257-3.108-.476-4.663-.71-.123-.018-.276-.085-.367-.038-1.434.747-3.108 1.169-3.99 2.7A22.766 22.766 0 0 0 380 116.55a3.007 3.007 0 0 0-.086 1.273 4.874 4.874 0 0 0 .256.777c.577 2.408 2.58 2.771 4.549 3.186.9.19 1.8.414 2.71.563.617.1.673.334.4.85-.693 1.325-1.387 2.652-2 4.016a1.7 1.7 0 0 0-.035 1.331c.685 1.2 1.5 2.337 2.27 3.489a.6.6 0 0 0 .344.272c1.6.167 3.206.424 4.66-.653a6.5 6.5 0 0 0 2.361-3.955 7.006 7.006 0 0 1 .3-.8l.213-.007a13.922 13.922 0 0 0 .5 1.737 4.154 4.154 0 0 0 .826 1.266c1.662 1.695 3.855 1.738 5.942 1.5a3.1 3.1 0 0 0 2.819-2.242 3.141 3.141 0 0 1 .214-.637c1.236-2.454.177-4.593-.91-6.73-.079-.155-.176-.3-.256-.455a1.221 1.221 0 0 1-.022-.3" data-name="Caminho 45" transform="translate(-330.831 101.136)" style="mix-blend-mode:multiply;isolation:isolate"></path>
                                <path id="Caminho_46" fill="#e86468" d="M479.625 394.5a.8.8 0 0 1-.1.565c-.339.418-.729.8-1.1 1.186a.372.372 0 0 1-.664-.06 3.939 3.939 0 0 1-.584-1c-.539-1.92-1.036-3.852-1.542-5.781a1.907 1.907 0 0 0-2.861-.793 3.963 3.963 0 0 0-1.181 2.341 18.488 18.488 0 0 0 .778 6.458q.187.855.425 1.693c.22.768 3.489 3.545 5.033 3.737a2.441 2.441 0 0 0 1.367-.178c1.17-.622 2.3-1.327 3.411-2.052a1.766 1.766 0 0 0 .586-.838 18.531 18.531 0 0 0 .746-8.734 13.447 13.447 0 0 0-.869-2.981 2.037 2.037 0 0 0-1.908-.827c-.16.043-.322.082-.486.112-1.207.218-1.619.721-1.584 1.958.015.518.049 1.038.075 1.557" data-name="Caminho 46" transform="translate(-330.906 -171.992)"></path>
                            </g>
                        </svg>
                    </a>
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
    }
  },
  beforeUnmount() {
    this._componentMounted = false;
  }
};

// Export for module systems while maintaining window compatibility
export default window.IndexPage;