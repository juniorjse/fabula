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
  data() {
    return {
      screen: "form",
      childName: "",
      interests: "",
      storyData: null,
      storyImage: null,
      audioSource: null,
      isPlaying: false,
      audioProgress: 0,
      audioLoading: false,
      audioCheckInterval: null,
      taskStatus: {
        plot: "waiting",
        story: "waiting",
        image: "waiting",
        audio: "waiting",
      },
      streamingText: "",
      formattedStory: "",
      voices: [],
      selectedVoice: null,
      isPreviewPlaying: null,
      preloadedAudios: {},
      BASE_FS_URL: "https://fs.webdraw.com",
      currentLanguage: window.i18n.getLanguage(),
      interestSuggestions: [],
      showWarningModal: false,
      warningModalData: {
        title: "",
        message: "",
        type: "warning"
      },
      // Cache para URLs de avatar otimizados
      optimizedAvatars: {},
      _loadedAudioPreviews: [],
      _previewLogTimeout: null
    };
  },
  watch: {
    currentLanguage(newLang, oldLang) {
      // Update the voices array when language changes
      this.updateVoicesForLanguage();
      this.$forceUpdate();
    }
  },
  mounted() {
    // Debug initial translations
    this.debugTranslations();

    // Initialize voices based on current language
    // Check if translations are loaded first
    if (window.i18n && window.i18n.translations) {
      this.updateVoicesForLanguage();
      this.updateInterestSuggestions();

      // Check if we have example data in localStorage
      const exampleDataString = localStorage.getItem('createFromExample');
      if (exampleDataString) {
        try {
          const exampleData = JSON.parse(exampleDataString);

          // Pre-fill form with example data
          if (exampleData.childName) this.childName = exampleData.childName;
          if (exampleData.themes) this.interests = exampleData.themes;

          // Select the voice if it exists in our voices array
          if (exampleData.voice && this.voices.length > 0) {
            const matchingVoice = this.voices.find(v => v.name === exampleData.voice);
            if (matchingVoice) {
              this.selectedVoice = matchingVoice;
            }
          }

          // Clear the localStorage item after using it
          localStorage.removeItem('createFromExample');
        } catch (error) {
          console.error('Error parsing example data from localStorage:', error);
          localStorage.removeItem('createFromExample');
        }
      }

      // Check for URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const themes = urlParams.get('themes');
      const voiceId = urlParams.get('voiceId');

      // Pre-fill the themes if provided
      if (themes) {
        this.interests = themes;
      }

      // Pre-select the voice if provided
      if (voiceId && this.voices.length > 0) {
        const matchingVoice = this.voices.find(voice => voice.id === voiceId);
        if (matchingVoice) {
          this.selectedVoice = matchingVoice;
        }
      }
    } else {
      // If translations aren't loaded yet, listen for the event
      const onTranslationsLoaded = () => {
        this.updateVoicesForLanguage();
        this.updateInterestSuggestions();

        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const themes = urlParams.get('themes');
        const voiceId = urlParams.get('voiceId');

        // Pre-fill the themes if provided
        if (themes) {
          this.interests = themes;
        }

        // Pre-select the voice if provided
        if (voiceId && this.voices.length > 0) {
          const matchingVoice = this.voices.find(voice => voice.id === voiceId);
          if (matchingVoice) {
            this.selectedVoice = matchingVoice;
          }
        }

        // Remove the listener after handling it once
        document.removeEventListener('translations-loaded', onTranslationsLoaded);
      };

      document.addEventListener('translations-loaded', onTranslationsLoaded);
    }

    // Listen for audio errors
    document.addEventListener('audioerror', this.handleAudioError);

    this.previewAudioElement = new Audio();
    this.previewAudioElement.addEventListener('ended', () => {
      this.isPreviewPlaying = null;
      console.log('Preview audio playback completed');
    });

    this.$nextTick(() => {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', this.updateAudioProgress);
        audioPlayer.addEventListener('ended', () => {
          this.isPlaying = false;
          this.audioProgress = 0;
        });
      }

      // Preload voice preview audios
      this.preloadVoiceAudios();
    });

    // Listen for language change events
    if (window.eventBus) {
      window.eventBus.on('language-changed', this.handleLanguageChange);
    }
  },
  beforeUnmount() {
    const audioPlayer = this.$refs.audioPlayer;
    if (audioPlayer) {
      audioPlayer.removeEventListener('timeupdate', this.updateAudioProgress);
      audioPlayer.removeEventListener('ended', () => {});
    }
    if (window.eventBus) {
      window.eventBus.events['language-changed'] = window.eventBus.events['language-changed']?.filter(
        callback => callback !== this.handleLanguageChange
      );
      if (window.eventBus.events['translations-loaded']) {
        window.eventBus.events['translations-loaded'] = window.eventBus.events['translations-loaded'].filter(
          callback => typeof callback === 'function' && callback.toString().includes('updateVoicesForLanguage')
        );
      }
    }
    if (this.audioCheckInterval) {
      clearInterval(this.audioCheckInterval);
      this.audioCheckInterval = null;
    }
    if (this._previewLogTimeout) {
      clearTimeout(this._previewLogTimeout);
      this._previewLogTimeout = null;
    }
  },
  methods: {
    // Get translations for the current language
    updateVoicesForLanguage() {
      const lang = this.currentLanguage;
      if (!window.i18n || !window.i18n.translations) {
        console.warn('Translations not loaded yet, will retry later');
        setTimeout(() => this.updateVoicesForLanguage(), 500);
        return;
      }
      if (lang && window.i18n.translations[lang] && window.i18n.translations[lang].voices) {
        this.voices = JSON.parse(JSON.stringify(window.i18n.translations[lang].voices));
        this.voices.forEach(voice => {
          if (voice.avatar && typeof voice.avatar === 'string') {
            this.ensureImagePermissions(voice.avatar);
            this.getOptimizedAvatarUrl(voice.avatar);
          }
        });
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`Loaded ${this.voices.length} voices for ${lang}`);
        }
        if (this.selectedVoice) {
          const previousIndex = this.voices.findIndex(v => v.id === this.selectedVoice.id);
          if (previousIndex !== -1) {
            this.selectedVoice = this.voices[previousIndex];
          } else {
            this.selectedVoice = null;
          }
        }
      } else {
        console.warn(`No voices found for language: ${lang}`);
        if (window.i18n.translations.en && window.i18n.translations.en.voices) {
          this.voices = JSON.parse(JSON.stringify(window.i18n.translations.en.voices || []));
          this.voices.forEach(voice => {
            if (voice.avatar && typeof voice.avatar === 'string') {
              this.ensureImagePermissions(voice.avatar);
              this.getOptimizedAvatarUrl(voice.avatar);
            }
          });
        } else {
          console.error('No fallback voices available');
          this.voices = [];
        }
      }
    },

    handleLanguageChange(lang) {
      this.currentLanguage = lang;
      this.updateVoicesForLanguage();
      this.updateInterestSuggestions();
    },

    // Debug translations
    debugTranslations() {
      console.log('Current language:', this.currentLanguage);
      console.log('i18n language:', window.i18n.getLanguage());
      console.log('Translation for create.title:', window.i18n.t('create.title'));
      console.log('Translation for create.nameLabel:', window.i18n.t('create.nameLabel'));
      console.log('Available translations:', window.i18n.translations);
    },

    selectVoice(voice) {
      this.selectedVoice = voice;
    },
    addInterest(suggestion) {
      const interestText = suggestion;
      // Get the conjunction based on the current language
      const conjunction = this.currentLanguage === 'pt' ? ' e ' : ' and ';

      // Also update the regex to split by both "and" and "e"
      let currentInterests = this.interests
        .split(/,\s*|\s+and\s+|\s+e\s+/gi)
        .map(i => i.trim())
        .filter(i => i);
      const index = currentInterests.indexOf(interestText);
      if (index > -1) {
        currentInterests.splice(index, 1);
      } else if (currentInterests.length < 6) {
        currentInterests.push(interestText);
      }
      if (currentInterests.length === 0) {
        this.interests = "";
      } else if (currentInterests.length === 1) {
        this.interests = currentInterests[0];
      } else if (currentInterests.length === 2) {
        this.interests = currentInterests.join(conjunction);
      } else {
        const allButLast = currentInterests.slice(0, -1).join(", ");
        const last = currentInterests[currentInterests.length - 1];
        this.interests = `${allButLast}${conjunction}${last}`;
      }
    },
    randomTheme() {
      if (!this.interestSuggestions || this.interestSuggestions.length === 0) {
        console.warn("No interest suggestions available");
        return;
      }
      const randomPick = this.interestSuggestions[Math.floor(Math.random() * this.interestSuggestions.length)];
      this.addInterest(randomPick.text);
    },
    playVoicePreview(voice) {
      // Remove the automatic voice selection when playing preview
      // this.selectVoice(voice);

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
        }
        this.isPreviewPlaying = null;
      }

      if (voice.previewAudio) {
        voice.isLoading = true;

        // Ensure source is set
        if (!audioElement.querySelector('source').src) {
          const source = audioElement.querySelector('source');
          source.src = this.getPreviewAudioUrl(voice);
          audioElement.load();
        }

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
            alert(`Could not play audio preview for ${voice.name}. The audio file may be missing.`);
          });
      }
    },
    async generateStory() {
      if (!this.childName || !this.interests || !this.selectedVoice) {
        this.warningModalData = {
          title: this.$t('create.warningTitle'),
          message: this.$t('create.fillAllFields'),
          type: 'warning'
        };
        this.showWarningModal = true;
        return;
      }

      this.screen = "loading";

      this.storyData = null;
      this.storyImage = null;
      this.audioSource = null;
      this.streamingText = "";
      this.taskStatus = {
        plot: "loading",
        story: "waiting",
        image: "waiting",
        audio: "waiting",
      };

      try {
        console.log("Starting plot generation...");
        const { object } = await sdk.ai.generateObject({
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              plot: { type: "string" }
            },
            required: ["title", "plot"]
          },
          messages: [
            {
              role: "user",
              content: this.$tf('prompts.generatePlot', {
                childName: this.childName,
                interests: this.interests
              })
            }
          ]
        });

        console.log("Plot generation complete:", object);
        this.taskStatus.plot = "done";
        this.storyData = {
          title: object.title,
          plot: object.plot,
          story: ""
        };

        this.taskStatus.image = "loading";
        console.log("Starting image generation...");
        const imagePrompt = this.$tf('prompts.generateImage', {
          title: object.title,
          plot: object.plot
        });
        
        // Check if we're in Portuguese and need to extract English prompt
        let finalImagePrompt = imagePrompt;
        if (this.currentLanguage === 'pt') {
          // Extract the English part after "IMPORTANT: THIS PROMPT MUST BE PROCESSED IN ENGLISH"
          const englishMatch = imagePrompt.match(/IMPORTANT: THIS PROMPT MUST BE PROCESSED IN ENGLISH.*?\n\n(.*)/s);
          if (englishMatch && englishMatch[1]) {
            finalImagePrompt = englishMatch[1];
            console.log("Extracted English prompt for image generation:", finalImagePrompt);
          }
        }
        
        console.log("Using image prompt:", finalImagePrompt);

        let imagePromise;
        try {
          imagePromise = sdk.ai.generateImage({
            model: "stability:ultra",
            prompt: finalImagePrompt,
            aspect_ratio: "1:1",
            providerOptions: {
              stability: {
                negative_prompt: "ugly, deformed, disfigured, poor quality, low resolution, bad anatomy",
                style_preset: "fantasy-art", // Using fantasy-art style which is perfect for children's stories
                output_format: "webp",
                aspect_ratio: "1:1",
                seed: Math.floor(Math.random() * 4294967294)
              }
            }
          });
          console.log("Image generation request sent successfully");
        } catch (error) {
          console.error("Error starting image generation:", error);
          console.error("Error details:", error.message, error.stack);
          imagePromise = Promise.resolve({ error: "Failed to initialize image generation" });
        }

        this.taskStatus.story = "loading";
        console.log("Starting story generation...");
        
        const storyPrompt = this.$tf('prompts.generateStory', {
          childName: this.childName,
          interests: this.interests,
          title: object.title,
          plot: object.plot
        }) + "\n\nIMPORTANT: DO NOT include the title at the beginning of the story, as it will be read separately in the narration. Start directly with the story content.";
        
        console.log("Using story prompt with length instructions:", storyPrompt.includes("2500-3500 CHARACTERS"));
        
        try {
          console.log("Attempting to generate story with streaming...");
          const storyStream = await sdk.ai.streamText({
            messages: [
              {
                role: "user",
                content: storyPrompt
              }
            ]
          });
          
          this.storyData.story = "";
          this.streamingText = "";
          let chunkCount = 0;
          let fullStoryText = "";
          
          for await (const chunk of storyStream) {
            chunkCount++;
            if (chunkCount === 1) {
              console.log("Received first chunk of story stream");
            }
            fullStoryText += chunk.text;
            this.streamingText += chunk.text;
          }
          this.storyData.story = fullStoryText;
          console.log(`Story stream completed with ${chunkCount} chunks`);
        } catch (streamError) {
          console.error("Error during story streaming:", streamError);
          this.storyData.story = "";
        }
        
        if (!this.storyData.story || this.storyData.story.trim() === '') {
          try {
            const textResponse = await sdk.ai.generateText({
              messages: [{ role: "user", content: storyPrompt }]
            });
            this.storyData.story = textResponse.text || "";
          } catch (textError) {
            this.storyData.story = this.storyData.plot;
          }
        }
        
        if (!this.storyData.story || this.storyData.story.trim() === '') {
          this.storyData.story = this.storyData.plot;
        } else if (this.storyData.story.length < 2500) {
          try {
            const retryResponse = await sdk.ai.generateText({
              messages: [{
                role: "user",
                content: storyPrompt + `\n\nIMPORTANT: Please create a LONGER story with AT LEAST 2500 CHARACTERS.`
              }]
            });
            
            if (retryResponse.text && retryResponse.text.length > this.storyData.story.length) {
              this.storyData.story = retryResponse.text;
            }
          } catch (error) {}
        } else if (this.storyData.story.length > 3500) {
          this.storyData.story = this.truncateStoryIntelligently(this.storyData.story, 3500);
        }
        
        this.storyData.originalStory = this.storyData.story;
        console.log("Story generated:", this.storyData.story);
        this.storyData.story = this.formatStoryText(this.storyData.story);
        this.taskStatus.story = "done";
        
        try {
          const imageResult = await imagePromise;
          if (imageResult.error) {
            console.error("Error in image result:", imageResult.error);
            throw new Error(imageResult.error);
          }
          // For stability:ultra model, the response structure is different from Replicate
          if (imageResult.images && imageResult.images.length > 0) {
            let imageBase64 = null;
            if (typeof imageResult.images[0] === 'string') {
              imageBase64 = `data:image/webp;base64,${imageResult.images[0]}`;
              this.storyImage = `https://fs.webdraw.com${imageResult.filepath.startsWith('/') ? '' : '/'}${imageResult.filepath}`;
            } else {
              this.storyImage = imageResult.images[0];
              console.log("Using direct URL for image:", this.storyImage);
            }
            
            if (this.storyData) {
              this.storyData.imageBase64 = imageBase64;
            }
          } else if (imageResult.url) {
            // Fallback to url if available
            this.storyImage = imageResult.url;
            console.log("Using URL for image:", this.storyImage);
          } else if (imageResult.filepath) {
            this.storyImage = `https://fs.webdraw.com${imageResult.filepath.startsWith('/') ? '' : '/'}${imageResult.filepath}`;
            console.log("Using filepath for image:", this.storyImage);
          } else {
            console.warn("Unexpected image result format:", imageResult);
            console.warn("Image result keys:", Object.keys(imageResult));
            this.storyImage = null;
          }

          console.log("Final image URL:", this.storyImage);

        } catch (imageError) {
          console.error("Error generating story image:", imageError);
          console.error("Full error details:", imageError.message, imageError.stack);
          
          // Use fallback image with more detailed logging
          console.log("Using fallback image due to error");
          const fallbackImage = this.getRandomFallbackImage();
          console.log("Selected fallback image:", fallbackImage);
          this.storyImage = fallbackImage;
          
          // Adiciona uma mensagem para o usuário informando sobre o problema
          this.$nextTick(() => {
            if (this.$refs.imageErrorMessage) {
              this.$refs.imageErrorMessage.textContent = this.$t('errors.imageGenerationFailed');
              this.$refs.imageErrorMessage.style.display = 'block';
            }
          });
        }

        this.taskStatus.image = "done";

        this.taskStatus.audio = "loading";
        console.log("Starting audio generation...");
        
        // Prepare the audio text - start with the title
        let audioText = this.storyData.title;
        
        // Check if the story already starts with the title (despite our instructions)
        const storyStartsWithTitle = this.storyData.story.trim().startsWith(this.storyData.title);
        
        // Add the story content, either directly or with a separator
        if (storyStartsWithTitle) {
          console.log("Story already starts with title, using story text as is");
          audioText = this.storyData.story;
        } else {
          audioText = `${this.storyData.title}. ${this.storyData.story}`;
        }
        
        console.log(`Audio text length: ${audioText.length} characters`);

        const chosenVoice = this.selectedVoice || this.voices[0];

        const audioResponse = await sdk.ai.generateAudio({
          model: "elevenlabs:tts",
          prompt: audioText,
          providerOptions: {
            elevenLabs: {
              voiceId: chosenVoice.id,
              model_id: "eleven_turbo_v2_5",
              optimize_streaming_latency: 0,
              voice_settings: {
                speed: 1.0,
                similarity_boost: 0.85,
                stability: 0.75,
                style: 0,
              },
            },
          },
        });

        let audioPath = null;

        if (audioResponse.filepath && audioResponse.filepath.length > 0) {
          audioPath = audioResponse.filepath[0];
        } else if (audioResponse.audios && audioResponse.audios.length > 0) {
          audioPath = audioResponse.audios[0];
        } else if (audioResponse.url) {
          audioPath = audioResponse.url;
        } else {
          alert("Audio was generated but the source format is not recognized. The audio playback may not work.");
        }

        let fullAudioUrl = null;
        if (audioPath) {
          if (!audioPath.startsWith('http') && !audioPath.startsWith('data:')) {
            fullAudioUrl = `https://fs.webdraw.com${audioPath.startsWith('/') ? '' : '/'}${audioPath}`;
          } else {
            fullAudioUrl = audioPath;
          }
          console.log("Final audio source with domain:", fullAudioUrl);

          // Set permissions for the audio file immediately
          try {
            await this.setFilePermissions(audioPath);
            console.log("Set permissions for audio file:", audioPath);
          } catch (permError) {
            console.warn("Error setting permissions for audio file:", permError);
          }

          // Set audio source immediately but mark as loading
          this.audioSource = fullAudioUrl;
          this.audioLoading = true;

          await new Promise(resolve => setTimeout(resolve, 4000));

          const isAudioReady = await this.checkAudioReady(fullAudioUrl, 2, 3000);

          if (isAudioReady) {
            console.log("Audio file is confirmed ready");
            this.audioLoading = false;
          } else {
            console.log("Audio file not immediately available, will continue checking in background");
            // Start background checking
            this.startBackgroundAudioCheck(fullAudioUrl);
          }
        }

        if (fullAudioUrl) {
          let audioReady = false;
          let attempts = 0;
          const maxAttempts = 30;
          let lastStatus = null;

          while (!audioReady && attempts < maxAttempts) {
            attempts++;
            // If previous attempt returned 403, only make actual request periodically
            const shouldSkipRequest = lastStatus === 403 && 
                                      attempts > 1 && 
                                      attempts % 5 !== 0 && 
                                      attempts !== maxAttempts;

            if (shouldSkipRequest) {
              // Just wait without making a request
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }

            try {
              const response = await fetch(fullAudioUrl, { 
                method: 'GET',
                headers: {
                  'Range': 'bytes=0-1'
                }
              });

              lastStatus = response.status;

              if (response.ok || response.status === 206) {
                console.log(`Audio file is accessible! Status: ${response.status}`);
                audioReady = true;
                this.taskStatus.audio = "done";
              } else {
                // Only log on first attempt or every 5th attempt
                if (attempts === 1 || attempts % 5 === 0 || attempts === maxAttempts) {
                  console.log(`Audio file not accessible yet (status: ${response.status}), waiting...`);
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
              }
            } catch (error) {
              // Only log on first attempt or every 5th attempt
              if (attempts === 1 || attempts % 5 === 0 || attempts === maxAttempts) {
                console.warn(`Error checking audio file: ${error.message}`);
              }
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

          if (!audioReady) {
            console.warn("Could not confirm audio file is ready after maximum attempts. Proceeding anyway.");
            this.taskStatus.audio = "error";
          } else {
            console.log("Audio file confirmed accessible! Proceeding to result screen.");
            this.audioLoading = false;
          }

          // Only switch to the result screen and save the story after confirming that the audio is ready
          this.screen = "result";

          // Save story only after audio is available
          await this.saveStory();
        } else {
          console.warn("No audio URL available, proceeding to result screen anyway");
          this.taskStatus.audio = "error";
          this.screen = "result";
          await this.saveStory();
        }

      } catch (error) {
        console.error("Error generating story:", error);
        alert("There was an error generating your story. Please try again.");
        this.screen = "form";
      }
    },
    startBackgroundAudioCheck(url) {
      // Clear any existing interval
      if (this.audioCheckInterval) {
        clearInterval(this.audioCheckInterval);
      }

      let attempts = 0;
      const maxAttempts = 30; // Check for up to 5 minutes (30 * 10 seconds)

      this.audioCheckInterval = setInterval(async () => {
        attempts++;
        console.log(`Background audio check attempt ${attempts}/${maxAttempts}`);

        try {
          // Use a GET request with range headers instead of HEAD
          const response = await fetch(url, { 
            method: 'GET',
            headers: {
              'Range': 'bytes=0-1' // Just request the first 2 bytes
            }
          });

          if (response.ok || response.status === 206) { // 206 is Partial Content
            console.log(`Audio file response status: ${response.status}`);

            // If we got a response, the file likely exists and is accessible
            console.log('Audio file is now ready!');

            // Extract the path from the URL and set permissions
            try {
              const audioPath = url.includes(this.BASE_FS_URL) 
                ? url.replace(this.BASE_FS_URL, '') 
                : url;

              await this.setFilePermissions(audioPath);
              console.log("Set permissions for audio file in background check:", audioPath);
            } catch (permError) {
              console.warn("Error setting permissions for audio file in background check:", permError);
            }

            this.audioLoading = false;
            clearInterval(this.audioCheckInterval);
            this.audioCheckInterval = null;

            // Force audio element to reload the source
            this.$nextTick(() => {
              const audioPlayer = this.$refs.audioPlayer;
              if (audioPlayer) {
                audioPlayer.load();
              }
            });
          } else {
            console.log(`Audio file not ready yet (status: ${response.status}), will continue checking...`);
          }
        } catch (error) {
          console.warn(`Error in background audio check: ${error.message}`);
        }

        // Stop checking after max attempts
        if (attempts >= maxAttempts) {
          console.warn('Max background check attempts reached');
          this.audioLoading = false;
          clearInterval(this.audioCheckInterval);
          this.audioCheckInterval = null;
        }
      }, 10000); // Check every 10 seconds
    },
    toggleAudio() {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !this.audioLoading) {
        if (this.isPlaying) {
          audioPlayer.pause();
          this.isPlaying = false;
          console.log("Audio playback paused");
        } else {
          if (audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            console.log(`Playing audio: ${this.audioSource}`);
            console.log(`Audio duration: ${audioPlayer.duration.toFixed(2)} seconds`);

            fetch(this.audioSource, { method: 'HEAD' })
              .then(response => {
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                  const fileSizeInMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);
                  console.log(`Audio file size: ${fileSizeInMB} MB`);
                } else {
                  console.log("Could not determine audio file size");
                }
              })
              .catch(error => {
                console.warn("Error fetching audio file size:", error);
              });

            audioPlayer.play()
              .then(() => {
                this.isPlaying = true;
                console.log("Audio playback started successfully");
              })
              .catch(error => {
                console.error("Error playing audio:", error);
                this.reloadAndPlayAudio();
              });
          } else {
            console.log("Audio not fully loaded yet, reloading...");
            this.reloadAndPlayAudio();
          }
        }
      }
    },

    reloadAndPlayAudio() {
      this.audioLoading = true;
      console.log("Reloading audio from source:", this.audioSource);

      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer) {
        const currentSource = audioPlayer.querySelector('source');
        if (currentSource) {
          currentSource.remove();
        }

        const newSource = document.createElement('source');
        newSource.src = this.audioSource;
        newSource.type = "audio/mpeg";
        audioPlayer.appendChild(newSource);

        audioPlayer.load();

        // Add an event listener to play when ready
        const canPlayHandler = () => {
          console.log("Audio reloaded and ready to play");
          console.log(`Audio duration after reload: ${audioPlayer.duration.toFixed(2)} seconds`);

          this.audioLoading = false;
          audioPlayer.play()
            .then(() => {
              this.isPlaying = true;
              console.log("Audio playback started after reload");
            })
            .catch(playError => {
              console.error("Error playing audio after reload:", playError);
              this.isPlaying = false;
              this.audioLoading = false;
            });

          audioPlayer.removeEventListener('canplaythrough', canPlayHandler);
        };

        audioPlayer.addEventListener('canplaythrough', canPlayHandler);

        // Add a timeout to avoid getting stuck loading
        setTimeout(() => {
          if (this.audioLoading) {
            console.warn("Audio loading timeout reached, attempting to play anyway");
            this.audioLoading = false;
            audioPlayer.removeEventListener('canplaythrough', canPlayHandler);
            audioPlayer.play()
              .then(() => {
                this.isPlaying = true;
                console.log("Audio playback started after timeout");
              })
              .catch(playError => {
                console.error("Error playing audio after timeout:", playError);
                this.isPlaying = false;
              });
          }
        }, 5000); // 5 segundos de timeout
      }
    },
    updateAudioProgress() {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !isNaN(audioPlayer.duration)) {
        this.audioProgress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      }
    },
    seekAudio(e) {
      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer && !isNaN(audioPlayer.duration)) {
        const seekPosition = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekPosition;
        this.audioProgress = e.target.value;
      }
    },
    downloadAudio() {
      if (this.audioSource && !this.audioLoading) {
        // Create a Blob URL from the audio source if it's not already a Blob URL
        fetch(this.audioSource)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error fetching audio: ${response.status} ${response.statusText}`);
            }
            return response.blob();
          })
          .then(blob => {
            // Create a download link and trigger it
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.storyData.title.replace(/\s+/g, '_')}.mp3`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);

            console.log("Downloading audio from:", this.audioSource);
          })
          .catch(error => {
            console.error("Error downloading audio:", error);
            alert(this.$t('ui.errorDownloadingAudio') || "Error downloading audio");
          });
      }
    },
    goBack() {
      this.screen = "form";
    },
    async checkAudioReady(url, maxAttempts = 10, delayMs = 2000) {
      if (!url) return false;
      let lastStatus = null;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // to reduce console errors while still checking periodically
          const shouldSkipActualRequest = lastStatus === 403 && 
                                          attempt > 0 && 
                                          attempt !== 2 && 
                                          attempt !== maxAttempts - 1;

          if (shouldSkipActualRequest) {
            // Skip actual network request but still wait
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }

          // Use a GET request with range headers instead of HEAD
          // This requests just the first few bytes of the file
          const response = await fetch(url, { 
            method: 'GET',
            headers: {
              'Range': 'bytes=0-1' // Just request the first 2 bytes
            }
          });

          lastStatus = response.status;

          // Only log on first attempt to reduce console spam
          if (attempt === 0 || attempt === maxAttempts - 1) {
            console.log(`Audio file not ready yet (status: ${response.status}), waiting ${delayMs}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (error) {
          // Only log on first attempt to reduce console spam
          if (attempt === 0 || attempt === maxAttempts - 1) {
            console.warn(`Error checking audio file: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      console.warn('Max attempts reached, audio file may not be fully available');
      return false;
    },
    formatStoryText(text) {
      if (!text) return '';

      // Remove the title if it appears at the beginning of the story
      // This way the title only appears in the blue header above
      if (this.storyData && this.storyData.title) {
        const title = this.storyData.title.trim();

        // Check for common title patterns at the beginning of the text
        // 1. Exact title match at beginning
        text = text.replace(new RegExp(`^\\s*${title}\\s*[\n\r]+`), '');

        // 2. Title with markdown heading format (# Title)
        text = text.replace(new RegExp(`^\\s*#\\s*${title}\\s*[\n\r]+`), '');

        // 3. Title with double line or other formatting
        text = text.replace(new RegExp(`^\\s*${title}\\s*[\n\r]+[-=]+[\n\r]+`), '');
      }

      text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
      text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
      text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');

      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

      text = text.replace(/\n\n/g, '\n\n');

      return text;
    },
    safeFolderName(name) {
      if (!name) return 'untitled';
      return name.replace(/[^a-zA-Z0-9_\-\s]/g, '_').substring(0, 100);
    },

    getRandomFallbackImage() {
      // Lista de imagens de fallback disponíveis - incluindo caminhos absolutos e relativos
      const fallbackImages = [
        '/assets/image/bg.png',
        '/assets/image/ex1.webp',
        '/assets/image/ex2.png',
        '/assets/image/ex3.webp',
        '/assets/image/ex4.webp',
        'https://staging-ai-storyteller.webdraw.app/assets/image/bg.png',
        'https://staging-ai-storyteller.webdraw.app/assets/image/ex1.webp',
        'https://staging-ai-storyteller.webdraw.app/assets/image/ex2.png',
        'https://staging-ai-storyteller.webdraw.app/assets/image/ex3.webp',
        'https://staging-ai-storyteller.webdraw.app/assets/image/ex4.webp'
      ];

      // Lista de URLs de imagens de fallback externas conhecidas por funcionar
      const externalFallbackImages = [
        'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615486780246-76d3a0193145?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560159007-a4f7703adbeb?q=80&w=1000&auto=format&fit=crop'
      ];

      // Adiciona algumas imagens externas à lista principal
      fallbackImages.push(...externalFallbackImages);

      // Seleciona uma imagem aleatória
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      const selectedImage = fallbackImages[randomIndex];
      
      console.log("Selected fallback image:", selectedImage);
      
      // Verifica se selecionamos um caminho relativo e se estamos em localhost
      if (selectedImage.startsWith('/') && 
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        // Se for localhost, talvez o caminho relativo não funcione corretamente
        // Vamos tentar um caminho absoluto do staging
        const fallbackIndex = Math.floor(Math.random() * externalFallbackImages.length);
        console.log("Running on localhost, using external fallback image instead");
        return externalFallbackImages[fallbackIndex];
      }
      
      return selectedImage;
    },

    generateExcerpt(story) {
      if (!story) return '';
      const plainText = story.replace(/<[^>]*>/g, '');
      return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    },

    async saveStory() {
      if (!this.storyData || !this.storyData.title) {
        console.error("Cannot save story: No story data available");
        return;
      }

      try {
        console.log("SDK available?", !!sdk);
        console.log("SDK.fs available?", !!(sdk && sdk.fs));
        console.log("SDK.fs.write available?", !!(sdk && sdk.fs && typeof sdk.fs.write === 'function'));

        const timestamp = new Date().toISOString();
        const safeName = this.safeFolderName(this.storyData.title);
        const excerpt = this.generateExcerpt(this.storyData.story);

        console.log("Debug - Story image URL before processing:", this.storyImage);

        let imageFilepath = this.storyImage;
        let imageBase64 = this.storyData.imageBase64 || null;
        
        if (this.storyImage && this.storyImage.includes('replicate.delivery')) {
          console.log("Using Replicate image URL directly in story data:", this.storyImage);
        } else if (this.storyImage) {
          if (this.storyImage.includes(this.BASE_FS_URL)) {
            imageFilepath = this.storyImage.replace(this.BASE_FS_URL, '');
            await safeFileOperation(imageFilepath, async () => {
              await this.setFilePermissions(imageFilepath, true);
            });
          } else if (!this.storyImage.startsWith('http')) {
            imageFilepath = this.storyImage;
            console.log("Using image filepath:", imageFilepath);
            // Set permissions for local files using safeFileOperation
            await safeFileOperation(imageFilepath, async () => {
              // Usar skipExistsCheck=true porque o arquivo pode ainda não estar sincronizado
              await this.setFilePermissions(imageFilepath, true);
            });
          }
        } else {
          console.warn("No story image URL available");
        }

        let audioFilepath = null;
        if (this.audioSource) {
          if (this.audioSource.includes(this.BASE_FS_URL)) {
            audioFilepath = this.audioSource.replace(this.BASE_FS_URL, '');
          } else {
            audioFilepath = this.audioSource;
            console.log("Using full audio URL as filepath:", audioFilepath);
          }

          // Set permissions for audio file using safeFileOperation
          await safeFileOperation(audioFilepath, async () => {
            // Usar skipExistsCheck=true porque o arquivo pode ainda não estar sincronizado
            await this.setFilePermissions(audioFilepath, true);
          });
        } else {
          console.warn("No audio source URL available");
        }

        const newGeneration = {
          title: this.storyData.title,
          coverUrl: this.storyImage || null,
          imageBase64: imageBase64, // Adiciona o base64 aos dados
          excerpt: excerpt,
          story: this.storyData.story,
          audioUrl: this.audioSource || null,
          createdAt: timestamp,
          voice: this.selectedVoice,
          childName: this.childName,
          themes: this.interests
        };

        console.log("Story object to save:", JSON.stringify(newGeneration, null, 2));

        let baseFilename = `~/AI Storyteller/${safeName}`;
        let filename = `${baseFilename}.json`;
        let counter = 1;

        try {
          await sdk.fs.write(filename, JSON.stringify(newGeneration, null, 2));
          try {
            const content = await sdk.fs.read(filename);
          } catch (verifyError) {
            console.error("DEBUG: Verification failed - Could not read the file after writing:", verifyError);
          }

          // Set permissions for story JSON file using safeFileOperation
          await safeFileOperation(filename, async () => {
            await this.setFilePermissions(filename);
          });

          console.log("Story saved successfully!");

          // Redirect to the story page
          this.$router.push({
            path: "/story",
            query: { 
              file: filename,
              fromCreate: 'true'
            }
          });

          return true;
        } catch (writeError) {
          console.error("DEBUG: Error during write operation:", writeError);
          console.error("DEBUG: Error details:", writeError.message, writeError.stack);
          throw writeError;
        }

      } catch (error) {
        console.error("Error saving story:", error);
        console.error("DEBUG: Error details:", error.message, error.stack);
        alert("There was an error saving your story. Please try again.");
        return false;
      }
    },

    // Replace the setFilePermissions method
    async setFilePermissions(filepath, skipExistsCheck = false) {
      if (!filepath) {
        console.warn("setFilePermissions: No filepath provided");
        return;
      }

      try {
        let cleanPath = filepath;

        // Remove any URL prefix
        if (cleanPath.startsWith('http')) {
          try {
            const url = new URL(cleanPath);
            cleanPath = url.pathname;
            console.log("DEBUG: Removed URL prefix, now:", cleanPath);
          } catch (urlError) {
            console.warn("DEBUG: Error parsing URL:", urlError.message);
            // Continue with the original path
          }
        }

        // Remove the leading ~ if present
        if (cleanPath.startsWith('~')) {
          cleanPath = cleanPath.substring(1);
        }

        // Ensure the path doesn't start with double slashes
        while (cleanPath.startsWith('//')) {
          cleanPath = cleanPath.substring(1);
          console.log("DEBUG: Removed extra slash, now:", cleanPath);
        }

        // Verify path is not empty after cleaning
        if (!cleanPath || cleanPath.trim() === '' || cleanPath === '/') {
          console.warn("DEBUG: Invalid filepath after cleaning:", cleanPath);
          return;
        }

        // If the file doesn't exist and we're not skipping the check, verify existence
        if (!skipExistsCheck) {
          try {
            const exists = await sdk.fs.exists(cleanPath);
            if (!exists) {
              console.warn(`File does not exist, cannot set permissions: ${cleanPath}`);
              return;
            }
            console.log(`File exists, proceeding with permissions: ${cleanPath}`);
          } catch (existsError) {
            console.warn(`Error checking if file exists: ${cleanPath}`, existsError.message);
            // Continue anyway since we might still be able to set permissions
          }
        }

        if (!sdk || !sdk.fs || typeof sdk.fs.chmod !== 'function') {
          console.error("DEBUG: sdk.fs.chmod is not available!");
          return;
        }

        try {
          // Use 0o644 (rw-r--r--) to ensure web server can access the files
          await sdk.fs.chmod(cleanPath, 0o644);
        } catch (chmodError) {
          // Log more detailed error info
          console.warn(`Could not set file permissions with chmod for ${cleanPath}:`, chmodError.message);
          
          if (chmodError.message && chmodError.message.includes('no such file')) {
            if (skipExistsCheck) {
              console.log(`File not ready yet for permission setting: ${cleanPath} (this is expected with skipExistsCheck=true)`);
            } else {
              console.warn(`File not found during chmod despite existence check passing: ${cleanPath}`);
            }
          }

          // Try with fs.write approach - write to the same file to update permissions
          try {
            console.log("DEBUG: Trying alternative permission approach via fs.write");
            // Try to read the content first
            let fileContent = "";
            try {
              // If we can read the file, get its content
              fileContent = await sdk.fs.read(cleanPath);
              console.log(`Successfully read content from ${cleanPath} (length: ${fileContent.length})`);
            } catch (readError) {
              console.warn(`Could not read file content for alternative permission approach: ${cleanPath}`, readError.message);
            }
            
            // If we have content, try to write it back (which should update permissions)
            if (fileContent && fileContent.length > 0) {
              await sdk.fs.write(cleanPath, fileContent);
              console.log(`Alternative permission approach succeeded: wrote content back to ${cleanPath}`);
            }
          } catch (retryError) {
            console.warn("Error in alternative permission approach:", retryError.message);
          }
        }
        
        // Try one more fallback approach - append empty string to file
        try {
          await sdk.fs.append(cleanPath, '');
          console.log(`Appended empty string to file to update timestamp: ${cleanPath}`);
        } catch (appendError) {
          // Ignore append errors
        }
      } catch (error) {
        console.warn(`Overall error in setFilePermissions for ${filepath}:`, error.message);
        console.log("DEBUG: Full error details:", error.message, error.stack);
      }
    },
    handleAudioError(event) {
      console.warn("Audio error occurred:", event);

      // Retry with exponential backoff
      let retryCount = 0;
      const maxRetries = 5;
      const baseDelay = 1000;

      const retryWithBackoff = () => {
        if (retryCount >= maxRetries) {
          console.warn(`Failed to load audio after ${maxRetries} retries`);
          this.audioLoading = false;
          return;
        }

        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`Retrying audio load in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

        setTimeout(() => {
          retryCount++;

          // Tentar definir permissões novamente
          if (this.audioSource) {
            this.setFilePermissions(this.audioSource)
              .then(() => {
                console.log(`Permissions reset, reloading audio (attempt ${retryCount})`);
                const audioElement = this.$refs.audioPlayer;
                if (audioElement) {
                  audioElement.load();
                }
              })
              .catch(error => {
                console.warn(`Error setting permissions on retry ${retryCount}:`, error);
                retryWithBackoff();
              });
          }
        }, delay);
      };

      this.audioLoading = true;
      retryWithBackoff();

      this.startBackgroundAudioCheck(this.audioSource);
    },
    handleAudioReady(event) {
      console.log('Audio canplaythrough event:', event);
      this.audioLoading = false;

      const audioPlayer = this.$refs.audioPlayer;
      if (audioPlayer) {
        console.log(`Audio ready - Source: ${this.audioSource}`);
        console.log(`Audio ready - Duration: ${audioPlayer.duration.toFixed(2)} seconds`);
        console.log(`Audio ready - Ready State: ${audioPlayer.readyState}`);

        // Check if the audio has enough data for playback
        if (audioPlayer.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
          console.log("Audio has enough data for smooth playback");
        } else {
          console.log("Audio may not have enough data for smooth playback yet");
        }
      }
    },
    getOptimizedImageUrl(url, width, height) {
      if (!url) return this.getRandomFallbackImage();
      
      // Se for uma URL de dados (data:), uma URL externa conhecida ou de fallback, retornar como está
      if (url.startsWith('data:') || 
          url.includes('unsplash.com') || 
          url.includes('staging-ai-storyteller')) {
        return url;
      }
      
      // Só tenta garantir permissões se for um caminho local (não começa com http)
      if (!url.startsWith('http')) {
        this.ensureImagePermissions(url);
      }
      
      try {
        // Cria URL otimizada via serviço de imagem
        const optimizedUrl = `https://webdraw.com/image-optimize?src=${encodeURIComponent(url)}&width=${width || 800}&height=${height || 600}&fit=cover`;
        return optimizedUrl;
      } catch (error) {
        return url; // Retorna a URL original em caso de erro
      }
    },
    
    // Método específico para otimizar avatares com cache
    getOptimizedAvatarUrl(avatar) {
      if (!avatar) return '';
      
      // Verificar se já temos esta URL em cache
      const cacheKey = `${avatar}_48x48`;
      if (this.optimizedAvatars[cacheKey]) {
        return this.optimizedAvatars[cacheKey];
      }
      
      // Garantir permissões para o avatar
      this.ensureImagePermissions(avatar);
      
      // Criar URL otimizada
      const optimizedUrl = `https://webdraw.com/image-optimize?src=${encodeURIComponent(avatar)}&width=48&height=48&fit=cover`;
      
      // Armazenar em cache
      this.optimizedAvatars[cacheKey] = optimizedUrl;
      
      return optimizedUrl;
    },
    // Separate function to ensure image permissions
    ensureImagePermissions(url) {
      // Initialize _processedImagePaths if not already done
      if (!this._processedImagePaths) {
        this._processedImagePaths = {};
      }
      
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
    // Get interest suggestions for the current language
    updateInterestSuggestions() {
      const lang = this.currentLanguage;
      
      // Check if window.i18n and translations exist
      if (!window.i18n || !window.i18n.translations) {
        console.warn('Translations not loaded yet, will retry later');
        // Set a timeout to try again in a moment
        setTimeout(() => this.updateInterestSuggestions(), 500);
        return;
      }

      // Check if the current language exists in translations
      if (lang && window.i18n.translations[lang] && window.i18n.translations[lang].interestSuggestions) {
        this.interestSuggestions = window.i18n.translations[lang].interestSuggestions;
        
        // Only log in development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`Loaded ${this.interestSuggestions.length} interest suggestions for ${lang}`);
        }
      } else {
        console.warn(`No interest suggestions found for language: ${lang}`);
        // Check if English translations exist before defaulting to them
        if (window.i18n.translations.en && window.i18n.translations.en.interestSuggestions) {
          this.interestSuggestions = window.i18n.translations.en.interestSuggestions || [];
        } else {
          console.error('No fallback interest suggestions available');
          // Provide default suggestions if nothing is available
          this.interestSuggestions = [
            { text: "Rockets", color: "#22C55E" },
            { text: "Pirates", color: "#A5B4FC" },
            { text: "Space", color: "#F59E0B" },
            { text: "Dinosaurs", color: "#EF4444" },
            { text: "Helping Others", color: "#F59E0B" },
            { text: "Respecting your Elders", color: "#22C55E" }
          ];
        }
      }
    },
    preloadVoiceAudios() {
      if (!this.voices || this.voices.length === 0) {
        console.log("No voices to preload audio for");
        return;
      }

      this.voices.forEach(voice => {
        if (!voice.previewAudio) {
          console.log(`Voice ${voice.name}: No preview audio to preload`);
          return;
        }

        try {
          // Get audio URL for this voice
          const audioUrl = this.getPreviewAudioUrl(voice);

          // Skip if already preloaded
          if (this.preloadedAudios[audioUrl]) {
            console.log(`Audio for "${voice.name}" already preloaded`);
            return;
          }

          // Get the audio element
          const audioElement = document.getElementById(`preview-audio-${voice.id}`);
          if (!audioElement) {
            console.warn(`Audio element for voice ${voice.name} not found`);
            return;
          }

          // Set preload attribute to auto
          audioElement.preload = "auto";

          // Mark as being loaded
          voice.isLoading = true;

          // Load the audio
          audioElement.load();
        } catch (error) {
          console.error(`Exception while trying to preload audio for "${voice.name}":`, error);
          voice.isLoading = false;
        }
      });
    },

    getPreviewAudioUrl(voice) {
      if (!voice.previewAudio) return null;

      const fileName = voice.previewAudio.split('/').pop();
      const audioPath = `/assets/audio/preview/${fileName}`;

      // Always use absolute URLs
      // For localhost, use the staging environment as the origin
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `https://staging-ai-storyteller.webdraw.app${audioPath}`;
      }

      // For production, use the current site's origin
      return `${window.location.origin}${audioPath}`;
    },

    previewAudioReady(voice) {
      this._loadedAudioPreviews.push(voice.name);
      
      // Limpar qualquer timeout existente para evitar logs duplicados
      if (this._previewLogTimeout) {
        clearTimeout(this._previewLogTimeout);
        this._previewLogTimeout = null;
      }
      
      if (this._loadedAudioPreviews.length >= 4) {
        console.log(`Preview audio loaded and ready to play for: ${this._loadedAudioPreviews.join(", ")}`);
        this._loadedAudioPreviews = [];
      } 
      // Caso contrário, configurar um timeout para mostrar as vozes acumuladas
      else {
        this._previewLogTimeout = setTimeout(() => {
          if (this._loadedAudioPreviews.length > 0) {
            console.log(`Preview audio loaded and ready to play for: ${this._loadedAudioPreviews.join(", ")}`);
            this._loadedAudioPreviews = [];
          }
          this._previewLogTimeout = null;
        }, 2000);
      }
      
      voice.isLoading = false;

      // Mark as preloaded
      const audioUrl = this.getPreviewAudioUrl(voice);
      this.preloadedAudios[audioUrl] = true;
    },

    previewAudioError(event, voice) {
      console.error(`Error loading preview audio for "${voice.name}":`, event);
      voice.isLoading = false;
    },

    previewAudioEnded(voice) {
      this.isPreviewPlaying = null;
    },

    getSuggestionClasses(suggestion) {
      return [
        `bg-${suggestion.color}-300`,
        `text-${suggestion.color}-900`,
        'px-3 py-2 rounded-full text-xs cursor-pointer'
      ];
    },

    truncateStoryIntelligently(story, maxLength) {
      if (!story || story.length <= maxLength) return story;
      
      // Find the last paragraph break before maxLength
      const lastBreakIndex = story.lastIndexOf('\n\n', maxLength);
      if (lastBreakIndex > maxLength * 0.85) {
        // If we have a good paragraph break point, use that
        return story.substring(0, lastBreakIndex) + '\n\n[...]';
      }
      
      // Find the last sentence break before maxLength
      const lastSentenceMatch = story.substring(0, maxLength).match(/[.!?]\s+[A-Z]/g);
      if (lastSentenceMatch && lastSentenceMatch.length > 0) {
        const lastMatch = lastSentenceMatch[lastSentenceMatch.length - 1];
        const lastSentenceIndex = story.lastIndexOf(lastMatch, maxLength);
        if (lastSentenceIndex > 0) {
          // Include the punctuation but exclude the capital letter of the next sentence
          return story.substring(0, lastSentenceIndex + 2) + '[...]';
        }
      }
      
      // If no good break points found, just truncate at maxLength
      return story.substring(0, maxLength) + '[...]';
    },

    closeWarningModal() {
      this.showWarningModal = false;
    },

    handleImageError(event) {
      if (this.storyData && this.storyData.imageBase64) {
        event.target.src = this.storyData.imageBase64;
        return;
      }
      
      const fallbackImage = this.getRandomFallbackImage();
      
      const currentSrc = event.target.src;
      if (!currentSrc.includes('unsplash.com') && !currentSrc.includes('staging-ai-storyteller')) {
        event.target.src = fallbackImage;
      }
    }
  },
  template: `
    <div class="min-h-screen bg-white pb-16">
      <nav class="py-3 px-8 flex items-center relative max-w-3xl mx-auto">
        <router-link to="/">
          <i class="fas fa-arrow-left text-slate-700"></i>
        </router-link>
        <div class="flex items-center mx-auto p-2">
          {{ $t('ui.createNewStory') }}
        </div>
      </nav>
      <div v-if="screen === 'form' || screen === 'loading'" class="max-w-3xl mx-auto w-full">
        <template v-if="screen === 'loading'">
          <div class="p-8 transform transition-all duration mb-8">
            <h2 class="font-bold mb-8 relative inline-block mb-3 text-slate-700">
              {{ $t('create.generatingTitle') }}
            </h2>
            <div class="space-y-6">
              <div class="flex items-center gap-4" v-for="(status, task) in taskStatus" :key="task">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-50">
                  <svg v-if="status === 'loading'" class="w-8 h-8 animate-spin text-slate-700" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <svg v-else-if="status === 'done'" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="status === 'error'" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div class="flex-1 flex items-center justify-between gap-2">
                  <span class="text-lg font-medium text-slate-700 capitalize whitespace-nowrap">
                    {{ task === 'plot' ? $t('create.generatingPlot') : 
                       task === 'story' ? $t('create.generatingStory') : 
                       task === 'image' ? $t('create.generatingImage') : 
                       $t('create.generatingAudio') }}
                  </span>
                  <span v-if="task === 'story' && streamingText" class="hidden text-sm text-gray-600 italic truncate max-w-md p-2 bg-[#F0F9FF] rounded-lg border   [#E1F5FE]">
                    "...{{ streamingText.slice(-50) }}"
                  </span>
                  <span v-else-if="task === 'plot' && storyData && storyData.title" class="hidden text-sm text-gray-600 italic truncate max-w-md p-2 bg-[#F0F9FF] rounded-lg border border-[#E1F5FE]">
                    "{{ storyData.title }}"
                  </span>
                  <span v-else-if="task === 'image' && taskStatus.image === 'done'" class="hidden text-sm text-gray-600 italic p-2 bg-[#F0F9FF] rounded-lg border border-[#E1F5FE]">
                    "{{ $t('create.imageCreated') }}"
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="p-8">
            <div class="space-y-8">
              <div class="space-y-3">
                <label class="block text-lg font-medium text-slate-700">{{ $t('create.nameLabel') }}:</label>
                <input type="text" :placeholder="$t('create.namePlaceholder')" v-model="childName" :disabled="screen === 'loading'" class="w-full px-6 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] bg-white text-lg" />
              </div>
              <div class="space-y-3">
                <label class="block text-lg font-medium text-slate-700">{{ $t('create.interestsLabel') }}</label>
                <div class="relative border border-gray-200 rounded-3xl">
                  <textarea :placeholder="$t('create.interestsPlaceholder')" v-model="interests" rows="4" :disabled="screen === 'loading'" class="w-full px-6 py-3 border-0 rounded-3xl focus:ring-2 focus:ring-[#4A90E2] resize-none text-lg min-h-[100px]"></textarea>
                  <button type="button" @click="randomTheme" class="absolute right-4 bottom-4 bg-purple-500 hover:bg-purple-400 text-white px-3 py-2 rounded-full text-xs flex items-center gap-2 shadow-md transition-colors duration-200">
                    <i class="fas fa-dice-five"></i>
                    {{ $t('create.randomTheme') }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-3 mt-4">
                  <span 
                    v-for="suggestion in interestSuggestions" 
                    :key="suggestion.text"
                    :class="getSuggestionClasses(suggestion)"
                    @click="addInterest(suggestion.text)"
                  >
                    {{ suggestion.text }}
                  </span>
                </div>
              </div>
              <div class="space-y-3">
                <label class="block text-lg font-medium text-slate-700">
                  {{ $t('create.voiceLabel') }}
                  <span class="text-red-500">*</span>
                </label>
                <div class="rounded-3xl overflow-hidden p-2 border border-[#DDDDDD]">
                  <div 
                    v-for="(voice, index) in voices" 
                    :key="voice.id"
                    class="mb-4 last:mb-0"
                  >
                    <div 
                      class="rounded-2xl bg-white p-2 flex items-center justify-between duration-200 cursor-pointer"
                      :class="{
                        'bg-teal-100': selectedVoice && selectedVoice.id === voice.id && index === 0,
                        'bg-amber-100': selectedVoice && selectedVoice.id === voice.id && index === 1,
                        'bg-purple-100': selectedVoice && selectedVoice.id === voice.id && index === 2,
                        'bg-blue-100': selectedVoice && selectedVoice.id === voice.id && index > 2
                      }"
                      @click="selectVoice(voice)"
                    >
                      <div class="flex items-center gap-4 flex-1">
                        <div class="flex-shrink-0 voice-avatar-container">
                          <img 
                            :src="getOptimizedAvatarUrl(voice.avatar)" 
                            :alt="voice.name" 
                            class="w-12 h-12 rounded-full voice-avatar-image"
                          />
                        </div>
                        <div>
                          <span class="text-lg font-medium text-slate-700">{{ voice.name }}</span>
                        </div>
                      </div>
                      <button 
                        @click.stop="playVoicePreview(voice)"
                        :class="{
                          'bg-teal-500 hover:bg-teal-600': index === 0,
                          'bg-amber-500 hover:bg-amber-600': index === 1,
                          'bg-purple-500 hover:bg-purple-600': index === 2,
                          'bg-[#4A90E2] hover:bg-[#5FA0E9]': index > 2
                        }"
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
                        :title="isPreviewPlaying === voice.id ? $t('create.pausePreview') : $t('create.playPreview')"
                      >
                        <i v-if="!voice.isLoading" :class="[
                          'fas',
                          isPreviewPlaying === voice.id ? 'fa-pause' : 'fa-play',
                          'text-lg'
                        ]"></i>
                        <i v-else class="fas fa-spinner fa-spin text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="!selectedVoice" class="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-500 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {{ $t('create.voiceRequired') }}
                </div>
                <div v-else class="mt-2 p-2 bg-[#E1F5FE] rounded-lg text-sm text-slate-700 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ $tf('create.voiceSelected', { name: selectedVoice.name }) }}
                </div>
              </div>
              <button @click="generateStory" :disabled="screen === 'loading'" class="flex justify-center items-center gap-2 py-3 px-6 w-full md:w-auto md:min-w-[250px] h-12 bg-gradient-to-b from-purple-300 to-purple-500 border border-purple-700 rounded-full cursor-pointer shadow-md hover:translate-y-[-2px] transition-transform duration-200 font-['Onest'] font-medium text-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {{ $t('create.createButton') }}
              </button>
            </div>
          </div>
        </template>
      </div>
      <div v-if="screen === 'result'" class="max-w-3xl mx-auto pt-6 pb-16 px-4">
        <div class="p-8">
          <div class="space-y-6 mb-6">
            <img v-if="storyImage || (storyData && storyData.imageBase64)" 
                :src="storyImage ? getOptimizedImageUrl(storyImage, 1200, 800) : storyData.imageBase64" 
                alt="Magic Illustration" 
                class="w-full rounded-xl shadow-lg" 
                @error="handleImageError" />
            <div ref="imageErrorMessage" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2 hidden">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.667-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700"></p>
                </div>
              </div>
            </div>
          </div>
          <div class="audio-controls mb-8 space-y-4" v-if="audioSource">
            <div class="flex items-center gap-4">
              <button @click="toggleAudio" class="p-3 rounded-full bg-[#4A90E2] hover:bg-[#5FA0E9] text-white shadow-md transition-colors duration-200" :disabled="audioLoading">
                <svg v-if="audioLoading" class="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="!isPlaying" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3-2a1 1 0 000-1.664z" />
                  <path v-if="isPlaying" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div class="w-full flex items-center gap-2">
                <div class="w-full h-4 bg-gray-200 rounded-full relative">
                  <div class="absolute inset-0 h-4 rounded-full bg-[#4A90E2]" :style="{ width: audioProgress + '%' }"></div>
                </div>
                <span v-if="audioLoading" class="text-xs text-gray-500 animate-pulse">{{ $t('ui.loading') || 'Loading...' }}</span>
              </div>
              <a @click="downloadAudio" class="p-2 text-slate-700 hover:text-[#2871CC] cursor-pointer" :title="$t('ui.download')" :class="{ 'opacity-50 cursor-not-allowed': audioLoading }" :disabled="audioLoading">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
          <div v-if="storyData" class="prose-base text-slate-700 space-y-4">
            <h2 class="text-2xl font-bold mb-6 text-center relative">
              <span class="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#2871CC] via-[#4A90E2] to-[#81D4FA] mb-3">
                {{ storyData.title }}
              </span>
            </h2>
            <div class="space-y-6 whitespace-pre-line text-left" v-html="storyData.story"></div>
          </div>
          <div class="mt-8 text-center">
            <router-link to="/my-stories" class="inline-flex items-center gap-2 bg-gradient-to-b from-[#4A90E2] to-[#2871CC] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-[#5FA0E9] hover:to-[#4A90E2] transition-all duration-300 group font-medium border border-[#2871CC]">
              <span>{{ $t('ui.myStories') }}</span>
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
      <audio 
        ref="audioPlayer" 
        @error="handleAudioError" 
        @canplaythrough="handleAudioReady"
        preload="auto"
        crossorigin="anonymous"
      >
        <source v-if="audioSource" :src="audioSource" type="audio/mpeg" />
        {{ $t('ui.audioNotSupported') }}
      </audio>
      <!-- Add audio elements for voice previews -->
      <div style="display: none;">
        <audio 
          v-for="voice in voices" 
          :key="'preview-' + voice.id"
          :id="'preview-audio-' + voice.id"
          preload="none"
          @ended="previewAudioEnded(voice)"
          @canplaythrough="previewAudioReady(voice)"
          @error="previewAudioError($event, voice)"
        >
          <source v-if="voice.previewAudio" :src="getPreviewAudioUrl(voice)" type="audio/mpeg">
        </audio>
      </div>
      <div v-if="showWarningModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
        <div 
          class="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full relative overflow-hidden transform transition-all duration-300 ease-out"
          :class="{
            'border-l-4 border-amber-500': warningModalData.type === 'warning',
            'scale-100 opacity-100': showWarningModal,
            'scale-95 opacity-0': !showWarningModal
          }"
        >
          <div class="flex justify-center mb-4" v-if="warningModalData.type === 'warning'">
            <div class="bg-amber-500 bg-opacity-20 rounded-full p-4 w-16 h-16 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-2xl text-amber-500"></i>
            </div>
          </div>
          
          <h3 class="text-lg font-medium text-center mb-2">{{ warningModalData.title }}</h3>
          
          <p class="text-gray-600 text-center mb-6">{{ warningModalData.message }}</p>
          
          <div class="flex justify-center">
            <button 
              @click="closeWarningModal" 
              class="px-5 py-2 rounded-full text-white font-medium text-sm bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-600 hover:translate-y-[-2px] hover:from-amber-300 hover:to-amber-400 transition-all duration-200"
            >
              {{ $t('ui.ok') }}
            </button>
          </div>
        </div>
      </div>
    </div>
`};
