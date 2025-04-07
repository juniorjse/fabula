import { sdk } from "../sdk.js";
import i18n from "../i18n/index.js";

window.StoryPage = {
    template: `
        <div v-if="sdkAvailable" class="min-h-screen pb-16 bg-[#F4F4F5]">
            <!-- Background pattern -->
            <div class="absolute inset-0 z-0">
                <img src="/assets/image/caxixi2.png" alt="African Pattern Background" class="w-full h-full object-cover fixed opacity-30 filter sepia-[0.3] brightness-[1.1] saturate-[1.2]" />
            </div>

            <!-- Navigation -->
            <nav class="relative z-10 py-3 px-4 sm:px-6 mb-4">
                <div class="flex justify-between items-center">
                    <!-- Back button with rustic style -->
                    <router-link to="/my-stories" class="flex items-center gap-1 py-2 px-4 bg-transparent border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#3e2212]/10 rounded-xl font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1 transition-all duration-200 chalk-texture">
                        <i class="fas fa-arrow-left mr-1"></i> Voltar
                    </router-link>
                    <!-- Spacer to ensure justify-between works properly -->
                    <div></div>
                </div>
            </nav>

            <!-- Loading State -->
            <div v-if="loading" class="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] bg-neutral-light/70 rounded-lg shadow-lg border border-neutral-dark card-rustic">
                <div class="relative w-20 h-20 mb-6">
                    <div class="absolute inset-0 rounded-full bg-primary/20 animate-pulse duration-3000"></div>
                    <div class="absolute inset-3 rounded-full bg-primary/40 animate-pulse duration-4000"></div>
                    <i class="fas fa-feather-alt text-primary text-2xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                </div>
                <p class="text-xl text-secondary-dark font-medium">{{ $t('story.loadingStory') }}</p>
                <p v-if="fileCheckMessage" class="text-sm text-black mt-2">{{ fileCheckMessage }}</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] bg-neutral-light/70 rounded-lg shadow-lg border border-neutral-dark card-rustic">
                <div class="relative w-20 h-20 mb-6">
                    <i class="fas fa-exclamation-circle text-5xl text-secondary-dark absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                    <div class="absolute inset-0 rounded-full bg-primary/10"></div>
                    <div class="absolute inset-3 rounded-full bg-primary/20"></div>
                </div>
                <h3 class="text-xl font-medium mb-2 text-secondary-dark">{{ $t('story.errorLoadingStory') }}</h3>
                <p class="text-center mb-6 text-black">{{ error }}</p>
                <p class="text-center text-gray-700 mb-6">Isso pode ocorrer quando a história não está mais disponível ou os arquivos de mídia não podem ser acessados.</p>
                
                <div class="flex flex-col sm:flex-row gap-4 mt-4">
                    <router-link to="/" class="flex items-center gap-1 py-2 px-4 bg-neutral hover:bg-neutral-dark btn-rustic text-secondary-dark font-heading font-medium text-sm shadow-md transition-all duration-200 chalk-texture">
                        <i class="fas fa-home mr-1"></i> Voltar ao Início
                    </router-link>
                    <router-link to="/my-stories" class="flex items-center gap-1 py-2 px-4 bg-primary hover:bg-primary-dark btn-rustic text-white font-heading font-medium text-sm shadow-md transition-all duration-200 chalk-texture drop-shadow-[2px_2px_0_#3e2212]">
                        <i class="fas fa-book mr-1"></i> Minhas Histórias
                </router-link>
                </div>
            </div>

            <!-- Story Display -->
            <main v-else class="max-w-4xl mx-auto bg-[#fef0d6] rounded-lg shadow-lg border-2 border-[#e2c08c] card-rustic">
                <div class="px-6 md:p-8 relative bg-[#fef0d6]">                    
                    <!-- Story Content -->
                    <div class="mb-8">
                        <div class="flex flex-col items-center mb-8">
                            <!-- Book Cover -->
                            <div class="relative w-full max-w-xs aspect-[138/138] rounded-lg mb-6 overflow-hidden shadow-[0_1px_2px_0_rgba(22,109,149,0.2),0_3px_3px_0_rgba(22,109,149,0.17),0_7px_4px_0_rgba(22,109,149,0.1),0_12px_5px_0_rgba(22,109,149,0.03)]">
                                <div v-if="story && (story.imageUrl || story.image || story.imageBase64)" class="w-full h-full bg-[#fef1d6]">
                                    <img 
                                        :src="story.imageUrl || story.image || story.imageBase64" 
                                        :alt="story ? formatTitle(story.title) : ''" 
                                        class="w-full h-full object-cover" 
                                        @error="handleImageError" 
                                    />
                                </div>
                                <div v-else class="w-full h-full bg-[#fef1d6] flex items-center justify-center">
                                    <i class="fas fa-book-open text-5xl text-[#4b2707]"></i>
                                </div>
                                <div class="absolute inset-0 bg-[url('/assets/image/book-texture.svg')] bg-cover bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"></div>
                            </div>
                            
                            <!-- Author and Title -->
                            <div class="text-center w-full">
                                <h1 class="text-2xl font-semibold text-[#4b2707] mb-4">{{ story ? formatTitle(story.title) : '' }}</h1>
                            </div>
                        </div>

                        <!-- Audio Player -->
                        <div v-if="story" class="flex flex-col gap-2 mb-6">
                            <!-- Progress Bar -->
                            <div class="w-full relative">
                                <div class="w-full h-1 bg-[#e2c08c] rounded-full cursor-pointer" @click="seekAudio($event)">
                                    <div class="h-1 bg-[#4b2707] rounded-full" :style="{ width: audioProgress + '%' }"></div>
                                </div>
                            </div>
                            
                            <!-- Time Display -->
                            <div class="flex justify-between w-full">
                                <span class="text-xs text-[#4b2707] opacity-80">{{ formatTime(currentTime) }}</span>
                                <span class="text-xs text-[#4b2707] opacity-80">{{ formatTime(duration) }}</span>
                            </div>
                            
                            <!-- Controls -->
                            <div class="flex justify-center items-center gap-4 mt-1">
                                <button @click="shareStory" class="w-10 h-10 rounded-full bg-[#4b2707] flex items-center justify-center text-white">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                                
                                <button @click="toggleAudio" class="w-16 h-16 rounded-full bg-[#4b2707] border-2 border-[#e2c08c] shadow-md flex items-center justify-center p-4 text-white">
                                    <i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" class="text-xl"></i>
                                </button>
                                
                                <button @click="scrollToText" class="w-10 h-10 rounded-full bg-[#4b2707] flex items-center justify-center text-white">
                                    <i class="fas fa-file-alt"></i>
                                </button>
                            </div>
                            
                            <audio ref="audioPlayer" :src="story.audioUrl" @timeupdate="updateProgress" @ended="audioEnded" @loadedmetadata="onAudioLoaded"></audio>
                        </div>
                        
                        <!-- Story Text Container -->
                        <div class="story-text-container">
                            <div v-if="story" class="w-full text-[#4b2707] text-sm">
                                <div v-if="hasHtmlContent(getStoryText())" v-html="getStoryText()" class="prose prose-sky max-w-none"></div>
                                <div v-else-if="getStoryText()" class="whitespace-pre-wrap">{{ getStoryText() }}</div>
                                <div v-else class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-700">
                                    <p class="font-medium">O texto desta história não pôde ser carregado</p>
                                    <p class="text-xs mt-2">Informações de depuração: content={{!!story.content}}, story={{!!story.story}}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button @click="downloadAudio" class="flex-1 py-2 px-3 bg-transparent border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#3e2212]/10 rounded-xl font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1 transition-all duration-200 chalk-texture">
                            <i class="fas fa-download"></i>
                            {{ $t('ui.downloadAudio') }}
                        </button>
                        <router-link to="/create" class="flex-1 py-2 px-3 bg-[#eecd88] border-2 border-[#3e2212] text-[#3e2212] hover:bg-[#eecd88]/90 rounded-xl font-heading font-medium text-xs md:text-sm flex items-center justify-center gap-1 transition-all duration-200 chalk-texture drop-shadow-[2px_2px_0_#3e2212]">
                            <i class="fas fa-plus"></i>
                            {{ $t('ui.createNewStory') }}
                        </router-link>
                    </div>
                    
                    <!-- Example Added Message -->
                    <div v-if="exampleAddedMessage" class="mb-8 p-4 rounded-lg text-center btn-rustic" :class="exampleAddedMessage.startsWith('Error') ? 'bg-red-700 text-white' : 'bg-secondary text-white'">
                        {{ exampleAddedMessage }}
                    </div>
                    
                    <!-- Story Settings (Collapsible) -->
                    <details v-if="story" class="bg-[#fef1d6] border-2 border-[#e2c08c] rounded-lg p-4 shadow-sm mb-8 group card-rustic">
                        <summary class="text-[#4b2707] font-medium cursor-pointer flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="fa-solid fa-gear mr-2 text-[#4b2707]"></i>
                                {{ $t('ui.storySettings') }}
                            </div>
                            <i class="fa-solid fa-chevron-down text-[#4b2707] group-open:rotate-180 transition-transform duration-300"></i>
                        </summary>
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#e2c08c]">
                            <div v-if="story.childName" class="space-y-2">
                                <label class="block text-sm font-medium text-[#4b2707]">{{ $t('ui.childName') }}</label>
                                <div class="bg-[#fef1d6] rounded-full px-4 py-2 text-[#4b2707] border-2 border-[#e2c08c]">
                                    {{ story.childName }}
                                </div>
                            </div>
                            
                            <div v-if="story.themes || story.interests" class="space-y-2">
                                <label class="block text-sm font-medium text-[#4b2707]">{{ $t('ui.themes') }}</label>
                                <div class="bg-[#fef1d6] rounded-full px-4 py-2 text-[#4b2707] border-2 border-[#e2c08c]">
                                    {{ story.themes || story.interests }}
                                </div>
                            </div>

                            <div v-if="story.voice" class="space-y-2">
                                <label class="block text-sm font-medium text-[#4b2707]">{{ $t('ui.voice') }}</label>
                                <div class="bg-[#fef1d6] rounded-full p-2 text-[#4b2707] border-2 border-[#e2c08c] flex items-center gap-2">
                                    <img v-if="typeof story.voice === 'object' && story.voice.avatar" :src="story.voice.avatar" class="w-8 h-8 rounded-full" />
                                    <span>{{ typeof story.voice === 'object' ? story.voice.name : story.voice }}</span>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </main>
        </div>
        <div v-else class="min-h-screen bg-gradient-to-b from-[#E1F5FE] to-[#BBDEFB] pb-16 flex items-center justify-center">
            <div class="bg-red-100 border border-red-300 text-red-700 px-8 py-6 rounded-xl max-w-md mx-auto text-center">
                <h3 class="text-xl font-medium mb-4">Webdraw SDK Required</h3>
                <p class="mb-4">This app requires the Webdraw SDK to function properly. Please open it in the Webdraw browser environment.</p>
                <a href="https://webdraw.com/apps/browser" class="bg-[#0EA5E9] text-white px-6 py-3 rounded-full hover:bg-[#0284C7] font-medium inline-block">
                    Go to Webdraw Apps
                </a>
            </div>
        </div>
        
        <!-- Toast Notification -->
        <transition
            enter-active-class="transform transition ease-out duration-300"
            enter-from-class="translate-y-[-100%] opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transform transition ease-in duration-300"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-[-100%] opacity-0"
        >
            <div v-if="showToast" class="fixed top-4 left-0 right-0 mx-auto w-auto max-w-xs z-50 flex justify-center">
                <div class="bg-primary text-white px-3 py-2 rounded-full shadow-md flex items-center gap-2 border border-primary-dark text-sm btn-rustic">
                    <div class="bg-white bg-opacity-25 rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <i class="fas fa-check text-white text-xs"></i>
                    </div>
                    <span>{{ toastMessage }}</span>
                </div>
            </div>
        </transition>
    `,
    data() {
        return {
            loading: true,
            error: null,
            story: null,
            isPlaying: false,
            audioProgress: 0,
            currentTime: 0,
            duration: 0,
            exampleAddedMessage: null,
            isAdmin: false,
            
            // Check if we're running in the SDK environment
            sdkAvailable: sdk && typeof sdk.fs?.read === 'function',
            BASE_FS_URL: "https://fs.webdraw.com", // Base URL for file system access
            translationsFileExists: false,
            addingAsExample: false,
            adminCheckInterval: null,
            
            // File readiness check variables
            fileCheckMaxAttempts: 10,
            fileCheckAttemptDelay: 1000, // 1 second between attempts
            fileCheckCurrentAttempt: 0,
            fileCheckMessage: "",
            coverReady: false,
            audioReady: false,
            
            // Toast notification
            showToast: false,
            toastMessage: '',
            toastTimeout: null
        }
    },
    computed: {
        fileUrl() {
            // Se estamos vindo da página de criação, o URL do arquivo não é relevante
            if (this.fromCreate) {
                console.log("Vindo da página de criação, não precisamos de fileUrl");
                return null;
            }
            
            const fileParam = this.$route.query.file;
            console.log("Parâmetro file da URL:", fileParam);
            
            // Se não temos o parâmetro de arquivo mas temos uma história no localStorage, vamos usar isso
            if (!fileParam && localStorage.getItem("currentStory")) {
                console.log("Não há parâmetro file mas temos história no localStorage");
                return "localStorage"; // Um valor simbólico para indicar que devemos ler do localStorage
            }
            
            // Se temos um arquivo especificado, usamos ele
            return fileParam || null;
        },
        storyIndex() {
            // Get the index parameter from the route query
            return this.$route.query.index !== undefined ? this.$route.query.index : null;
        },
        storyId() {
            // Get the optional ID parameter for additional matching
            return this.$route.query.id || null;
        },
        fromCreate() {
            // Check if we're coming directly from the create page
            return this.$route.query.fromCreate === 'true';
        }
    },
    watch: {
        // Watch for route changes to reload the story when navigating between stories
        '$route.query': {
            handler(newQuery) {
                if (newQuery.file !== this.fileUrl || newQuery.index !== this.storyIndex) {
                    this.fileUrl = newQuery.file;
                    this.storyIndex = newQuery.index;
                    this.loadStory();
                }
            },
            immediate: false,
            deep: true
        }
    },
    async mounted() {
        // Check if the Webdraw SDK is available
        this.sdkAvailable = this.checkSdkAvailability();
        
        if (!this.sdkAvailable) {
            alert("This app requires the Webdraw SDK. Please test it at https://webdraw.com/apps/browser");
            return;
        }
        
        // Get query parameters using URLSearchParams
        const urlParams = new URLSearchParams(window.location.search);
        
        // Only use regular file parameter - storyPath is no longer supported
        this.fileUrl = urlParams.get('file');
        this.storyIndex = urlParams.get('index');
        this.storyId = urlParams.get('id');
        
        // Check if we're coming from the create page
        const fromCreate = urlParams.get('fromCreate') === 'true';
        
        // If we're coming from the create page, skip the loading screen
        if (fromCreate) {
            this.loading = false;
        }
        
        // Check if the translations file exists - não precisamos de logs no início
        await this.checkTranslationsFile(true);
        
        // Check if the user is an admin (can access admin page)
        const adminCheckResult = await this.checkIfAdmin(true);
        // Apenas um log simplificado
        this.isAdmin = adminCheckResult;
        
        // Periodically check admin status
        this.adminCheckInterval = setInterval(async () => {
            // Se já temos acesso de admin, não precisamos logar nada
            const prevAdminStatus = this.isAdmin;
            
            await this.checkTranslationsFile(prevAdminStatus);
            const periodicAdminCheck = await this.checkIfAdmin(prevAdminStatus);
            
            // Somente logar se houver uma mudança no status ou se não for admin
            if (!prevAdminStatus || prevAdminStatus !== periodicAdminCheck) {
                console.log("Periodic admin check result:", periodicAdminCheck);
            }
            
            this.isAdmin = periodicAdminCheck;
        }, 30000); // Check every 30 seconds
        
        await this.loadStory();
    },
    beforeDestroy() {
        // Clear the interval when the component is destroyed
        if (this.adminCheckInterval) {
            clearInterval(this.adminCheckInterval);
        }
    },
    methods: {
        // Check if the Webdraw SDK is available
        checkSdkAvailability() {
            if (!sdk || typeof sdk !== 'object') {
                console.error("Webdraw SDK is not available");
                return false;
            }
            
            if (!sdk.fs || typeof sdk.fs.read !== 'function') {
                console.error("Webdraw SDK filesystem module is not available");
                return false;
            }
            
            return true;
        },
        
        // Check if the translations file exists
        async checkTranslationsFile(silentCheck = false) {
            if (!this.sdkAvailable) {
                this.translationsFileExists = false;
                return;
            }
            
            try {
                const translatorPath = "~/AI Storyteller/translations.json";
                
                if (typeof sdk.fs.exists === 'function') {
                    const exists = await sdk.fs.exists(translatorPath);
                    this.translationsFileExists = exists;
                    
                    // Somente logar se não for uma verificação silenciosa
                    if (!silentCheck) {
                        console.log("Translations file exists:", exists);
                    }
                } else {
                    // If exists method is not available, try to read the file
                    try {
                        await sdk.fs.read(translatorPath);
                        this.translationsFileExists = true;
                    } catch (error) {
                        this.translationsFileExists = false;
                    }
                }
            } catch (error) {
                // Logar erros mesmo em verificações silenciosas
                console.warn("Error checking translations file:", error);
                this.translationsFileExists = false;
            }
        },
        
        // Check if the user is an admin
        async checkIfAdmin(silentCheck = false) {
            // Somente logar se não for uma verificação silenciosa
            if (!silentCheck) {
                console.log("Checking admin status...");
            }
            
            // First check if AdminPage is defined
            if (typeof window.AdminPage !== 'undefined') {
                // Somente logar se não for uma verificação silenciosa
                if (!silentCheck) {
                    console.log("Admin check: AdminPage is defined");
                }
                return true;
            }
            
            // Check if SDK is properly initialized
            if (!this.sdkAvailable) {
                if (!silentCheck) {
                    console.warn("Admin check: SDK is not available");
                }
                return false;
            }
            
            // Check if translations file exists
            if (!this.translationsFileExists) {
                if (!silentCheck) {
                    console.warn("Admin check: translations.json does not exist");
                }
                return false;
            }
            
            // Then check if the user has file system access to the specific translations file
            try {
                // The exact path to the translations file that only admins should have access to
                const translatorPath = "~/AI Storyteller/translations.json";
                
                // Try to read the file
                try {
                    const content = await sdk.fs.read(translatorPath);
                    
                    // Ensure the content is valid JSON and not empty
                    if (!content) {
                        if (!silentCheck) {
                            console.warn("Admin check: translations.json is empty");
                        }
                        return false;
                    }
                    
                    try {
                        JSON.parse(content);
                        if (!silentCheck) {
                            console.log("Admin check: Successfully read and parsed translations.json");
                        }
                        return true; // Return true if we can read and parse the file
                    } catch (parseError) {
                        if (!silentCheck) {
                            console.warn("Admin check: translations.json contains invalid JSON:", parseError);
                        }
                        return false;
                    }
                } catch (readError) {
                    if (!silentCheck) {
                        console.warn("Error reading translations.json:", readError);
                    }
                    return false;
                }
            } catch (error) {
                if (!silentCheck) {
                    console.warn("User doesn't have admin access:", error);
                }
                return false;
            }
            
            return false;
        },
        async loadStory() {
            // If coming from create page, we don't need to show loading since it's already been shown
            if (!this.fromCreate) {
                this.loading = true;
            }
            this.error = null;
            this.story = null;
            this.isPlaying = false;
            this.audioProgress = 0;
            this.currentTime = 0;
            this.duration = 0;
            this.fileCheckMessage = this.$t('story.preparingStory');
            this.coverReady = false;
            this.audioReady = false;
            
            console.log("=== INÍCIO DO CARREGAMENTO DA HISTÓRIA ===");
            console.log("ID da história a carregar:", this.storyId);
            console.log("URL do arquivo:", this.fileUrl);
            
            // Verificando se fileUrl tem o valor simbólico para localStorage
            if (this.fileUrl === "localStorage") {
                console.log("Identificado marcador para carregar do localStorage");
                // Processar do localStorage
                return await this.loadStoryFromLocalStorage();
            }
            
            // Verificar se há história guardada no localStorage apenas se não temos fileUrl
            if (!this.fileUrl) {
                console.log("Sem fileUrl, tentando localStorage");
                const hasLocalStorageStory = localStorage.getItem("currentStory") !== null;
                if (hasLocalStorageStory) {
                    return await this.loadStoryFromLocalStorage();
                }
            }
            
            if (!this.fileUrl) {
                console.error("Nenhuma URL de arquivo ou história no localStorage");
                this.error = this.$t('story.noStorySpecified');
                this.loading = false;
                return;
            }
            
            try {
                console.log("Loading story from:", this.fileUrl);
                
                let storyData;
                
                // Check if the file path starts with ~ (indicating it's a local file path)
                if (this.fileUrl.startsWith('~') && sdk && typeof sdk.fs?.read === 'function') {
                    if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
                        try {
                            await sdk.fs.chmod(this.fileUrl, 0o644);
                        } catch (chmodError) {
                            console.warn(`Could not set file permissions for story file ${this.fileUrl}:`, chmodError);
                        }
                    }
                    
                    // Read the file using the SDK
                    const content = await sdk.fs.read(this.fileUrl);
                    
                    if (!content) {
                        throw new Error(`Empty content from file: ${this.fileUrl}`);
                    }
                    
                    try {
                        const data = JSON.parse(content);
                        
                        // Check if this is a generations.json file with an index parameter
                        if (this.storyIndex !== null && data.generations && Array.isArray(data.generations)) {
                            console.log("Loading story from generations.json with index:", this.storyIndex);
                            const index = parseInt(this.storyIndex, 10);
                            if (isNaN(index) || index < 0 || index >= data.generations.length) {
                                throw new Error(this.$t('story.invalidIndex'));
                            }
                            
                            // Get the story by index
                            const candidateStory = data.generations[index];
                            
                            // If we have a storyId, verify the index points to the correct story
                            if (this.storyId) {
                                console.log("Verifying story ID:", this.storyId);
                                // Create the same format ID as in the my-stories component
                                const storyTitle = candidateStory.title || "untitled";
                                const storyTimestamp = candidateStory.createdAt || 0;
                                const candidateId = `${storyTitle}-${storyTimestamp}`;
                                
                                // If IDs don't match, try to find the correct story by ID
                                if (candidateId !== this.storyId) {
                                    console.warn("Story ID mismatch! Index might be incorrect");
                                    
                                    // Try to find the story by ID in the generations array
                                    const correctStory = data.generations.find(story => {
                                        const title = story.title || "untitled";
                                        const timestamp = story.createdAt || 0;
                                        const id = `${title}-${timestamp}`;
                                        return id === this.storyId;
                                    });
                                    
                                    if (correctStory) {
                                        console.log("Found correct story by ID");
                                        storyData = correctStory;
                                    } else {
                                        console.log("Could not find story by ID, using index anyway");
                                        storyData = candidateStory;
                                    }
                                } else {
                                    console.log("Story ID verification successful");
                                    storyData = candidateStory;
                                }
                            } else {
                                // No ID provided, just use the index
                                storyData = candidateStory;
                            }
                        } else {
                            // Direct story JSON file
                            storyData = data;
                        }
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError);
                        throw new Error(`Failed to parse story data: ${parseError.message}`);
                    }
                } else {
                    // It's a URL, fetch it
                    console.log("Loading story from URL");
                    
                    // If the URL doesn't start with http, add the base FS URL
                    let fetchUrl = this.fileUrl;
                    if (!fetchUrl.startsWith('http')) {
                        fetchUrl = `${this.BASE_FS_URL}${fetchUrl.startsWith('/') ? '' : '/'}${fetchUrl}`;
                    }
                    
                    console.log("Fetching from URL:", fetchUrl);
                    const response = await fetch(fetchUrl);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch story: ${response.status} ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Check if this is a generations.json file with an index parameter
                    if (this.storyIndex !== null && data.generations && Array.isArray(data.generations)) {
                        console.log("Loading story from generations.json with index:", this.storyIndex);
                        const index = parseInt(this.storyIndex, 10);
                        if (isNaN(index) || index < 0 || index >= data.generations.length) {
                            throw new Error(this.$t('story.invalidIndex'));
                        }
                        
                        // Get the story by index
                        const candidateStory = data.generations[index];
                        
                        // If we have a storyId, verify the index points to the correct story
                        if (this.storyId) {
                            console.log("Verifying story ID:", this.storyId);
                            // Create the same format ID as in the my-stories component
                            const storyTitle = candidateStory.title || "untitled";
                            const storyTimestamp = candidateStory.createdAt || 0;
                            const candidateId = `${storyTitle}-${storyTimestamp}`;
                            
                            // If IDs don't match, try to find the correct story by ID
                            if (candidateId !== this.storyId) {
                                console.warn("Story ID mismatch! Index might be incorrect");
                                
                                // Try to find the story by ID in the generations array
                                const correctStory = data.generations.find(story => {
                                    const title = story.title || "untitled";
                                    const timestamp = story.createdAt || 0;
                                    const id = `${title}-${timestamp}`;
                                    return id === this.storyId;
                                });
                                
                                if (correctStory) {
                                    console.log("Found correct story by ID");
                                    storyData = correctStory;
                                } else {
                                    console.log("Could not find story by ID, using index anyway");
                                    storyData = candidateStory;
                                }
                            } else {
                                console.log("Story ID verification successful");
                                storyData = candidateStory;
                            }
                        } else {
                            // No ID provided, just use the index
                            storyData = candidateStory;
                        }
                    } else {
                        storyData = data;
                    }
                }
                
                // Process the story data
                this.story = {
                    id: storyData.id || null,
                    title: storyData.title || "",
                    content: storyData.content || "",
                    story: storyData.story || "",
                    audioUrl: storyData.audioUrl || null,
                    coverUrl: storyData.coverUrl || "/assets/image/bg.webp",
                    imageBase64: storyData.imageBase64 || null,
                    createdAt: storyData.createdAt || new Date().toISOString(),
                    updatedAt: storyData.updatedAt || new Date().toISOString(),
                    isNew: storyData.isNew || false,
                    childName: storyData.childName || "",
                    themes: storyData.themes || storyData.interests || "",
                    voice: storyData.voice || ""
                };
                
                // Fix URLs for coverUrl and audioUrl if they're relative paths
                if (this.story.coverUrl && !this.story.coverUrl.startsWith('http') && !this.story.coverUrl.startsWith('data:')) {
                    this.story.coverUrl = `${this.BASE_FS_URL}${this.story.coverUrl.startsWith('/') ? '' : '/'}${this.story.coverUrl}`;
                }
                
                if (this.story.audioUrl && !this.story.audioUrl.startsWith('http') && !this.story.audioUrl.startsWith('data:')) {
                    this.story.audioUrl = `${this.BASE_FS_URL}${this.story.audioUrl.startsWith('/') ? '' : '/'}${this.story.audioUrl}`;
                }
                
                // Fix permissions and verify accessibility of media files
                await this.verifyAndFixMediaFiles();
                
                this.loading = false;
                
                // Initialize audio player
                this.$nextTick(() => {
                    if (this.$refs.audioPlayer) {
                        this.$refs.audioPlayer.load();
                    }
                });
            } catch (error) {
                console.error("Error loading story:", error);
                this.error = `${this.$t('story.errorLoading')}: ${error.message}`;
                this.loading = false;
            }
        },
        
        // Fix permissions and verify accessibility of media files
        async verifyAndFixMediaFiles() {
            console.log("[MÍDIA] Iniciando verificação de arquivos de mídia");
            this.fileCheckCurrentAttempt = 0;
            this.coverReady = false;
            this.audioReady = false;
            
            // Set permissions for both files first
            console.log("[MÍDIA] Tentando corrigir permissões dos arquivos");
            await this.fixMediaPermissions();
            
            // Then verify they're accessible with retries
            console.log("[MÍDIA] Verificando acessibilidade dos arquivos");
            await this.verifyMediaFilesAccessibility();
            
            console.log("[MÍDIA] Status final dos arquivos de mídia:");
            console.log("[MÍDIA] - Imagem de capa pronta:", this.coverReady);
            console.log("[MÍDIA] - Áudio pronto:", this.audioReady);
        },
        
        // Fix permissions for media files
        async fixMediaPermissions() {
            try {
                // Fix permissions for cover image
                if (this.story.coverUrl && !this.story.coverUrl.startsWith('data:')) {
                    console.log("[MÍDIA] Verificando permissões da imagem de capa:", this.story.coverUrl);
                    this.fileCheckMessage = this.$t('story.preparingCover');
                    await this.fixFilePermissions(this.story.coverUrl);
                } else if (this.story.coverUrl && this.story.coverUrl.startsWith('data:')) {
                    console.log("[MÍDIA] Imagem de capa é data URL, não precisa de permissões");
                    this.coverReady = true;
                } else {
                    console.log("[MÍDIA] Sem imagem de capa para verificar");
                    this.coverReady = true; // No cover to check
                }
                
                // Fix permissions for audio file
                if (this.story.audioUrl && !this.story.audioUrl.startsWith('data:')) {
                    console.log("[MÍDIA] Verificando permissões do áudio:", this.story.audioUrl);
                    this.fileCheckMessage = this.$t('story.preparingAudio');
                    await this.fixFilePermissions(this.story.audioUrl);
                } else if (this.story.audioUrl && this.story.audioUrl.startsWith('data:')) {
                    console.log("[MÍDIA] Áudio é data URL, não precisa de permissões");
                    this.audioReady = true;
                } else {
                    console.log("[MÍDIA] Sem áudio para verificar");
                    this.audioReady = true; // No audio to check
                }
            } catch (error) {
                console.warn("[MÍDIA] Erro ao corrigir permissões de mídia:", error);
            }
        },
        
        // Fix permissions for a specific file
        async fixFilePermissions(fileUrl) {
            if (!fileUrl) return;
            console.log(`[PERMISSÕES] Tentando corrigir permissões para arquivo: ${fileUrl}`);
            
            try {
                // Get the path without the domain if it's a URL
                let filepath = fileUrl;
                if (fileUrl.startsWith('http')) {
                    // Extract the path from URLs like https://fs.webdraw.com/path/to/file
                    const match = fileUrl.match(/https?:\/\/[^\/]+(\/.*)/);
                    if (match && match[1]) {
                        filepath = match[1];
                        console.log(`[PERMISSÕES] Caminho extraído da URL: ${filepath}`);
                    } else {
                        console.log(`[PERMISSÕES] Não foi possível extrair o caminho da URL: ${fileUrl}`);
                        return;
                    }
                }
                
                console.log(`[PERMISSÕES] Verificando disponibilidade de métodos SDK para ${filepath}`);
                console.log(`[PERMISSÕES] SDK disponível: ${!!sdk}`);
                console.log(`[PERMISSÕES] SDK.fs disponível: ${!!(sdk && sdk.fs)}`);
                console.log(`[PERMISSÕES] chmod disponível: ${!!(sdk && sdk.fs && typeof sdk.fs.chmod === 'function')}`);
                console.log(`[PERMISSÕES] setPublic disponível: ${!!(sdk && sdk.fs && typeof sdk.fs.setPublic === 'function')}`);
                
                // Try to use chmod if available to make the file publicly accessible
                if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
                    try {
                        console.log(`[PERMISSÕES] Tentando aplicar chmod 644 para ${filepath}`);
                        await sdk.fs.chmod(filepath, 0o644);
                        console.log(`[PERMISSÕES] Permissões chmod 644 aplicadas com sucesso para ${filepath}`);
                        return true;
                    } catch (chmodError) {
                        console.warn(`[PERMISSÕES] Erro ao usar chmod em ${filepath}:`, chmodError);
                    }
                }
                
                // Fallback to setPublic if available
                if (sdk && sdk.fs && typeof sdk.fs.setPublic === 'function') {
                    try {
                        console.log(`[PERMISSÕES] Tentando usar setPublic para ${filepath}`);
                        await sdk.fs.setPublic(filepath);
                        console.log(`[PERMISSÕES] Arquivo ${filepath} tornado público com sucesso`);
                        return true;
                    } catch (publicError) {
                        console.warn(`[PERMISSÕES] Erro ao usar setPublic em ${filepath}:`, publicError);
                    }
                }
                
                console.log(`[PERMISSÕES] Nenhum método disponível para configurar permissões para ${filepath}`);
                return false;
            } catch (error) {
                console.error(`[PERMISSÕES] Erro ao configurar permissões para ${fileUrl}:`, error);
                return false;
            }
        },
        
        // Verify that media files are accessible
        async verifyMediaFilesAccessibility() {
            console.log("[ACESSIBILIDADE] Iniciando verificação de acessibilidade dos arquivos de mídia");
            this.fileCheckCurrentAttempt = 0;
            this.fileCheckMaxAttempts = 5;
            const retryDelay = 1000;
            
            // If we already have a data URL for the image or no image, we don't need to check accessibility
            if (!this.story.coverUrl || this.story.coverUrl.startsWith('data:') || this.story.imageBase64) {
                console.log("[ACESSIBILIDADE] Imagem não precisa de verificação (data URL ou não existe)");
                this.coverReady = true;
            }
            
            // If we already have a data URL for the audio or no audio, we don't need to check accessibility
            if (!this.story.audioUrl || this.story.audioUrl.startsWith('data:')) {
                console.log("[ACESSIBILIDADE] Áudio não precisa de verificação (data URL ou não existe)");
                this.audioReady = true;
            }
            
            // If both are ready, we're done
            if (this.coverReady && this.audioReady) {
                console.log("[ACESSIBILIDADE] Todos os arquivos já estão prontos, não é necessário verificar");
                return;
            }
            
            // Try to verify accessibility with retries
            for (let i = 0; i < this.fileCheckMaxAttempts; i++) {
                this.fileCheckCurrentAttempt = i + 1;
                console.log(`[ACESSIBILIDADE] Tentativa ${i + 1}/${this.fileCheckMaxAttempts}`);
                
                // Check cover image if not already ready
                if (!this.coverReady && this.story.coverUrl && !this.story.coverUrl.startsWith('data:')) {
                    try {
                        console.log(`[ACESSIBILIDADE] Verificando acessibilidade da imagem: ${this.story.coverUrl}`);
                        this.fileCheckMessage = this.$t('story.checkingCover');
                        const coverAccessible = await this.checkFileAccessibility(this.story.coverUrl);
                        if (coverAccessible) {
                            console.log("[ACESSIBILIDADE] Imagem de capa está acessível");
                        this.coverReady = true;
                        } else {
                            console.log("[ACESSIBILIDADE] Imagem de capa não está acessível ainda");
                        }
                    } catch (error) {
                        console.warn(`[ACESSIBILIDADE] Erro ao verificar imagem de capa (${i + 1}/${this.fileCheckMaxAttempts}):`, error);
                    }
                }
                
                // Check audio if not already ready
                if (!this.audioReady && this.story.audioUrl && !this.story.audioUrl.startsWith('data:')) {
                    try {
                        console.log(`[ACESSIBILIDADE] Verificando acessibilidade do áudio: ${this.story.audioUrl}`);
                        this.fileCheckMessage = this.$t('story.checkingAudio');
                        const audioAccessible = await this.checkFileAccessibility(this.story.audioUrl);
                        if (audioAccessible) {
                            console.log("[ACESSIBILIDADE] Áudio está acessível");
                        this.audioReady = true;
                        } else {
                            console.log("[ACESSIBILIDADE] Áudio não está acessível ainda");
                        }
                    } catch (error) {
                        console.warn(`[ACESSIBILIDADE] Erro ao verificar áudio (${i + 1}/${this.fileCheckMaxAttempts}):`, error);
                    }
                }
                
                // If all files are accessible, we're done
                if ((this.coverReady || !this.story.coverUrl) && (this.audioReady || !this.story.audioUrl)) {
                    console.log("[ACESSIBILIDADE] Todos os arquivos estão acessíveis (ou não existem)");
                    break;
                }
                
                // Wait before trying again
                if (i < this.fileCheckMaxAttempts - 1) {
                    console.log(`[ACESSIBILIDADE] Aguardando ${retryDelay}ms antes da próxima tentativa`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
            
            // If we still can't access some files, we'll mark them as ready anyway
            // so the user can see the content, but we'll add warnings
            if (!this.coverReady && this.story.coverUrl) {
                console.warn("[ACESSIBILIDADE] Não foi possível acessar a imagem de capa após várias tentativas");
                this.coverReady = true;
            }
            
            if (!this.audioReady && this.story.audioUrl) {
                console.warn("[ACESSIBILIDADE] Não foi possível acessar o áudio após várias tentativas");
                this.audioReady = true;
            }
        },
        
        // Check if a file is accessible
        async checkFileAccessibility(fileUrl) {
            if (!fileUrl) {
                console.error("[VERIFICAÇÃO] URL de arquivo não fornecida para verificação");
                return Promise.reject(new Error("No file URL provided"));
            }
            
            console.log(`[VERIFICAÇÃO] Verificando acessibilidade de: ${fileUrl}`);
            
            try {
                // Try a HEAD request first to minimize bandwidth
                const response = await fetch(fileUrl, { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    console.log(`[VERIFICAÇÃO] Arquivo acessível via HEAD: ${fileUrl}`);
                    return true;
                }
                
                console.warn(`[VERIFICAÇÃO] Arquivo não acessível via HEAD (status ${response.status}), tentando GET com Range`);
                
                // If HEAD failed, try a GET with Range header to just get a small piece
                const rangeResponse = await fetch(fileUrl, { 
                    headers: { 'Range': 'bytes=0-10' },
                    cache: 'no-cache'
                });
                
                if (rangeResponse.ok || rangeResponse.status === 206) {
                    console.log(`[VERIFICAÇÃO] Arquivo acessível via GET com Range: ${fileUrl}`);
                    return true;
                }
                
                console.error(`[VERIFICAÇÃO] Arquivo não acessível: ${fileUrl}, status: ${rangeResponse.status}`);
                const responseText = await rangeResponse.text();
                console.error(`[VERIFICAÇÃO] Resposta da verificação:`, responseText.substring(0, 200));
                
                return false;
            } catch (error) {
                console.error(`[VERIFICAÇÃO] Erro ao verificar acessibilidade: ${fileUrl}`, error);
                return false;
            }
        },
        toggleAudio() {
            if (!this.$refs.audioPlayer) return;            
                        
            if (this.isPlaying) {
                this.$refs.audioPlayer.pause();
            } else {
                // Track play click event with PostHog
                if (sdk && sdk.posthogEvent) {
                    sdk.posthogEvent("story_play_clicked", {
                        story_id: this.storyId,
                        story_title: this.story.title
                    });
                }
                this.$refs.audioPlayer.play();
            }
            
            this.isPlaying = !this.isPlaying;
        },
        updateProgress() {
            if (!this.$refs.audioPlayer) return;
            
            const player = this.$refs.audioPlayer;
            const percentage = (player.currentTime / player.duration) * 100;
            this.audioProgress = percentage;
            this.currentTime = player.currentTime;
            this.duration = player.duration;
        },
        audioEnded() {
            this.isPlaying = false;
            this.audioProgress = 0;
            this.currentTime = 0;
            this.duration = 0;
        },
        onAudioLoaded() {
            // This method is called when the audio metadata is loaded
            // You can use it to initialize the currentTime and duration
            this.currentTime = 0;
            this.duration = this.$refs.audioPlayer.duration;
        },
        seekAudio(event) {
            if (!this.$refs.audioPlayer) return;
            
            const player = this.$refs.audioPlayer;
            const progressBar = event.currentTarget;
            const clickPosition = (event.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
            
            player.currentTime = clickPosition * player.duration;
            this.audioProgress = clickPosition * 100;
            this.currentTime = player.currentTime;
        },
        async shareStory() {
            try {
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
                
                // Try to get parent URL as fallback option if we're in an iframe
                try {
                    if (!isLocalhost && window.parent !== window && window.parent.location.href) {
                        // Check if parent URL looks like a webdraw URL
                        const parentUrl = window.parent.location.origin + window.parent.location.pathname;
                        if (parentUrl.includes('webdraw.com')) {
                            baseUrl = parentUrl;
                            console.log("Using parent window URL for sharing:", baseUrl);
                        }
                    }
                } catch (e) {
                    console.warn("Could not access parent window URL:", e);
                    // Continue with already determined baseUrl
                }
                
                // Create a query parameter with the story path
                let shareUrl;
                
                // Check if the current story is loaded from localStorage
                const isLocalStorageStory = this.fileUrl && (
                    this.fileUrl.endsWith('/localStorage') || 
                    this.fileUrl.includes('/localStorage/') || 
                    this.fileUrl === 'localStorage'
                );
                
                if (isLocalStorageStory) {
                    console.log("This is a localStorage story - handling specially for sharing");
                    
                    // For localStorage stories, we need to save them to a file first to be shareable
                    if (this.story && sdk && sdk.fs && typeof sdk.fs.write === 'function') {
                        try {
                            // Create a filename from the story title
                            let safeFilename = this.story.title 
                                ? this.story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json'
                                : 'shared_story_' + new Date().getTime() + '.json';
                            
                            // Full path to save the story
                            let saveFilePath = `~/AI Storyteller/${safeFilename}`;
                            
                            // Create the story data to save
                            const storyData = {
                                title: this.story.title || "",
                                content: this.story.content || "",
                                story: this.story.story || "",
                                audioUrl: this.story.audioUrl || null,
                                coverUrl: this.story.coverUrl || "/assets/image/bg.webp",
                                imageBase64: this.story.imageBase64 || null,
                                createdAt: this.story.createdAt || new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                childName: this.story.childName || "",
                                themes: this.story.themes || this.story.interests || "",
                                voice: this.story.voice || ""
                            };
                            
                            // Save the story to a file
                            await sdk.fs.write(saveFilePath, JSON.stringify(storyData, null, 2));
                            console.log("Saved localStorage story to file for sharing:", saveFilePath);
                            
                            // Set permissions for just this file
                            if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
                                await sdk.fs.chmod(saveFilePath, 0o644);
                                console.log("Set permissions for shared story file:", saveFilePath);
                            }
                            
                            // Get user ID from current working directory
                            let userId = null;
                            try {
                                if (typeof sdk.fs.cwd === 'function') {
                                    const cwdPath = await sdk.fs.cwd();
                                    const cwdMatch = cwdPath.match(/\/users\/([^\/]+)/);
                                    if (cwdMatch && cwdMatch[1]) {
                                        userId = cwdMatch[1];
                                    }
                                }
                            } catch (cwdError) {
                                console.error("Error getting current working directory:", cwdError);
                            }
                            
                            // Fallback user ID if needed
                            if (!userId) {
                                userId = "a4896ea5-db22-462e-a239-22641f27118c"; // Default ID
                            }
                            
                            // Create the share URL with the new file - usando apenas o userId e o filename, sem duplicar AI Storyteller
                            shareUrl = `${baseUrl}?story=${encodeURIComponent(userId + '/' + safeFilename)}`;
                        } catch (saveError) {
                            console.error("Failed to save localStorage story to file:", saveError);
                            // Fallback to current URL
                            shareUrl = window.location.href;
                        }
                    } else {
                        console.warn("Cannot share localStorage story properly - missing SDK or story data");
                        shareUrl = window.location.href;
                    }
                } else if (this.fileUrl) {
                    let userId = null;
                    let storyId = null;
                    
                    // Standard pattern: /users/{userId}/AI Storyteller/{storyName}
                    const pathRegex = /\/users\/([^\/]+)\/AI Storyteller\/(.*)/;
                    const match = this.fileUrl.match(pathRegex);
                    
                    if (match && match.length >= 3) {
                        // Extract userId and storyId from the file path
                        userId = match[1];
                        storyId = match[2];
                        console.log("Extracted from standard path format - userId:", userId, "storyId:", storyId);
                    } 
                    // Home directory reference: ~/AI Storyteller/{storyName} or other relative path
                    else {
                        // Use fs.cwd() to get the current working directory which will include the user ID
                        try {
                            if (sdk && sdk.fs && typeof sdk.fs.cwd === 'function') {
                                const cwdPath = await sdk.fs.cwd();
                                console.log("Current working directory:", cwdPath);
                                
                                // Extract user ID from the cwd path
                                const cwdMatch = cwdPath.match(/\/users\/([^\/]+)/);
                                if (cwdMatch && cwdMatch[1]) {
                                    userId = cwdMatch[1];
                                    console.log("Extracted userId from CWD:", userId);
                                }
                                
                                // Extract the story filename
                                if (this.fileUrl.includes('AI Storyteller/')) {
                                    const storyParts = this.fileUrl.split('AI Storyteller/');
                                    if (storyParts.length > 1) {
                                        storyId = storyParts[1]; // Get everything after "AI Storyteller/"
                                    } else {
                                        let pathParts = this.fileUrl.split('/');
                                        storyId = pathParts[pathParts.length - 1]; 
                                    }
                                } else {
                                    // Just the filename
                                    let pathParts = this.fileUrl.split('/');
                                    storyId = pathParts[pathParts.length - 1];
                                }
                                console.log("Extracted story ID:", storyId);
                            } else {
                                console.warn("sdk.fs.cwd is not available");
                            }
                        } catch (cwdError) {
                            console.error("Error getting current working directory:", cwdError);
                        }
                        
                        // If we still don't have a userId, try alternate methods
                        if (!userId) {
                            // Fallback - try to get user ID from route
                            if (this.$route && this.$route.query && this.$route.query.story) {
                                const storyParts = this.$route.query.story.split('/');
                                if (storyParts.length > 0 && storyParts[0] !== 'anonymous') {
                                    userId = storyParts[0];
                                    console.log("Got userId from route query:", userId);
                                }
                            }
                            
                            // Another fallback - if we're in localhost for testing
                            if (!userId && isLocalhost) {
                                userId = "a4896ea5-db22-462e-a239-22641f27118c"; // The ID seen in working URLs
                                console.log("Using fallback userId for localhost:", userId);
                            }
                            
                            // Final fallback
                            if (!userId) {
                                userId = "anonymous";
                                console.log("Using anonymous userId as last resort");
                            }
                        }
                    }
                    
                    // Clean up the storyId - remove any leading/trailing slashes
                    storyId = storyId.replace(/^\/+|\/+$/g, '');
                    
                    // If we end up with an empty storyId, use a default
                    if (!storyId || storyId.trim() === '') {
                        storyId = "story.json";
                    }
                    
                    // Set permissions for just this specific file
                    if (sdk && sdk.fs && typeof sdk.fs.chmod === 'function') {
                        try {
                            let filePath = this.fileUrl;
                            if (filePath.startsWith('~')) {
                                filePath = filePath.substring(1);
                            }
                            await sdk.fs.chmod(filePath, 0o644);
                            console.log("Set permissions for specific story file:", filePath);
                        } catch (chmodError) {
                            console.warn("Error setting permissions for story file:", chmodError);
                        }
                    }
                    
                    // Always use story parameter format for sharing - usando apenas o userId e o storyId, sem duplicar AI Storyteller 
                    shareUrl = `${baseUrl}?story=${encodeURIComponent(userId + '/' + storyId)}`;
                    
                    // If we also have an index, include it
                    if (this.storyIndex !== null) {
                        shareUrl += `&index=${this.storyIndex}`;
                    }
                    
                    // If we have a story ID, include it for verification
                    if (this.storyId) {
                        shareUrl += `&id=${encodeURIComponent(this.storyId)}`;
                    }
                } else {
                    // Fallback to current URL if no fileUrl available
                    shareUrl = window.location.href;
                }
                
                console.log("Final share URL:", shareUrl);
                
                // Track share event with PostHog
                if (sdk && sdk.posthogEvent) {
                    sdk.posthogEvent("story_shared", {
                        story_id: this.storyId,
                        story_title: this.story.title,
                        share_url: shareUrl
                    });
                }
                
                // Try to use the Web Share API if available
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: this.story?.title || "Shared Story",
                            text: `Check out this story: ${this.story?.title || ""}`,
                            url: shareUrl
                        });
                        console.log("Successfully shared via Web Share API");
                    } catch (err) {
                        // Don't use navigator.share again if it fails
                        console.error("Error sharing:", err);
                        this.fallbackShare(shareUrl);
                    }
                } else {
                    this.fallbackShare(shareUrl);
                }
            } catch (overallError) {
                console.error("Unexpected error in shareStory:", overallError);
                alert(this.$t('ui.errorSharing'));
            }
        },
        fallbackShare(url) {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(url).then(() => {
                // Show toast notification instead of alert
                this.showToastNotification(this.$t('ui.copied') || 'Copied story');
            }).catch(err => {
                console.error('Failed to copy:', err);
                // Instead of showing a prompt, show a toast notification with the URL
                // Create a temporary textarea element to copy the text
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
                        this.showToastNotification(this.$t('ui.copied') || 'Copied story');
                    } else {
                        // Still failed with execCommand, show a different message
                        this.showToastNotification(this.$t('ui.copyFailed') || 'Could not copy link automatically');
                    }
                } catch (e) {
                    console.error('Secondary copy method failed:', e);
                    this.showToastNotification(this.$t('ui.copyFailed') || 'Could not copy link automatically');
                }
            });
        },
        
        // Show toast notification with auto-dismiss
        showToastNotification(message) {
            // Clear any existing timeout
            if (this.toastTimeout) {
                clearTimeout(this.toastTimeout);
            }
            
            this.toastMessage = message;
            this.showToast = true;
            
            // Auto-dismiss after 5 seconds
            this.toastTimeout = setTimeout(() => {
                this.showToast = false;
            }, 5000);
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
        
        hasHtmlContent(text) {
            // Simple check for HTML tags
            return text && /<[a-z][\s\S]*>/i.test(text);
        },
        formatTitle(title) {
            if (!title) return this.$t('story.untitledStory');
            
            // Remove any HTML tags if present
            return title.replace(/<[^>]*>/g, '');
        },
        
        // Add current story as an example in translations.json
        async addAsExample() {
            console.log("Adding story as example...");
            
            // Double-check admin status before proceeding
            if (!await this.checkIfAdmin()) {
                console.warn("Attempted to add example without admin privileges");
                this.exampleAddedMessage = "Error: Admin privileges required";
                return;
            }
            
            if (!this.story) {
                console.warn("No story to add as example");
                this.exampleAddedMessage = "Error: No story to add";
                return;
            }
            
            this.addingAsExample = true;
            this.exampleAddedMessage = '';
            
            try {
                // Create example object from current story
                const newExample = {
                    title: this.story.title || "Untitled Story",
                    childName: this.story.childName || "",
                    theme: this.story.theme || this.story.themes || this.story.interests || "",
                    description: this.story.excerpt || (this.story.story ? this.story.story.substring(0, 150) + '...' : ''),
                    voice: typeof this.story.voice === 'object' ? this.story.voice.name : (this.story.voice || ""),
                    voiceAvatar: typeof this.story.voice === 'object' ? (this.story.voice.avatar || "") : "",
                    coverImage: this.story.coverUrl || "",
                    audio: this.story.audioUrl || "",
                    isPlaying: false,
                    progress: "0%"
                };
                
                // Load translations.json
                const translatorPath = "~/AI Storyteller/translations.json";
                
                // First check if the file exists
                if (typeof sdk.fs.exists === 'function') {
                    const exists = await sdk.fs.exists(translatorPath);
                    if (!exists) {
                        throw new Error(`Translations file not found at path: ${translatorPath}`);
                    }
                }
                
                let translations;
                
                try {
                    const content = await sdk.fs.read(translatorPath);
                    if (!content) {
                        throw new Error("Empty translations file");
                    }
                    
                    try {
                        translations = JSON.parse(content);
                    } catch (parseError) {
                        throw new Error(`Invalid JSON in translations file: ${parseError.message}`);
                    }
                } catch (error) {
                    console.error("Error reading translations file:", error);
                    throw new Error(`Failed to read translations file: ${error.message}`);
                }
                
                // Get current language
                const currentLanguage = i18n.getLanguage();
                
                // Verify the translations object has the expected structure
                if (!translations[currentLanguage]) {
                    throw new Error(`Current language "${currentLanguage}" not found in translations`);
                }
                
                // Add example to current language
                if (!translations[currentLanguage].examples) {
                    translations[currentLanguage].examples = [];
                }
                
                translations[currentLanguage].examples.push(newExample);
                
                // If adding to English, add to all other languages too
                if (currentLanguage === 'en') {
                    Object.keys(translations).forEach(langCode => {
                        if (langCode !== 'en') {
                            if (!translations[langCode].examples) {
                                translations[langCode].examples = [];
                            }
                            
                            // Add a copy of the new example to this language
                            const exampleCopy = { ...newExample };
                            translations[langCode].examples.push(exampleCopy);
                        }
                    });
                }
                
                // Save updated translations
                const jsonContent = JSON.stringify(translations, null, 2);
                await sdk.fs.write(translatorPath, jsonContent);
                
                // Update global translations
                if (window.i18n && window.i18n.translations) {
                    window.i18n.translations = JSON.parse(JSON.stringify(translations));
                    
                    // Notify components that translations have been updated
                    if (window.eventBus) {
                        window.eventBus.emit('translations-updated');
                    }
                }
                
                console.log("Successfully added story as example");
                this.exampleAddedMessage = this.$t('ui.exampleAddedSuccess');
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    this.exampleAddedMessage = '';
                }, 3000);
                
            } catch (error) {
                console.error("Error adding story as example:", error);
                // Use the i18n.tf function for variable substitution
                this.exampleAddedMessage = i18n.tf('ui.exampleAddedError', { errorMessage: error.message });
            } finally {
                this.addingAsExample = false;
            }
        },
        getOptimizedImageUrl(url, width, height) {
            // Null check for story object entirely - this prevents the TypeError
            if (!this.story) return "/assets/image/bg.webp";
            
            // Se não houver URL mas houver base64, use o base64
            if ((!url || url === "/assets/image/bg.webp") && this.story.imageBase64) {
                return this.story.imageBase64;
            }
            
            if (!url || url.startsWith('data:')) return url;
            
            // Se a URL já começa com /assets/image, apenas retorne-a diretamente
            if (url.startsWith('/assets/image') || url.startsWith('assets/image')) {
                return url.startsWith('/') ? url : `/${url}`;
            }
            
            // Para caminhos locais, use o caminho direto
            let processedUrl = url;
            
            // Se a URL não é absoluta e não começa com uma barra, adicione uma barra
            if (!url.startsWith('http') && !url.startsWith('/')) {
                processedUrl = '/' + url;
            }
            
            // Retorne a URL direta sem serviço de otimização
            if (!processedUrl.startsWith('http')) {
                return `${window.location.origin}${processedUrl}`;
            }
            
            return processedUrl;
        },
        
        // Format time in MM:SS format
        formatTime(seconds) {
            if (!seconds || isNaN(seconds)) return "00:00";
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(remainingSeconds).padStart(2, '0');
            
            return `${formattedMinutes}:${formattedSeconds}`;
        },
        
        // Scroll to the story text section
        scrollToText() {
            const storyTextElement = document.querySelector('.story-text-container');
            if (storyTextElement) {
                storyTextElement.scrollIntoView({ behavior: 'smooth' });
            }
        },
        async downloadAudio() {
            if (!this.story || !this.story.audioUrl) {
                console.warn("No audio URL to download");
                return;
            }

            try {
                const response = await fetch(this.story.audioUrl);
                if (!response.ok) {
                    throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = this.story.title ? this.story.title.replace(/\s+/g, '_') + '.mp3' : 'story.mp3';
                link.click();
                URL.revokeObjectURL(link.href);

                sdk.posthogEvent("story_audio_downloaded", {
                    story_id: this.storyId,
                    story_title: this.story.title
                });

                console.log("Audio downloaded successfully");
            } catch (error) {
                console.error("Error downloading audio:", error);
                alert(this.$t('story.errorDownloadingAudio'));
            }
        },
        handleImageError(event) {
            console.error("Error loading image:", event);
            console.log("Image that failed to load:", event.target.src);
            
            // Se temos o base64 na própria história, usar isso primeiro
            if (this.story && this.story.imageBase64) {
                console.log("🖼️ Usando imageBase64 da história como fallback");
                event.target.src = this.story.imageBase64;
                return;
            }
            
            // Se temos o storyData original no localStorage, tentar usar imageBase64
            if (typeof localStorage !== 'undefined') {
                try {
                    const storyJson = localStorage.getItem('currentStory');
                    if (storyJson) {
                        const storyData = JSON.parse(storyJson);
                        if (storyData.imageBase64) {
                            console.log("📦 Usando imageBase64 do localStorage");
                            event.target.src = storyData.imageBase64;
                            // Atualizar também na história atual para futuras referências
                            if (this.story) {
                                this.story.imageBase64 = storyData.imageBase64;
                                this.story.image = storyData.imageBase64;
                            }
                            return;
                        }
                    }
                } catch (error) {
                    console.error("❌ Erro ao tentar usar imageBase64 do localStorage:", error);
                }
            }
            
            // Se estamos usando URL do filesystem, tentar recriar a URL
            const currentSrc = event.target.src;
            if (currentSrc && currentSrc.includes('fs.webdraw.com')) {
                console.log("🔄 Tentando recriar URL do filesystem");
                const path = currentSrc.replace('https://fs.webdraw.com', '');
                // Verificar se o caminho é válido
                if (path && path.length > 1) {
                    console.log("👷‍♂️ Reconstruindo URL do filesystem");
                    // Tentar novamente com parâmetro de cache
                    const newSrc = `https://fs.webdraw.com${path}?cache=${Date.now()}`;
                    console.log("🔄 Nova URL:", newSrc);
                    event.target.src = newSrc;
                    return;
                }
            }
            
            // Use fallback image if everything else fails
            console.log("🚨 Usando imagem de fallback");
            event.target.src = this.getRandomFallbackImage();
        },
        // Método para carregar uma história a partir do localStorage
        async loadStoryFromLocalStorage() {
            try {
                const storyJson = localStorage.getItem('currentStory');
                console.log("📄 JSON da história carregado do localStorage:", storyJson);
                
                if (!storyJson) {
                    console.error("❌ Nenhuma história encontrada no localStorage");
                    alert("Não foi possível encontrar a história selecionada.");
                    this.$router.push('/my-stories');
                    return;
                }
                
                // Parse the story data
                const storyData = JSON.parse(storyJson);
                console.log("📚 Objeto da história:", storyData);
                
                // SEMPRE prioritize imageBase64 se disponível (mesmo se já houver image)
                if (storyData.imageBase64) {
                    console.log("🖼️ Usando imageBase64 como imagem principal (estratégia prioritária)");
                    // Analisar o base64 antes de usar
                    this.analyzeBase64Image(storyData.imageBase64);
                    console.log("📊 Tamanho do imageBase64:", this.formatFileSize(Math.round((storyData.imageBase64.length * 3) / 4)));
                    storyData.image = storyData.imageBase64;
                } else if (storyData.image && storyData.image.startsWith('data:')) {
                    // Se não tem imageBase64 específico, mas image já é base64
                    console.log("🖼️ A URL da imagem já é base64");
                    this.analyzeBase64Image(storyData.image);
                    console.log("📊 Tamanho da image base64:", this.formatFileSize(Math.round((storyData.image.length * 3) / 4)));
                } else if (storyData.image) {
                    console.log("🔗 URL da imagem (não base64):", storyData.image);
                }
                
                // Set up the story and UI
                this.story = {
                    id: storyData.id,
                    title: storyData.title,
                    content: storyData.content || storyData.story || "",
                    image: storyData.image || null,
                    imageUrl: storyData.image || storyData.imageBase64 || null, // A UI espera imageUrl para exibir
                    audio: storyData.audio || null,
                    audioUrl: storyData.audio ? this.fixAudioUrl(storyData.audio) : null, // A UI espera audioUrl para reproduzir
                    imageBase64: storyData.imageBase64 || null, // Manter uma referência ao base64 original
                    childName: storyData.childName || "",
                    animal: storyData.animal || "",
                    location: storyData.location || "",
                    createdAt: storyData.createdAt || new Date().toISOString()
                };
                
                console.log("📸 URL final da imagem:", this.story.imageUrl);
                console.log("🔊 URL final do áudio:", this.story.audioUrl);
                
                // Format the story text
                this.formattedStory = this.formatStoryText(this.story.content);
                console.log("📝 Texto formatado:", this.formattedStory ? "Presente (comprimento: " + this.formattedStory.length + ")" : "Ausente");
                
                // IMPORTANTE: Desativar a tela de carregamento!
                this.loading = false;
                console.log("🔄 Tela de carregamento desativada, this.loading = false");
                
                // Forçar atualização da UI
                this.$forceUpdate();
                
                // Setup the audio player if audio is available
                if (this.story.audioUrl) {
                  try {
                    this.setupAudioPlayer();
                    console.log("🔊 Player de áudio configurado");
                  } catch (audioError) {
                    console.error("❌ Erro ao configurar o player de áudio:", audioError);
                  }
                }
                
                // Verificar o estado final após carregamento
                console.log("📊 Estado final após carregamento:");
                console.log("- loading:", this.loading);
                console.log("- story:", this.story);
                console.log("- formattedStory:", this.formattedStory ? "Presente" : "Ausente");
            } catch (error) {
                console.error("❌ Erro ao carregar história:", error);
                this.error = "Erro ao processar a história: " + error.message;
                this.loading = false;
            }
        },
        // Método para formatar o tamanho do arquivo
        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' bytes';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
            else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
            else return (bytes / 1073741824).toFixed(2) + ' GB';
        },
        // Método para analisar base64
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
                console.log(`📝 Primeiros 30 caracteres da data: ${base64Data.substring(0, 30)}...`);
                console.log(`📝 Últimos 30 caracteres da data: ...${base64Data.substring(base64Data.length - 30)}`);
            } else {
                // Não é uma data URL
                console.log(`📝 === ANÁLISE DE STRING BASE64 (formato bruto) ===`);
                console.log(`📝 Formato: String base64 bruta (sem prefixo data:))`);
                console.log(`📝 Tamanho aproximado: ${this.formatFileSize(Math.floor((base64String.length * 3) / 4))}`);
                console.log(`📝 Comprimento total da string: ${base64String.length} caracteres`);
                console.log(`📝 Primeiros 30 caracteres: ${base64String.substring(0, 30)}...`);
                console.log(`📝 Últimos 30 caracteres: ...${base64String.substring(base64String.length - 30)}`);
            }
        },
        // Método para corrigir URLs de áudio potencialmente problemáticas
        fixAudioUrl(url) {
            if (!url) return url;
            
            // Manter URLs de dados como estão
            if (url.startsWith('data:')) return url;
            
            // Verificar se a URL já tem um proxy e removê-lo
            if (url.includes('corsproxy.io') || url.includes('cors-anywhere')) {
                const match = url.match(/https?:\/\/corsproxy\.io\/\?(https?:\/\/.+)$/);
                if (match && match[1]) {
                    console.log("🔄 Removendo proxy desnecessário da URL de áudio");
                    return decodeURIComponent(match[1]);
                }
            }
            
            // Garantir que URLs do WebDraw começam com https
            if (url.includes('fs.webdraw.com') && !url.startsWith('https://')) {
                if (url.startsWith('http://')) {
                    console.log("🔒 Convertendo URL de HTTP para HTTPS");
                    return url.replace('http://', 'https://');
                } else if (!url.startsWith('//')) {
                    console.log("🔗 Adicionando protocolo HTTPS à URL");
                    return `https://${url}`;
                }
            }
            
            return url;
        },
        // Função utilitária para obter o texto da história de qualquer fonte disponível
        getStoryText() {
            if (!this.story) return '';
            return this.formattedStory || this.story.content || this.story.story || '';
        },
        // Method to set up the audio player
        setupAudioPlayer() {
            this.$nextTick(() => {
                const audioPlayer = this.$refs.audioPlayer;
                if (audioPlayer && this.story.audio) {
                    console.log("🔊 Configurando player de áudio com URL:", this.story.audio);
                    
                    // Clear existing sources
                    while (audioPlayer.firstChild) {
                        audioPlayer.removeChild(audioPlayer.firstChild);
                    }
                    
                    // Verificar tipo de URL de áudio
                    if (this.story.audio.includes('fs.webdraw.com')) {
                        // Para URLs WebDraw, usar diretamente
                        console.log("🔊 Usando URL direta do WebDraw");
                        const source = document.createElement('source');
                        source.type = "audio/mp3";
                        source.src = this.story.audio;
                        audioPlayer.appendChild(source);
                    } else {
                        // Para outras URLs, tentar múltiplos formatos
                        console.log("🔊 Adicionando múltiplas fontes para compatibilidade");
                        
                        // Add direct URL with different formats
                        [
                            { type: "audio/mp3", src: this.story.audio },
                            { type: "audio/mpeg", src: this.story.audio },
                            { type: "audio/wav", src: this.story.audio }
                        ].forEach(format => {
                            const source = document.createElement('source');
                            source.type = format.type;
                            source.src = format.src;
                            audioPlayer.appendChild(source);
                        });
                    }
                    
                    // Add fallback text
                    const fallbackText = document.createTextNode('Seu navegador não suporta o elemento de áudio.');
                    audioPlayer.appendChild(fallbackText);
                    
                    // Load the audio
                    audioPlayer.load();
                    
                    console.log("🔊 Player de áudio configurado com sucesso");
                } else {
                    console.warn("⚠️ Elemento de áudio não encontrado ou áudio não disponível");
                }
            });
        },
        // Get a random fallback image
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
        }
    }
};

// Export for module systems while maintaining window compatibility
export default window.StoryPage;
