import { sdk } from "../sdk.js";

window.IndexPage = {
  template: `
        <div class="min-h-screen bg-gradient-to-b from-[#E1F5FE] to-[#BBDEFB] pb-16 relative">
            <!-- Background image for mobile only -->
            <div class="absolute inset-0 z-0 md:hidden">
                <img :src="getOptimizedImageUrl('https://fs.webdraw.com/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/bg.webp', 1200, 1200)" alt="Background" class="w-full h-full object-cover fixed" />
            </div>
            
            <!-- Fixed full-height gradient overlay that transitions to white -->
            <div class="absolute inset-0 z-0 bg-gradient-to-b from-white/10 to-white from-0% to-40% h-screen pointer-events-none"></div>
            <!-- White background for content below screen height -->
            <div class="absolute top-[100vh] left-0 right-0 bottom-0 bg-white z-0 pointer-events-none"></div>
                    
            <!-- Navigation -->
            <div class="relative z-10">
                <!-- Navigation Menu -->
                <nav class="py-3 px-4 sm:px-6">
                    <div class="flex justify-between items-center">
                        <!-- Language Switcher - Moved to top left -->
                        <div class="flex-shrink-0">
                            <language-switcher></language-switcher>
                        </div>
                        
                        <!-- My Stories Button - Styled like CTA button but smaller -->
                        <router-link v-if="user" to="/my-stories" @click="trackMyStoriesClick" class="flex justify-center items-center gap-1 py-2 px-4 w-auto min-w-[120px] h-10 bg-gradient-to-b from-purple-300 to-purple-500 border border-purple-700 rounded-full cursor-pointer shadow-md hover:translate-y-[-2px] transition-transform duration-200 font-['Onest'] font-medium text-sm text-white">
                            <span class="flex items-center justify-center">
                                <i class="fa-solid fa-book"></i>
                            </span>
                            {{ $t('ui.myStories') }}
                        </router-link>
                    </div>
                </nav>
            </div>
            
            <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
                <!-- Hero Section -->
                <div class="relative z-10 flex flex-col items-center gap-6 max-w-[342px] md:max-w-[500px] mx-auto py-2 px-6 mb-16">                      
                        <!-- Main heading -->
                        <h1 class="font-['Onest'] font-medium text-3xl md:text-4xl leading-[0.93] tracking-tight text-slate-700 text-center m-0">{{ $t('home.welcome') }}</h1>
                        
                        <!-- CTA section -->
                        <div class="flex flex-col items-center w-full gap-2">
                            <button @click="trackCreateStoryClick(); user ? $router.push('/create') : handleLogin()" class="flex justify-center items-center gap-2 py-3 px-6 w-full md:w-auto md:min-w-[250px] h-12 bg-gradient-to-b from-purple-300 to-purple-500 border border-purple-700 rounded-full cursor-pointer shadow-md hover:translate-y-[-2px] transition-transform duration-200 font-['Onest'] font-medium text-lg text-white">
                                <span class="flex items-center justify-center">
                                    <img src="assets/image/book-icon.svg" alt="Book Icon" />
                                </span>
                                {{ $t('home.createButton') }}
                            </button>
                            <p class="font-['Onest'] font-normal text-xs leading-[1.67] text-slate-500 m-0">{{ $t('home.tryItNow') }}</p>
                        </div>
                    </div>
                <!-- Example Stories Section -->
                <div>                    
                    <!-- Grid com todos os exemplos -->
                    <div v-if="examples && examples.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <!-- Cards de exemplo -->
                        <div v-for="(example, index) in examples" :key="index" 
                             class="rounded-3xl transform transition-all duration-300 hover:-translate-y-2 shadow-md relative"
                             :class="[
                                index % 4 === 0 ? 'bg-gradient-to-b from-teal-200 to-teal-400 border border-teal-700' : '',
                                index % 4 === 1 ? 'bg-gradient-to-b from-purple-200 to-purple-400 border border-purple-700' : '',
                                index % 4 === 2 ? 'bg-gradient-to-b from-amber-200 to-amber-400 border border-amber-700' : '',
                                index % 4 === 3 ? 'bg-gradient-to-b from-blue-200 to-blue-400 border border-blue-700' : ''
                             ]">
                            <div class="pt-24 p-4 pb-2">
                                <!-- Story Info & Details -->
                                <div class="flex flex-col gap-4 mb-4 mt-8">
                                    <!-- Child's Name Tag -->
                                    <div class="flex flex-col gap-1">
                                        <div class="font-bold text-sm"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-900' : '',
                                                 index % 4 === 1 ? 'text-purple-900' : '',
                                                 index % 4 === 2 ? 'text-amber-900' : '',
                                                 index % 4 === 3 ? 'text-blue-900' : ''
                                             ]">{{ $t('ui.childName') }}</div>
                                        <div class="text-sm"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-800' : '',
                                                 index % 4 === 1 ? 'text-purple-800' : '',
                                                 index % 4 === 2 ? 'text-amber-800' : '',
                                                 index % 4 === 3 ? 'text-blue-800' : ''
                                             ]">{{ example.childName || 'Pablo' }}</div>
                                    </div>
                                    
                                    <!-- Themes Tag -->
                                    <div class="flex flex-col gap-1">
                                        <div class="font-bold text-sm"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-900' : '',
                                                 index % 4 === 1 ? 'text-purple-900' : '',
                                                 index % 4 === 2 ? 'text-amber-900' : '',
                                                 index % 4 === 3 ? 'text-blue-900' : ''
                                             ]">{{ $t('ui.themes') }}</div>
                                        <div class="text-sm"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-800' : '',
                                                 index % 4 === 1 ? 'text-purple-800' : '',
                                                 index % 4 === 2 ? 'text-amber-800' : '',
                                                 index % 4 === 3 ? 'text-blue-800' : ''
                                             ]">{{ example.themes || 'Knights, Desert and Telling the Truth' }}</div>
                                    </div>
                                    
                                    <!-- Narrated By Tag -->
                                    <div class="flex flex-col gap-1">
                                        <div class="font-bold text-sm"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-900' : '',
                                                 index % 4 === 1 ? 'text-purple-900' : '',
                                                 index % 4 === 2 ? 'text-amber-900' : '',
                                                 index % 4 === 3 ? 'text-blue-900' : ''
                                             ]">{{ $t('home.narratedBy') }}</div>
                                        <div class="flex items-center gap-1"
                                             :class="[
                                                 index % 4 === 0 ? 'text-teal-800' : '',
                                                 index % 4 === 1 ? 'text-purple-800' : '',
                                                 index % 4 === 2 ? 'text-amber-800' : '',
                                                 index % 4 === 3 ? 'text-blue-800' : ''
                                             ]">
                                            <div class="w-5 h-5 overflow-hidden rounded-full">
                                                <img :src="getOptimizedImageUrl(example.voiceAvatar, 32, 32)" 
                                                    :alt="example.voice" 
                                                    class="w-full h-full object-cover" />
                                            </div>
                                            <span class="text-sm">{{ example.voice }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Story Title and Play Button -->
                                <div class="absolute top-5 right-4 flex items-center gap-4 pl-40">
                                    <h3 class="font-bold text-lg leading-tight"
                                         :class="[
                                             index % 4 === 0 ? 'text-teal-900' : '',
                                             index % 4 === 1 ? 'text-purple-900' : '',
                                             index % 4 === 2 ? 'text-amber-900' : '',
                                             index % 4 === 3 ? 'text-blue-900' : ''
                                         ]">{{ example.title }}</h3>
                                    <button @click="toggleAudio(example)" 
                                            class="rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all duration-200 text-white shadow-md"
                                            :class="[
                                                index % 4 === 0 ? 'bg-teal-800' : '',
                                                index % 4 === 1 ? 'bg-purple-800' : '',
                                                index % 4 === 2 ? 'bg-amber-800' : '',
                                                index % 4 === 3 ? 'bg-blue-800' : ''
                                            ]">
                                        <i v-if="example.loading" class="fa-solid fa-spinner fa-spin"></i>
                                        <i v-else :class="[example.isPlaying ? 'fa-solid fa-stop' : 'fa-solid fa-play']"></i>
                                    </button>
                                </div>
                                
                                <audio 
                                    :id="'audio-' + index" 
                                    :src="getOptimizedAudioUrl(example.audio)" 
                                    @timeupdate="updateProgress($event, example)" 
                                    @ended="audioEnded(example)" 
                                    @canplaythrough="logAudioLoaded(example.title, example.audio)" 
                                    @error="logAudioError(example.title, example.audio, $event)" 
                                    preload="none"></audio>
                                
                                <!-- Create from this button - Updated to match the play button color -->
                                <div class="mt-4">
                                    <button @click="createFromExample(example)" 
                                            class="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-full cursor-pointer shadow-md transition-all duration-200 font-['Onest'] font-medium text-white"
                                            :class="[
                                                index % 4 === 0 ? 'bg-teal-800 hover:bg-teal-900' : '',
                                                index % 4 === 1 ? 'bg-purple-800 hover:bg-purple-900' : '',
                                                index % 4 === 2 ? 'bg-amber-800 hover:bg-amber-900' : '',
                                                index % 4 === 3 ? 'bg-blue-800 hover:bg-blue-900' : ''
                                            ]">
                                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                                        {{ $t('home.createFromThis') }}
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Story Image (positioned absolutely) -->
                            <div class="absolute -top-3 left-4 w-32 h-32 rounded-2xl overflow-hidden shadow-lg border"
                                 :class="[
                                     index % 4 === 0 ? 'border-teal-900' : '',
                                     index % 4 === 1 ? 'border-purple-900' : '',
                                     index % 4 === 2 ? 'border-amber-900' : '',
                                     index % 4 === 3 ? 'border-blue-900' : ''
                                 ]">
                                <img :src="getOptimizedImageUrl(example.coverImage || example.image, 200, 200)" 
                                     :alt="example.title" 
                                     class="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div v-if="!examples || examples.length === 0" class="bg-white rounded-3xl p-8 text-center shadow-lg border-4 border-dashed border-[#64B5F6]">
                        <div class="w-24 h-24 mx-auto mb-4 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-book text-[#4A90E2] text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-700 mb-2">{{ $t('home.noExamples') }}</h3>
                        <p class="text-gray-600">{{ $t('home.checkBackSoon') }}</p>
                    </div>
                </div>
            </main>
        </div>
    `,
  data() {
    return {
      user: null,
      examples: [],
      isPreviewEnvironment: false,
      isAdmin: false,
      refreshKey: 0, // Add a refresh key to force component re-render
      _loggedImages: {}, // Track already logged images
      _loggedAudios: {}, // Track already logged audios
      preloadedAudios: {}, // Track preloaded audio files
      _processedImagePaths: {}, // Track image paths that already had permissions processed
      _preloadAttempted: false, // Track whether preloading has been attempted for the current examples
      _componentMounted: true // Track whether the component is mounted
    };
  },
  async mounted() {
    console.log("IndexPage mounted");

    // Initialize flags
    this._preloadAttempted = false;
    this._componentMounted = true;
    
    // Check for custom translator file
    await this.checkTranslatorFile();

    // Load examples from translations (available immediately from i18n)
    const currentLang = window.i18n.getLanguage();
    if (window.i18n && window.i18n.translations && window.i18n.translations[currentLang]) {
      this.examples = window.i18n.translations[currentLang].examples || [];
      
      // Load examples with proper properties
      if (this.examples && this.examples.length > 0) {
        this.initializeExamples();
        
        // Fix permissions for example audio files
        await this.fixExampleAudioPermissions();
        
        // Preload audio files
        this.preloadAudios();
      }
    } else {
      console.log("Translations not fully loaded yet");
      this.examples = [];
    }

    try {
      this.user = await sdk.getUser();
    } catch (error) {
      console.error("Error getting user:", error);
      this.user = null;
    }

    // Ensure we have all the necessary translation keys
    this.ensureTranslationKeys();

    // Log the contents of translations.json on startup
    try {
      if (sdk && typeof sdk.fs?.read === "function") {
        console.log("Current working directory:", await sdk.fs.cwd());
        const translatorPath = "~/AI Storyteller/translations.json";
        try {
          const translationsContent = await sdk.fs.read(
            translatorPath,
          );
          console.log(
            "Translator file content on startup:",
            translationsContent ? "Content loaded successfully" : "No content",
          );
          console.log(
            "First 500 characters:",
            translationsContent ? translationsContent.substring(0, 500) : "N/A",
          );
        } catch (readError) {
          // Apenas loga se for um erro diferente de "não existe" ou se for a primeira execução
          if (!window._translatorFileStartupChecked || !readError.message.includes("no such file")) {
            console.log(
              `[${new Date().toLocaleTimeString()}] Translator file doesn't exist yet:`,
              readError.message,
            );
          }
          
          // Marcar que já verificamos o arquivo na inicialização
          window._translatorFileStartupChecked = true;
        }
      } else {
        console.log(
          "SDK.fs.read is not available, cannot read translator file",
        );
      }
    } catch (error) {
      console.error("Error reading translator file on startup:", error);
    }

    // Check if translations are loaded
    if (!window.i18n || !window.i18n.translations) {
      console.log("Translations not loaded yet, will wait for them");
      // Set up a listener for translations loaded event
      if (window.eventBus) {
        window.eventBus.on(
          "translations-loaded",
          this.handleTranslationsLoaded,
        );
      }
    }

    // Check if we're in the preview environment
    this.isPreviewEnvironment = window.location.origin.includes(
      "preview.webdraw.app",
    );

    // Check if we can access the translator.json file
    await this.checkTranslatorAccess();

    // Listen for translations loaded event
    if (window.eventBus) {
      window.eventBus.on(
        "translations-loaded",
        this.handleTranslationsLoaded,
      );
      window.eventBus.on(
        "translations-updated",
        this.handleTranslationsLoaded,
      );
    }

    // Force refresh if translations are already loaded
    if (window.translationsLoaded) {
      this.handleTranslationsLoaded();
    }
  },
  methods: {
    handleLogin() {
      sdk.redirectToLogin({ appReturnUrl: "?goToCreate=true" });
    },

    // Initialize examples with additional properties they need
    initializeExamples() {
      this.examples = this.examples.map((example, index) => {
        return {
          ...example,
          isPlaying: false,
          loading: false,
          progress: "0%",
          // Ensure audio property exists
          audio: example.audio || null,
          // Don't modify images, just ensure they exist
          image: example.image ||
            `/assets/image/ex${index + 1}${index === 1 ? ".png" : ".webp"}`,
          coverImage: example.coverImage || example.image ||
            `/assets/image/ex${index + 1}${index === 1 ? ".png" : ".webp"}`,
        };
      });

      // Reset tracking objects
      this._loggedImages = {};
      this._loggedAudios = {};
    },

    // Ensure all necessary translation keys exist
    ensureTranslationKeys() {
      // Define default translations for new UI elements
      const requiredTranslations = {
        "home.narratedBy": "Narrated by",
        "home.listenStory": "Listen to Story",
        "home.pauseStory": "Pause Story",
        "home.noExamples": "No example stories yet",
        "home.checkBackSoon": "Check back soon for example stories!",
        "home.createFromThis": "Create from this",
        "home.step1Description":
          "Enter your child's name and select themes they love for a personalized story experience.",
        "home.step3Description":
          "Our AI crafts a magical story featuring your child and their interests in moments.",
        "home.step4Description":
          "Enjoy the story together, save it to your collection, and share it with family and friends.",
      };

      // Portuguese translations for the new keys
      const ptTranslations = {
        "home.step1Description":
          "Digite o nome do seu filho e selecione temas que ele ama para uma experiência de história personalizada.",
        "home.step3Description":
          "Nossa IA cria uma história mágica com seu filho e seus interesses em poucos momentos.",
        "home.step4Description":
          "Aproveite a história juntos, salve-a em sua coleção e compartilhe com familiares e amigos.",
      };

      // Add translations if they don't exist
      if (window.i18n && window.i18n.translations) {
        const currentLang = window.i18n.getLanguage();

        // For each language
        Object.keys(window.i18n.translations).forEach((lang) => {
          // For each required translation
          Object.entries(requiredTranslations).forEach(
            ([key, defaultValue]) => {
              // Get the key parts (e.g., ['home', 'narratedBy'])
              const keyParts = key.split(".");

              // Navigate to the parent object
              let target = window.i18n.translations[lang];
              for (let i = 0; i < keyParts.length - 1; i++) {
                if (!target[keyParts[i]]) {
                  target[keyParts[i]] = {};
                }
                target = target[keyParts[i]];
              }

              // Set the value if it doesn't exist
              const lastKey = keyParts[keyParts.length - 1];
              if (!target[lastKey]) {
                // Use Portuguese translations for PT language
                if (lang === "pt" && ptTranslations[key]) {
                  target[lastKey] = ptTranslations[key];
                } else {
                  target[lastKey] = defaultValue;
                }
                console.log(
                  `Added missing translation for ${lang}.${key}`,
                );
              }
            },
          );
        });
      }
    },

    logImageLoaded(title, originalSrc) {
      if (!this._loggedImages[originalSrc]) {
        console.log(`Image loaded successfully: "${title}"`);
        this._loggedImages[originalSrc] = true;
      }
    },

    logImageError(title, originalSrc) {
      console.error(`Failed to load image: "${title}"`);
    },

    async checkTranslatorAccess() {
      try {
        // Check if we can read and write to the ~/AI Storyteller/translations.json file
        if (
          sdk && typeof sdk.fs?.read === "function" &&
          typeof sdk.fs?.write === "function"
        ) {
          const translatorPath = "~/AI Storyteller/translations.json";
          let content;

          try {
            // Try to read the file
            content = await sdk.fs.read(translatorPath);
            console.log("Translator file exists and can be read");

            // Try to write the file (write the same content back)
            await sdk.fs.write(translatorPath, content);

            // If we get here, we have read and write access
            this.isAdmin = true;
            console.log(
              "Admin access granted - ~/AI Storyteller/translations.json can be read and written",
            );
          } catch (readError) {
            // File doesn't exist or can't be read
            console.log(
              "Translator file doesn't exist or can't be read:",
              readError.message,
            );
            this.isAdmin = false;
          }
        }
      } catch (error) {
        console.log(
          "Not showing admin menu - ~/AI Storyteller/translations.json cannot be accessed:",
          error,
        );
        this.isAdmin = false;
      }
    },

    // Handle translations loaded event
    handleTranslationsLoaded() {
      this.ensureTranslationKeys();
      try {
        const currentLang = window.i18n.getLanguage();
        
        // Check if we already preloaded for this set of examples
        const needsPreload = !this._preloadAttempted;
        
        // Get examples from either current language or English fallback
        if (
          window.i18n.translations && window.i18n.translations[currentLang] &&
          window.i18n.translations[currentLang].examples
        ) {
          // Update examples from translations
          this.examples = window.i18n.translations[currentLang].examples;
        } else if (
          window.i18n.translations && window.i18n.translations.en &&
          window.i18n.translations.en.examples
        ) {
          // Fallback to English if current language doesn't have examples
          this.examples = window.i18n.translations.en.examples;
          console.log("Using English examples fallback:", this.examples.length);
        } else {
          console.error("No examples found in translations");
          this.examples = [];
        }

        // Initialize examples with required properties
        if (this.examples && this.examples.length > 0) {
          this.initializeExamples();
          
          // Only preload audio if we haven't already attempted for this set
          if (needsPreload) {
            this.preloadAudios();
          }
        }
      } catch (error) {
        console.error(
          "Error updating examples after translations loaded:",
          error,
        );
      }
    },
    getOptimizedImageUrl(url, width, height) {
      if (!url || url.startsWith('data:')) return url;
      
      this.ensureImagePermissions(url);
      
      return `https://webdraw.com/image-optimize?src=${encodeURIComponent(url)}&width=${width}&height=${height}&fit=cover`;
    },
    
    // Separate function to ensure image permissions
    ensureImagePermissions(url) {
      if (this._processedImagePaths[url] || !sdk?.fs?.chmod) {
        return;
      }
      
      this._processedImagePaths[url] = true;
      
      const sensitivePatterns = [
        "/users/", 
        "/Apps/", 
        "/Staging", 
        "/assets/image/", 
        "/assets/audio/"
      ];
      
      if (url.endsWith('/assets/image/bg.webp') || url.includes('/assets/image/bg.webp')) {
        try {
          if (!url.startsWith('http')) {
            sdk.fs.chmod('/assets/image/bg.webp', 0o644).catch(() => {
              const fullPath = `/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/image/bg.webp`;
              sdk.fs.chmod(decodeURIComponent(fullPath), 0o644).catch(() => {});
            });
          }
        } catch (e) {
          console.warn("Could not set permissions for bg.webp:", e);
        }
      }
      
      const needsPermissionCheck = sensitivePatterns.some(pattern => url.includes(pattern));
      if (!needsPermissionCheck || url.startsWith('http')) {
        return;
      }
      
      try {
        if (url.startsWith('http')) {
          return;
        }
        
        let cleanPath = url;
        
        cleanPath = decodeURIComponent(cleanPath);
        
        sdk.fs.chmod(cleanPath, 0o644).catch(err => {
          console.warn(`Permission adjustment failed for ${cleanPath}: ${err.message}`);
        });
        
        if (cleanPath.includes('/assets/image/')) {
          const baseDir = cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);
          const commonFiles = [
            "ex1.webp", "ex2.webp", "ex3.webp", "ex4.webp", 
            "bg.webp", "aunt_1.png", "grandma_1.png", 
            "grandpa_1.png", "uncle_2.png"
          ];
          
          commonFiles.forEach(file => {
            const fullPath = baseDir + file;
            if (!this._processedImagePaths[fullPath]) {
              this._processedImagePaths[fullPath] = true;
              sdk.fs.chmod(fullPath, 0o644).catch(() => {});
            }
          });
        }
      } catch (error) {
        console.warn(`Image permission check failed: ${error.message}`);
      }
    },
    getOptimizedAudioUrl(url) {
      if (!url || url.startsWith("data:")) return url;

      if (url.startsWith("http")) {
        return url;
      }

      if (url.startsWith("/")) {
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          return url;
        }

        return url;
      }

      return "/" + url;
    },
    toggleAudio(example) {
      if (example.loading) {
        console.log(
          `Ignoring click while audio is loading for "${example.title}"`,
        );
        return;
      }

      const audioId = "audio-" + this.examples.indexOf(example);
      const audioElement = document.getElementById(audioId);

      if (!audioElement) {
        console.error("Audio element not found:", audioId);
        return;
      }

      if (example.isPlaying) {
        audioElement.pause();

        if (example.tempAudio) {
          example.tempAudio.pause();
        }

        example.isPlaying = false;
        return;
      }

      this.examples.forEach((ex) => {
        if (ex !== example && ex.isPlaying) {
          const otherAudioId = "audio-" + this.examples.indexOf(ex);
          const otherAudioElement = document.getElementById(
            otherAudioId,
          );
          if (otherAudioElement) {
            otherAudioElement.pause();
            ex.isPlaying = false;
          }
        }
      });

      example.loading = true;

      try {
        const audioUrl = example.audio;

        example.loading = true;

        const globalPreloadedAudio = window._preloadedAudios &&
          window._preloadedAudios[audioUrl];
        const componentPreloadedAudio = this.preloadedAudios[audioUrl];

        let bestAudioSource = null;
        if (
          globalPreloadedAudio && globalPreloadedAudio.loaded &&
          globalPreloadedAudio.element
        ) {
          console.log(
            `Using globally preloaded audio for "${example.title}"`,
          );
          bestAudioSource = globalPreloadedAudio;
        } else if (
          componentPreloadedAudio && componentPreloadedAudio.loaded &&
          componentPreloadedAudio.element
        ) {
          console.log(
            `Using component preloaded audio for "${example.title}"`,
          );
          bestAudioSource = componentPreloadedAudio;
        }

        if (bestAudioSource) {
          bestAudioSource.element.pause();
          audioElement.src = audioUrl;

          audioElement.currentTime = 0;
          audioElement.play()
            .then(() => {
              example.isPlaying = true;
              console.log(
                `Playing audio from preloaded source: "${example.title}"`,
              );
              example.loading = false;
            })
            .catch((error) => {
              console.error(
                `Error playing preloaded audio: "${example.title}"`,
                error,
              );
              this.handleAudioError(
                example,
                audioElement,
                audioUrl,
                error,
              );
            });
        } else {
          console.log(
            `No preloaded audio available for "${example.title}", loading directly`,
          );

          if (
            audioUrl.startsWith("http") &&
            !audioUrl.includes(window.location.hostname)
          ) {
            audioLoader.crossOrigin = "anonymous";
          }

          audioElement.src = audioUrl;

          audioElement.play()
            .then(() => {
              example.isPlaying = true;
              example.loading = false;
              console.log(`Playing audio: "${example.title}"`);
            })
            .catch((error) => {
              console.error(
                `Error playing audio: "${example.title}"`,
                error,
              );
              this.handleAudioError(
                example,
                audioElement,
                audioUrl,
                error,
              );
            });
        }
      } catch (error) {
        console.error(
          `Error attempting to play audio: "${example.title}"`,
          error,
        );
      }
    },

    updateProgress(event, example) {
      const audioElement = event.target;
      if (audioElement && !isNaN(audioElement.duration)) {
        const percentage = (audioElement.currentTime / audioElement.duration) *
          100;
        example.progress = percentage + "%";
      }
    },

    audioEnded(example) {
      example.isPlaying = false;
      example.progress = "0%";
    },
    logAudioLoaded(title, originalSrc) {
      // Don't log anything here - preloadAudios will handle consolidated logging
      if (this._loggedAudios[originalSrc]) {
        return;
      }
      this._loggedAudios[originalSrc] = {
        loaded: true,
        title
      };
    },

    logAudioError(title, originalSrc, error) {
      console.error(`Error loading audio for "${title}" (${originalSrc}):`, error);
      this._loggedAudios[originalSrc] = {
        loaded: false,
        error,
        title
      };
    },
    preloadAudios() {
      // Skip if already attempted for the current set of examples
      if (this._preloadAttempted) {
        console.log("Audio preloading already attempted for current examples - skipping");
        return;
      }

      if (!this.examples || this.examples.length === 0) {
        console.log("No examples to preload audio for");
        this._preloadAttempted = true;
        return;
      }

      // Set flag to avoid duplicate preloading
      this._preloadAttempted = true;
      
      console.log("Starting audio preloading...");
      
      // Initialize _componentMounted if it doesn't exist
      if (this._componentMounted === undefined) {
        this._componentMounted = true;
      }
      
      // Collect all titles to be preloaded at once
      const titlesToPreload = this.examples
        .filter(example => example.audio)
        .map(example => example.title);
      
      if (titlesToPreload.length === 0) {
        console.log("No audio files to preload in the examples");
        return;
      }
      
      console.log("Preloading audio for examples:", titlesToPreload.join(", "));

      const loadPromises = [];

      this.examples.forEach((example, index) => {
        // Stop processing if component is unmounting
        if (!this._componentMounted) return;
        
        if (!example.audio) {
          return;
        }

        try {
          const audioUrl = example.audio;

          if (this.preloadedAudios[audioUrl] && this.preloadedAudios[audioUrl].loaded) {
            // Already preloaded in this component
            return;
          }

          const audioLoader = new Audio();

          const loadPromise = new Promise((resolve, reject) => {
            audioLoader.addEventListener("canplaythrough", () => {
              // Check if component is still mounted
              if (!this._componentMounted) {
                resolve("component_unmounted");
                return;
              }
              
              this.preloadedAudios[audioUrl] = {
                loaded: true,
                element: audioLoader,
              };
              resolve(audioUrl);
            }, { once: true });

            audioLoader.addEventListener("error", (error) => {
              // Check if component is still mounted
              if (!this._componentMounted) {
                resolve("component_unmounted");
                return;
              }
              
              console.error(
                `Error preloading audio for "${example.title}":`,
                error,
              );
              this.preloadedAudios[audioUrl] = {
                loaded: false,
                element: null,
                error: error,
              };
              reject(error);
            }, { once: true });

            setTimeout(() => {
              // Check if component is still mounted
              if (!this._componentMounted) {
                resolve("component_unmounted");
                return;
              }
              
              if (!this.preloadedAudios[audioUrl]?.loaded) {
                console.warn(
                  `Timeout preloading audio for "${example.title}"`,
                );
                this.preloadedAudios[audioUrl] = {
                  loaded: false,
                  element: audioLoader,
                  error: "timeout",
                };
                resolve(audioUrl);
              }
            }, 10000);
          });

          loadPromises.push(loadPromise);

          if (
            audioUrl.startsWith("http") &&
            !audioUrl.includes(window.location.hostname)
          ) {
            audioLoader.crossOrigin = "anonymous";
          }

          audioLoader.src = audioUrl;
          audioLoader.load();
        } catch (error) {
          console.error(
            `Exception while trying to preload audio for "${example.title}":`,
            error,
          );
        }
      });

      Promise.allSettled(loadPromises).then((results) => {
        // Don't process results if component is unmounting or unmounted
        if (!this._componentMounted) return;
        
        // List all successfully preloaded titles in one log
        const loadedTitles = this.examples
          .filter(ex => ex.audio && this.preloadedAudios[ex.audio]?.loaded)
          .map(ex => ex.title);
          
        if (loadedTitles.length > 0) {
          console.log("Successfully preloaded audio for:", loadedTitles.join(", "));
        }
      });
    },
    handleAudioError(example, audioElement, audioUrl, error) {
      example.loading = true; // Keep loading state active while we try alternatives

      // If it's an interruption error, we just show feedback and do nothing else
      if (error && error.name === "AbortError") {
        console.log(
          `Audio playback was interrupted for "${example.title}" - likely due to multiple clicks`,
        );
        example.loading = false;
        return;
      }

      // Try a second alternative using a temporary audio element
      console.log(
        `Trying alternative playback method for "${example.title}"`,
      );

      try {
        const tempAudio = new Audio();
        
        // Add event to monitor loading
        tempAudio.addEventListener("canplaythrough", () => {
          console.log(`Alternative audio method ready for "${example.title}"`);
          
          // Play automatically when ready
          tempAudio.play()
            .then(() => {
              // If we can play it, use this element
              console.log(
                `Playing audio via alternative method: "${example.title}"`,
              );
              example.isPlaying = true;
              example.loading = false;

              // Add event to update progress
              tempAudio.addEventListener("timeupdate", (event) => {
                if (tempAudio && !isNaN(tempAudio.duration)) {
                  const percentage = (tempAudio.currentTime /
                    tempAudio.duration) * 100;
                  example.progress = percentage + "%";
                }
              });

              // Add event for when the audio ends
              tempAudio.addEventListener("ended", () => {
                example.isPlaying = false;
                example.progress = "0%";
                example.tempAudio = null; // Clear the reference
              });

              // Store the reference to be able to pause later
              example.tempAudio = tempAudio;
            })
            .catch((playError) => {
              console.error(
                `Alternative playback failed to play for "${example.title}"`,
                playError
              );
              // Try third alternative with file permissions
              this.tryWithPermissionsFix(example, audioUrl);
            });
        }, { once: true });
        
        // Add error handler
        tempAudio.addEventListener("error", (audioError) => {
          console.error(
            `Alternative audio loading failed for "${example.title}"`,
            audioError
          );
          // Try third alternative with file permissions
          this.tryWithPermissionsFix(example, audioUrl);
        }, { once: true });
        
        // Start loading
        tempAudio.src = audioUrl;
        tempAudio.load();
      } catch (finalError) {
        console.error(
          `Second audio playback attempt failed for "${example.title}"`,
          finalError,
        );
        // Try third alternative with file permissions
        this.tryWithPermissionsFix(example, audioUrl);
      }
    },

    // Additional attempt after fixing permissions
    async tryWithPermissionsFix(example, audioUrl) {
      console.log(`Trying with permissions fix for "${example.title}"`);
      
      try {
        let filePath = audioUrl;
        if (filePath.startsWith("http")) {
          try {
            const url = new URL(audioUrl);
            filePath = url.pathname;
          } catch (e) {
            console.warn("Could not parse URL:", audioUrl);
          }
        }
        
        if (filePath.startsWith('~')) {
          filePath = filePath.substring(1);
        }
        
        while (filePath.startsWith('//')) {
          filePath = filePath.substring(1);
        }
        
        if (sdk && typeof sdk.fs?.chmod === 'function') {
          try {
            console.log(`Fixing permissions for audio file: ${filePath}`);
            await sdk.fs.chmod(filePath, 0o644);
            console.log(`Successfully fixed permissions for: ${filePath}`);
            
            const finalAudio = new Audio();
            
            finalAudio.addEventListener("canplaythrough", () => {
              finalAudio.play()
                .then(() => {
                  console.log(`Playing audio after permissions fix: "${example.title}"`);
                  example.isPlaying = true;
                  example.loading = false;
                  
                  finalAudio.addEventListener("timeupdate", () => {
                    if (finalAudio && !isNaN(finalAudio.duration)) {
                      const percentage = (finalAudio.currentTime / finalAudio.duration) * 100;
                      example.progress = percentage + "%";
                    }
                  });
                  
                  finalAudio.addEventListener("ended", () => {
                    example.isPlaying = false;
                    example.progress = "0%";
                    example.tempAudio = null;
                  });
                  
                  example.tempAudio = finalAudio;
                })
                .catch(finalPlayError => {
                  console.error(`Final playback attempt failed for "${example.title}"`, finalPlayError);
                  example.loading = false;
                  example.isPlaying = false;
                });
            }, { once: true });
            
            finalAudio.addEventListener("error", (finalLoadError) => {
              console.error(`Final audio loading failed for "${example.title}"`, finalLoadError);
              example.loading = false;
              example.isPlaying = false;
            }, { once: true });
            
            finalAudio.src = `${audioUrl}?t=${Date.now()}`;
            finalAudio.load();
          } catch (permError) {
            console.error(`Failed to fix permissions for "${example.title}"`, permError);
            example.loading = false;
            example.isPlaying = false;
          }
        } else {
          console.warn("Permission utilities not available for final attempt");
          example.loading = false;
          example.isPlaying = false;
        }
      } catch (finalError) {
        console.error(`All audio playback attempts failed for "${example.title}"`, finalError);
        example.loading = false;
        example.isPlaying = false;
      }
    },
    trackMyStoriesClick() {
      if (sdk && sdk.posthogEvent) {
        sdk.posthogEvent("my_stories_clicked", {
          user: this.user ? this.user.username : 'anonymous'
        });
      }
    },
    trackCreateStoryClick() {
      if (window.gtag) {
        window.gtag("event", "create_story_click", {
          event_category: "engagement",
          event_label: "home_page",
        });
      }
      
      if (sdk && sdk.posthogEvent) {
        sdk.posthogEvent("create_story_clicked", {
          user: this.user ? this.user.username : 'anonymous'
        });
      }
    },
    createFromExample(example) {
      const exampleData = {
        themes: example.themes || '',
        voice: example.voice || '',
        title: example.title || ''
      };
      
      localStorage.setItem('createFromExample', JSON.stringify(exampleData));
      
      if (this.user) {
        this.$router.push('/create');
      } else {
        this.handleLogin();
      }
      
      if (window.gtag) {
        window.gtag("event", "create_from_example_click", {
          event_category: "engagement",
          event_label: example.title,
        });
      }
      
      if (sdk && sdk.posthogEvent) {
        sdk.posthogEvent("create_from_example_clicked", {
          user: this.user ? this.user.username : 'anonymous',
          exampleTitle: example.title,
          exampleThemes: example.themes
        });
      }
    },
    async fixExampleAudioPermissions() {
      if (!sdk || typeof sdk.fs?.chmod !== "function") {
        console.warn("File permission utilities not available");
        return;
      }
      
      const audioFiles = [
        "/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/audio-uncle-joe.mp3",
        "/users/a4896ea5-db22-462e-a239-22641f27118c/Apps/Staging%20AI%20Storyteller/assets/audio/sample/audio-uncle-jose.mp3",
      ];
      
      // Only log once for all audio files, not for each file
      console.log("Setting permissions for example audio files...");
      
      let successCount = 0;
      let failedFiles = [];
      
      for (const filePath of audioFiles) {
        try {
          await sdk.fs.chmod(filePath, 0o644);
          successCount++;
        } catch (error) {
          failedFiles.push(filePath);
        }
      }
      
      // Log a summary instead of individual messages
      if (successCount > 0) {
        console.log(`Successfully set permissions for ${successCount} audio files`);
      }
      
      if (failedFiles.length > 0) {
        console.warn(`Could not set permissions for ${failedFiles.length} files (likely don't exist)`);
      }
    },
    async checkTranslatorFile() {
      try {
        if (sdk && typeof sdk.fs?.read === "function") {
          const translatorPath = "~/AI Storyteller/translations.json";
          try {
            const translationsContent = await sdk.fs.read(
              translatorPath,
            );
            console.log(
              "Custom translator file exists, updating translations",
            );

            if (translationsContent) {
              const customTranslations = JSON.parse(translationsContent);
              window.i18n.updateTranslations(customTranslations);
            }
          } catch (readError) {
            // Apenas loga se for um erro diferente de "não existe" ou se for a primeira execução
            if (!window._translatorFileChecked || !readError.message.includes("no such file")) {
              console.log(
                `[${new Date().toLocaleTimeString()}] Translator file doesn't exist or can't be read:`,
                readError.message,
              );
            }
            
            // Marcar que já verificamos o arquivo uma vez
            window._translatorFileChecked = true;
          }
        } else {
          console.log(
            "SDK.fs.read is not available, using default translations",
          );
        }
      } catch (error) {
        console.error("Error checking for translator file:", error);
      }
    },
  },
  beforeUnmount() {
    // Signal that component is unmounting to cancel preloading operations
    this._componentMounted = false;
    
    if (window.eventBus && window.eventBus.events) {
      if (window.eventBus.events["translations-loaded"]) {
        const index = window.eventBus.events["translations-loaded"]
          .indexOf(this.handleTranslationsLoaded);
        if (index !== -1) {
          window.eventBus.events["translations-loaded"].splice(
            index,
            1,
          );
        }
      }

      if (window.eventBus.events["translations-updated"]) {
        const index = window.eventBus.events["translations-updated"]
          .indexOf(this.handleTranslationsLoaded);
        if (index !== -1) {
          window.eventBus.events["translations-updated"].splice(
            index,
            1,
          );
        }
      }
    }

    this.examples.forEach((example) => {
      if (example.isPlaying) {
        const audioId = "audio-" + this.examples.indexOf(example);
        const audioElement = document.getElementById(audioId);
        if (audioElement) {
          audioElement.pause();
        }

        if (example.tempAudio) {
          example.tempAudio.pause();
          example.tempAudio = null;
        }

        example.isPlaying = false;
      }

      example.loading = false;
      example.progress = "0%";
    });

    Object.values(this.preloadedAudios).forEach((audio) => {
      if (audio && audio.element) {
        audio.element.pause();
        audio.element.src = "";
        audio.element = null;
      }
    });
    this.preloadedAudios = {};
  },
  computed: {
  },
  created() {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
            .btn-primary {
                background-image: linear-gradient(to right, #2871CC, #4A90E2);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 9999px;
                font-weight: 500;
                transition: all 0.3s ease;
                border: 2px solid #2871CC;
                box-shadow: 0 4px 6px rgba(74, 144, 226, 0.2);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(74, 144, 226, 0.3);
            }
            
            .btn-secondary {
                background-color: white;
                color: #4A90E2;
                padding: 0.75rem 1.5rem;
                border-radius: 9999px;
                font-weight: 500;
                transition: all 0.3s ease;
                border: 2px solid #4A90E2;
                box-shadow: 0 4px 6px rgba(74, 144, 226, 0.1);
            }
            
            .btn-secondary:hover {
                background-color: #EEF6FD;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(74, 144, 226, 0.2);
            }
        `;
    document.head.appendChild(styleEl);
  },
};

// Export for module systems while maintaining window compatibility
export default window.IndexPage;