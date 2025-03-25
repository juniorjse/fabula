import { sdk } from "../sdk.js";
import i18n from "../i18n/index.js";

window.StoryPage = {
    template: `
        <div v-if="sdkAvailable" class="min-h-screen pb-16 bg-[#F4F4F5]">
            <!-- Navigation -->
            <nav class="h-16 px-8 flex items-center relative max-w-3xl mx-auto">
                <router-link to="/" class="absolute left-8">
                    <i class="fas fa-arrow-left text-slate-700"></i>
                </router-link>
            </nav>

            <!-- Loading State -->
            <div v-if="loading" class="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div class="w-16 h-16 border-4 border-[#BBDEFB] border-t-[#4A90E2] rounded-full animate-spin mb-6"></div>
                <p class="text-xl text-[#4A90E2] font-medium">{{ $t('story.loadingStory') }}</p>
                <p v-if="fileCheckMessage" class="text-sm text-[#64748B] mt-2">{{ fileCheckMessage }}</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div class="bg-red-100 border border-red-300 text-red-700 px-8 py-6 rounded-xl mb-6">
                    <h3 class="text-xl font-medium mb-2">{{ $t('story.errorLoadingStory') }}</h3>
                    <p>{{ error }}</p>
                </div>
                <router-link to="/" class="bg-[#0EA5E9] text-white px-6 py-3 rounded-full hover:bg-[#0284C7] font-medium">
                    {{ $t('ui.returnHome') }}
                </router-link>
            </div>

            <!-- Story Display -->
            <main v-else class="max-w-4xl mx-auto">
                <div class="px-6 md:p-8">                    
                    <!-- Story Content -->
                    <div class="mb-8">
                        <div class="flex flex-col items-center mb-8">
                            <!-- Book Cover -->
                            <div class="relative w-full max-w-xs aspect-[138/138] rounded-lg mb-6 overflow-hidden shadow-[0_1px_2px_0_rgba(22,109,149,0.2),0_3px_3px_0_rgba(22,109,149,0.17),0_7px_4px_0_rgba(22,109,149,0.1),0_12px_5px_0_rgba(22,109,149,0.03)]">
                                <img 
                                    v-if="story"
                                    :src="getOptimizedImageUrl(story.coverUrl, 800, 400)" 
                                    :alt="story.title" 
                                    class="w-full h-full object-cover absolute inset-0"
                                    @error="handleCoverImageError"
                                >
                                <img 
                                    v-else
                                    src="/assets/image/bg.webp" 
                                    alt="Default Cover" 
                                    class="w-full h-full object-cover absolute inset-0"
                                >
                                <div class="absolute inset-0 bg-[url('/assets/image/book-texture.svg')] bg-cover bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"></div>
                            </div>
                            
                            <!-- Author and Title -->
                            <div class="text-center w-full">
                                <h1 class="text-2xl font-semibold text-[#334155] mb-4">{{ story ? formatTitle(story.title) : '' }}</h1>
                            </div>
                        </div>

                        <!-- Audio Player -->
                        <div v-if="story" class="flex flex-col gap-2 mb-6">
                            <!-- Progress Bar -->
                            <div class="w-full relative">
                                <div class="w-full h-1 bg-[#CBD5E1] rounded-full cursor-pointer" @click="seekAudio($event)">
                                    <div class="h-1 bg-[#C084FC] rounded-full" :style="{ width: audioProgress + '%' }"></div>
                                </div>
                            </div>
                            
                            <!-- Time Display -->
                            <div class="flex justify-between w-full">
                                <span class="text-xs text-[#64748B] opacity-50">{{ formatTime(currentTime) }}</span>
                                <span class="text-xs text-[#64748B] opacity-50">{{ formatTime(duration) }}</span>
                            </div>
                            
                            <!-- Controls -->
                            <div class="flex justify-center items-center gap-4 mt-4">
                                <button @click="shareStory" class="w-10 h-10 rounded-full bg-[#14B8A6] flex items-center justify-center">
                                    <i class="fas fa-share-alt text-[#F3FBFF]"></i>
                                </button>
                                
                                <button @click="toggleAudio" class="w-16 h-16 rounded-full bg-[#C084FC] border border-[#D8B4FE] shadow-md flex items-center justify-center p-4">
                                    <i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" class="text-[#F3FBFF] text-xl"></i>
                                </button>
                                
                                <button @click="scrollToText" class="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center">
                                    <i class="fas fa-file-alt text-[#F3FBFF]"></i>
                                </button>
                            </div>
                            
                            <audio ref="audioPlayer" :src="story.audioUrl" @timeupdate="updateProgress" @ended="audioEnded" @loadedmetadata="onAudioLoaded"></audio>
                        </div>
                        <div v-else class="mb-6">
                            <!-- Placeholder for audio player when story is not loaded -->
                        </div>
                        
                        <!-- Story Text -->
                        <div class="border border-b border-gray-200 w-full my-8"/>
                        <!-- Story Text Container -->
                        <div class="mt-6 story-text-container">
                            <div v-if="story" class="w-full text-slate-600 text-sm">
                                <div v-if="hasHtmlContent(story.story)" v-html="story.story" class="prose prose-sky max-w-none"></div>
                                <div v-else class="whitespace-pre-wrap">{{ story.story }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <a @click.prevent="downloadAudio" class="bg-gradient-to-b from-purple-300 to-purple-500 border border-purple-700 text-white px-6 py-3 rounded-full shadow-md hover:translate-y-[-2px] transition-transform duration-200 font-medium flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-download"></i>
                            {{ $t('ui.downloadAudio') }}
                        </a>
                        <router-link to="/create" class="border border-purple-700 text-purple-700 px-6 py-3 rounded-full hover:bg-purple-50 shadow-md hover:translate-y-[-2px] transition-transform duration-200 font-medium flex items-center justify-center gap-2">
                            <i class="fa-solid fa-plus"></i>
                            {{ $t('ui.createNewStory') }}
                        </router-link>
                        <!-- Add as Example Button (Admin Only) -->
                        <button 
                            v-if="isAdmin && translationsFileExists" 
                            @click="addAsExample" 
                            class="border border-[#4A90E2] text-[#4A90E2] px-6 py-3 rounded-full hover:bg-[#F0F9FF] font-medium flex items-center justify-center gap-2"
                            :disabled="addingAsExample"
                        >
                            <i class="fa-solid fa-bookmark"></i>
                            <span v-if="!addingAsExample">{{ $t('ui.addAsExample') }}</span>
                            <span v-else>{{ $t('ui.adding') }}</span>
                        </button>
                    </div>
                    
                    <!-- Example Added Message -->
                    <div v-if="exampleAddedMessage" class="mb-8 p-4 rounded-lg text-center" :class="exampleAddedMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                        {{ exampleAddedMessage }}
                    </div>
                    
                    <!-- Story Settings (Collapsible) -->
                    <details v-if="story" class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-8 group">
                        <summary class="text-slate-700 font-medium cursor-pointer flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="fa-solid fa-gear mr-2 text-purple-500"></i>
                                {{ $t('ui.storySettings') }}
                            </div>
                            <i class="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform duration-300"></i>
                        </summary>
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                            <div v-if="story.childName" class="space-y-2">
                                <label class="block text-sm font-medium text-slate-500">{{ $t('ui.childName') }}</label>
                                <div class="bg-slate-50 rounded-full px-4 py-2 text-slate-700">
                                    {{ story.childName }}
                                </div>
                            </div>
                            
                            <div v-if="story.themes || story.interests" class="space-y-2">
                                <label class="block text-sm font-medium text-slate-500">{{ $t('ui.themes') }}</label>
                                <div class="bg-slate-50 rounded-full px-4 py-2 text-slate-700">
                                    {{ story.themes || story.interests }}
                                </div>
                            </div>

                            <div v-if="story.voice" class="space-y-2">
                                <label class="block text-sm font-medium text-slate-500">{{ $t('ui.voice') }}</label>
                                <div class="bg-slate-50 rounded-full p-2 text-slate-700 flex items-center gap-2">
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
                <div class="bg-[#14B8A6] text-white px-3 py-2 rounded-full shadow-md flex items-center gap-2 border border-[#0D9488] text-sm">
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
            // Get the file parameter from the route query
            return this.$route.query.file || null;
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
            
            if (!this.fileUrl) {
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
            this.fileCheckCurrentAttempt = 0;
            this.coverReady = false;
            this.audioReady = false;
            
            // Set permissions for both files first
            await this.fixMediaPermissions();
            
            // Then verify they're accessible with retries
            await this.verifyMediaFilesAccessibility();
        },
        
        // Fix permissions for media files
        async fixMediaPermissions() {
            try {
                // Fix permissions for cover image
                if (this.story.coverUrl) {
                    this.fileCheckMessage = this.$t('story.preparingCover');
                    await this.fixFilePermissions(this.story.coverUrl);
                } else {
                    this.coverReady = true; // No cover to check
                }
                
                // Fix permissions for audio file
                if (this.story.audioUrl) {
                    this.fileCheckMessage = this.$t('story.preparingAudio');
                    await this.fixFilePermissions(this.story.audioUrl);
                } else {
                    this.audioReady = true; // No audio to check
                }
            } catch (error) {
                console.warn("Error fixing media permissions:", error);
            }
        },
        
        // Helper method to fix permissions for a file
        async fixFilePermissions(fileUrl) {
            if (!fileUrl || fileUrl.startsWith('data:')) return;
            
            try {
                // Extract the file path from the URL
                let filePath = fileUrl;
                
                // If it's a full URL, extract the path
                if (filePath.startsWith('http')) {
                    try {
                        const url = new URL(fileUrl);
                        filePath = url.pathname;
                    } catch (e) {
                        console.warn("Could not parse URL:", fileUrl);
                        return;
                    }
                }
                
                // Remove the leading ~ if present
                if (filePath.startsWith('~')) {
                    filePath = filePath.substring(1);
                }
                
                // Ensure the path doesn't start with double slashes
                while (filePath.startsWith('//')) {
                    filePath = filePath.substring(1);
                }
                if (sdk && typeof sdk.fs?.chmod === 'function') {
                    await sdk.fs.chmod(filePath, 0o644);
                    console.log(`Successfully set permissions (0o644) for media file: ${filePath}`);
                } else {
                    console.warn("No permission setting method available");
                }
            } catch (error) {
                console.warn(`Could not set file permissions for ${fileUrl}:`, error);
            }
        },
        
        // Verify media files are accessible with retries
        async verifyMediaFilesAccessibility() {
            this.fileCheckCurrentAttempt = 0;
            
            while (this.fileCheckCurrentAttempt < this.fileCheckMaxAttempts) {
                
                // Check cover image if needed
                if (!this.coverReady && this.story.coverUrl) {
                    this.fileCheckMessage = `${this.$t('story.verifyingCover')}`;
                    try {
                        await this.checkFileAccessibility(this.story.coverUrl);
                        this.coverReady = true;
                    } catch (error) {
                        console.warn(`Cover image not yet accessible (attempt ${this.fileCheckCurrentAttempt + 1}/${this.fileCheckMaxAttempts}):`, error);
                    }
                }
                
                // Check audio file if needed
                if (!this.audioReady && this.story.audioUrl) {
                    this.fileCheckMessage = `${this.$t('story.verifyingAudio')}`;
                    try {
                        await this.checkFileAccessibility(this.story.audioUrl);
                        this.audioReady = true;
                    } catch (error) {
                        console.warn(`Audio file not yet accessible (attempt ${this.fileCheckCurrentAttempt + 1}/${this.fileCheckMaxAttempts}):`, error);
                    }
                }
                
                // If both files are ready or not needed, we're done
                if ((this.coverReady || !this.story.coverUrl) && 
                    (this.audioReady || !this.story.audioUrl)) {
                    console.log("All media files are accessible!");
                    return;
                }
                
                // Increment attempt counter
                this.fileCheckCurrentAttempt++;
                
                // If we've reached the maximum attempts, break out
                if (this.fileCheckCurrentAttempt >= this.fileCheckMaxAttempts) {
                    console.warn("Maximum verification attempts reached. Proceeding anyway.");
                    break;
                }
                
                // Wait before trying again
                await new Promise(resolve => setTimeout(resolve, this.fileCheckAttemptDelay));
            }
            
            // Log the results after all attempts
            if (!this.coverReady && this.story.coverUrl) {
                console.warn("Could not confirm cover image is accessible after maximum attempts.");
            }
            
            if (!this.audioReady && this.story.audioUrl) {
                console.warn("Could not confirm audio file is accessible after maximum attempts.");
            }
        },
        
        // Check if a file is accessible via fetch
        async checkFileAccessibility(fileUrl) {
            try {
                if (!fileUrl) return Promise.reject(new Error("No file URL provided"));
                
                const response = await fetch(fileUrl, { method: 'HEAD' });
                
                if (!response.ok) {
                    return Promise.reject(new Error(`File not accessible: ${response.status} ${response.statusText}`));
                }
                
                return Promise.resolve(true);
            } catch (error) {
                return Promise.reject(error);
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
                
                if (this.fileUrl) {
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
                    
                    // Always use story parameter format for sharing
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
                    } catch (err) {
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
            
            // Check if the text already contains HTML formatting
            if (this.hasHtmlContent(text)) {
                return text; // Return as-is if it contains HTML
            }
            
            // Remove the title if it appears at the beginning of the story
            // This way the title only appears in the blue header above
            if (this.story && this.story.title) {
                const title = this.story.title.trim();
                
                // Check for common title patterns at the beginning of the text
                // 1. Exact title match at beginning
                text = text.replace(new RegExp(`^\\s*${title}\\s*[\n\r]+`), '');
                
                // 2. Title with markdown heading format (# Title)
                text = text.replace(new RegExp(`^\\s*#\\s*${title}\\s*[\n\r]+`), '');
                
                // 3. Title with double line or other formatting
                text = text.replace(new RegExp(`^\\s*${title}\\s*[\n\r]+[-=]+[\n\r]+`), '');
            }
            
            // Ensure proper paragraph breaks
            let formattedText = text
                // Replace single newlines with spaces (if they're not part of a paragraph break)
                .replace(/([^\n])\n([^\n])/g, '$1 $2')
                // Ensure paragraphs have proper spacing
                .replace(/\n\n+/g, '\n\n')
                // Trim extra whitespace
                .trim();
                
            return formattedText;
        },
        
        hasHtmlContent(text) {
            // Simple check for HTML tags
            return /<[a-z][\s\S]*>/i.test(text);
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
        handleCoverImageError(event) {
            if (this.story && this.story.imageBase64) {
                event.target.src = this.story.imageBase64;
                return;
            }
            
            event.target.src = "/assets/image/bg.webp";
        }
    }
};