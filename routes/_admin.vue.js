import i18n from '../i18n/index.js';
import { sdk } from '../sdk.js';

window.AdminPage = {
  data() {
    return {
      languages: i18n.getAvailableLanguages(),
      currentLanguage: i18n.getLanguage(),
      sections: [
        { id: 'ui', label: 'UI Elements' },
        { id: 'home', label: 'Home Page' },
        { id: 'create', label: 'Create Page' },
        { id: 'myStories', label: 'My Stories Page' },
        { id: 'story', label: 'Story Page' },
        { id: 'examples', label: 'Example Stories' },
        { id: 'voices', label: 'Voice Options' },
        { id: 'interestSuggestions', label: 'Interest Suggestions' },
        { id: 'themeSuggestions', label: 'Theme Suggestions' },
        { id: 'prompts', label: 'AI Prompts' }
      ],
      currentSection: 'ui',
      editedTranslations: {},
      isSaving: false,
      saveMessage: '',
      saveError: false,
      showAddLanguageModal: false,
      newLanguageCode: '',
      newLanguageName: '',
      searchQuery: '',
      expandedItems: {},
      isLoading: true,
      allowEditingEnglish: false,
      showConfirmModal: false,
      confirmModalData: {
        title: "",
        message: "",
        confirmCallback: null,
        type: "delete" // delete, warning, info, etc.
      },
    };
  },
  computed: {
    currentSectionData() {
      if (!this.currentSection || this.isLoading || !this.editedTranslations.en) return [];
      
      const en = this.editedTranslations.en[this.currentSection];
      const current = this.editedTranslations[this.currentLanguage][this.currentSection];
      
      // Special handling for arrays
      if (Array.isArray(en)) {
        return en.map((item, index) => {
          if (typeof item === 'string') {
            return {
              key: index.toString(),
              enValue: item,
              currentValue: this.currentLanguage === 'en' ? item : (current[index] || '')
            };
          } else {
            // For objects in arrays (like voices)
            return {
              key: index.toString(),
              isObject: true,
              properties: Object.keys(item).map(propKey => ({
                key: propKey,
                enValue: item[propKey],
                currentValue: this.currentLanguage === 'en' ? item[propKey] : ((current[index] && current[index][propKey]) || '')
              }))
            };
          }
        });
      }
      
      // For regular objects
      return Object.keys(en || {}).map(key => {
        if (typeof en[key] === 'object' && en[key] !== null && !Array.isArray(en[key])) {
          return {
            key,
            isObject: true,
            properties: Object.keys(en[key]).map(subKey => ({
              key: subKey,
              enValue: en[key][subKey],
              currentValue: this.currentLanguage === 'en' ? en[key][subKey] : ((current[key] && current[key][subKey]) || '')
            }))
          };
        } else {
          return {
            key,
            enValue: en[key],
            currentValue: this.currentLanguage === 'en' ? en[key] : (current[key] || '')
          };
        }
      });
    },
    filteredSectionData() {
      if (!this.searchQuery) return this.currentSectionData;
      
      const query = this.searchQuery.toLowerCase();
      return this.currentSectionData.filter(item => {
        if (item.isObject) {
          return item.properties.some(prop => 
            prop.key.toLowerCase().includes(query) || 
            prop.enValue.toString().toLowerCase().includes(query) ||
            prop.currentValue.toString().toLowerCase().includes(query)
          );
        } else {
          return item.key.toLowerCase().includes(query) || 
                 item.enValue.toString().toLowerCase().includes(query) ||
                 item.currentValue.toString().toLowerCase().includes(query);
        }
      });
    }
  },
  methods: {
    async loadCustomTranslations() {
      this.isLoading = true;
      try {
        // First, make sure we have the global translations
        if (window.i18n && window.i18n.translations) {
          // Create a deep copy of the translations
          this.editedTranslations = JSON.parse(JSON.stringify(window.i18n.translations));
          
          // Now try to load custom translations if they exist
          if (sdk && typeof sdk.fs?.read === 'function') {
            const translatorPath = "~/AI Storyteller/translations.json";
            try {
              const content = await sdk.fs.read(translatorPath);
              if (content) {
                try {
                  // Parse JSON directly
                  const customTranslations = JSON.parse(content);
                  console.log("Loaded custom translations from ~/AI Storyteller/translations.json");
                  // Update the editedTranslations with the custom translations
                  this.editedTranslations = JSON.parse(JSON.stringify(customTranslations));
                } catch (parseError) {
                  console.error("Error parsing custom translations:", parseError);
                }
              }
            } catch (readError) {
              console.warn("Could not read custom translations file:", readError);
            }
          }
        } else {
          console.error("Global translations not available");
        }
      } catch (error) {
        console.error("Error loading translations:", error);
      } finally {
        this.isLoading = false;
      }
    },
    changeLanguage(lang) {
      this.currentLanguage = lang;
    },
    updateTranslation(item, value) {
      if (item.isObject) return;
      
      // Handle nested paths
      const keys = item.key.split('.');
      let target = this.editedTranslations[this.currentLanguage][this.currentSection];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }
      
      target[keys[keys.length - 1]] = value;
      
      // If we're editing English, we need to update both the display value and the stored value
      if (this.currentLanguage === 'en') {
        // The item.enValue is already updated via v-model, but we need to make sure
        // the actual translations object is updated too
        let enTarget = this.editedTranslations.en[this.currentSection];
        for (let i = 0; i < keys.length - 1; i++) {
          if (!enTarget[keys[i]]) {
            enTarget[keys[i]] = {};
          }
          enTarget = enTarget[keys[i]];
        }
        enTarget[keys[keys.length - 1]] = value;
      }
    },
    updateObjectTranslation(item, prop, value) {
      if (!item.isObject) return;
      
      const index = parseInt(item.key);
      const section = this.editedTranslations[this.currentLanguage][this.currentSection];
      
      if (Array.isArray(section)) {
        if (!section[index]) {
          // Clone the structure from English
          section[index] = JSON.parse(JSON.stringify(this.editedTranslations.en[this.currentSection][index]));
        }
        section[index][prop.key] = value;
        
        // If we're editing English, we need to update both the display value and the stored value
        if (this.currentLanguage === 'en') {
          // The prop.enValue is already updated via v-model, but we need to make sure
          // the actual translations object is updated too
          const enSection = this.editedTranslations.en[this.currentSection];
          if (enSection && Array.isArray(enSection) && enSection[index]) {
            enSection[index][prop.key] = value;
          }
        }
      } else {
        if (!section[item.key]) {
          section[item.key] = {};
        }
        section[item.key][prop.key] = value;
        
        // If we're editing English, we need to update both the display value and the stored value
        if (this.currentLanguage === 'en') {
          // The prop.enValue is already updated via v-model, but we need to make sure
          // the actual translations object is updated too
          const enSection = this.editedTranslations.en[this.currentSection];
          if (enSection && enSection[item.key]) {
            enSection[item.key][prop.key] = value;
          }
        }
      }
    },
    toggleExpand(key) {
      this.expandedItems = {
        ...this.expandedItems,
        [key]: !this.expandedItems[key]
      };
    },
    isExpanded(key) {
      return !!this.expandedItems[key];
    },
    async saveTranslations() {
      this.isSaving = true;
      this.saveMessage = 'Saving translations...';
      this.saveError = false;
      
      try {
        // Create JSON content
        const jsonContent = JSON.stringify(this.editedTranslations, null, 2);
        
        // Save to the AI Storyteller directory as JSON
        const translatorPath = "~/AI Storyteller/translations.json";
        await sdk.fs.write(translatorPath, jsonContent);
        console.log("Saved translations to ~/AI Storyteller/translations.json");
        
        // Update the global translations
        window.i18n.translations = JSON.parse(JSON.stringify(this.editedTranslations));
        
        // Notify components that translations have been updated
        if (window.eventBus) {
          window.eventBus.emit('translations-updated');
        }
        
        this.saveMessage = 'Translations saved successfully!';
        setTimeout(() => {
          this.saveMessage = '';
        }, 3000);
      } catch (error) {
        console.error('Error saving translations:', error);
        this.saveMessage = `Error saving translations: ${error.message}`;
        this.saveError = true;
      } finally {
        this.isSaving = false;
      }
    },
    addNewLanguage() {
      if (!this.newLanguageCode || !this.newLanguageName) {
        alert('Please provide both a language code and name');
        return;
      }
      
      // Clone English structure for the new language
      this.editedTranslations[this.newLanguageCode] = JSON.parse(JSON.stringify(this.editedTranslations.en));
      
      // Ensure examples are properly initialized
      if (!this.editedTranslations[this.newLanguageCode].examples && this.editedTranslations.en.examples) {
        this.editedTranslations[this.newLanguageCode].examples = JSON.parse(JSON.stringify(this.editedTranslations.en.examples));
      }
      
      // Add to languages list
      this.languages.push({
        code: this.newLanguageCode,
        name: this.newLanguageName
      });
      
      // Switch to the new language
      this.currentLanguage = this.newLanguageCode;
      
      // Close modal and reset fields
      this.showAddLanguageModal = false;
      this.newLanguageCode = '';
      this.newLanguageName = '';
    },
    cancelAddLanguage() {
      this.showAddLanguageModal = false;
      this.newLanguageCode = '';
      this.newLanguageName = '';
    },
    addNewExample() {
      // Create a new example with default values
      const newExample = {
        title: "New Example Story",
        childName: "Child Name",
        themes: "Theme 1, Theme 2",
        voice: "Voice Name",
        voiceAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=example&backgroundColor=b6e3f4",
        image: "https://fs.webdraw.com/users/117259cb-462f-4558-9b28-7aa8f21715a9/Pictures/default_illustration.webp",
        isPlaying: false,
        progress: "0%"
      };
      
      // Add to the current language examples
      if (!this.editedTranslations[this.currentLanguage].examples) {
        this.editedTranslations[this.currentLanguage].examples = [];
      }
      
      this.editedTranslations[this.currentLanguage].examples.push(newExample);
      
      // If this is a new language without examples, make sure to copy the structure from English
      if (this.currentLanguage !== 'en' && this.editedTranslations[this.currentLanguage].examples.length === 1) {
        // Copy all examples from English but keep the new one we just added
        const englishExamples = this.editedTranslations.en.examples || [];
        for (let i = 0; i < englishExamples.length; i++) {
          if (i === 0) {
            // Skip the first one as we already added our new example
            continue;
          }
          // Create a copy with the same structure but empty values
          const exampleCopy = { ...englishExamples[i] };
          this.editedTranslations[this.currentLanguage].examples.push(exampleCopy);
        }
      }
      
      // If we're adding to English, we need to make sure all other languages have this example too
      if (this.currentLanguage === 'en') {
        // For each language other than English
        Object.keys(this.editedTranslations).forEach(langCode => {
          if (langCode !== 'en') {
            // Make sure the examples array exists
            if (!this.editedTranslations[langCode].examples) {
              this.editedTranslations[langCode].examples = [];
            }
            
            // Add a copy of the new example to this language
            const exampleCopy = { ...newExample };
            this.editedTranslations[langCode].examples.push(exampleCopy);
          }
        });
      }
    },
    removeExample(index) {
      this.showDeleteConfirm('example', index);
    },
    updateEnglishTranslation(item, value) {
      if (item.isObject) return;
      
      // Handle nested paths
      const keys = item.key.split('.');
      let target = this.editedTranslations[this.currentLanguage][this.currentSection];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }
      
      target[keys[keys.length - 1]] = value;
      
      // If we're editing English, we need to update both the display value and the stored value
      if (this.currentLanguage === 'en') {
        // The item.enValue is already updated via v-model, but we need to make sure
        // the actual translations object is updated too
        let enTarget = this.editedTranslations.en[this.currentSection];
        for (let i = 0; i < keys.length - 1; i++) {
          if (!enTarget[keys[i]]) {
            enTarget[keys[i]] = {};
          }
          enTarget = enTarget[keys[i]];
        }
        enTarget[keys[keys.length - 1]] = value;
      }
    },
    updateEnglishObjectTranslation(item, prop, value) {
      if (!item.isObject) return;
      
      const index = parseInt(item.key);
      const section = this.editedTranslations[this.currentLanguage][this.currentSection];
      
      if (Array.isArray(section)) {
        if (!section[index]) {
          // Clone the structure from English
          section[index] = JSON.parse(JSON.stringify(this.editedTranslations.en[this.currentSection][index]));
        }
        section[index][prop.key] = value;
        
        // If we're editing English, we need to update both the display value and the stored value
        if (this.currentLanguage === 'en') {
          // The prop.enValue is already updated via v-model, but we need to make sure
          // the actual translations object is updated too
          const enSection = this.editedTranslations.en[this.currentSection];
          if (enSection && Array.isArray(enSection) && enSection[index]) {
            enSection[index][prop.key] = value;
          }
        }
      } else {
        if (!section[item.key]) {
          section[item.key] = {};
        }
        section[item.key][prop.key] = value;
        
        // If we're editing English, we need to update both the display value and the stored value
        if (this.currentLanguage === 'en') {
          // The prop.enValue is already updated via v-model, but we need to make sure
          // the actual translations object is updated too
          const enSection = this.editedTranslations.en[this.currentSection];
          if (enSection && enSection[item.key]) {
            enSection[item.key][prop.key] = value;
          }
        }
      }
    },
    addNewInterestSuggestion() {
      // Create a new interest suggestion with default values
      const newInterest = {
        text: "New Interest",
        color: "#22C55E"
      };
      
      // Add to the current language interest suggestions
      if (!this.editedTranslations[this.currentLanguage].interestSuggestions) {
        this.editedTranslations[this.currentLanguage].interestSuggestions = [];
      }
      
      this.editedTranslations[this.currentLanguage].interestSuggestions.push(newInterest);
      
      // If this is a new language without interest suggestions, make sure to copy the structure from English
      if (this.currentLanguage !== 'en' && this.editedTranslations[this.currentLanguage].interestSuggestions.length === 1) {
        // Copy all interest suggestions from English but keep the new one we just added
        const englishInterests = this.editedTranslations.en.interestSuggestions || [];
        for (let i = 0; i < englishInterests.length; i++) {
          if (i === 0) {
            // Skip the first one as we already added our new interest
            continue;
          }
          // Create a copy with the same structure but empty values
          const interestCopy = { ...englishInterests[i] };
          this.editedTranslations[this.currentLanguage].interestSuggestions.push(interestCopy);
        }
      }
      
      // If we're adding to English, we need to make sure all other languages have this interest too
      if (this.currentLanguage === 'en') {
        // For each language other than English
        Object.keys(this.editedTranslations).forEach(langCode => {
          if (langCode !== 'en') {
            // Make sure the interestSuggestions array exists
            if (!this.editedTranslations[langCode].interestSuggestions) {
              this.editedTranslations[langCode].interestSuggestions = [];
            }
            
            // Add a copy of the new interest to this language
            const interestCopy = { ...newInterest };
            this.editedTranslations[langCode].interestSuggestions.push(interestCopy);
          }
        });
      }
    },
    removeInterestSuggestion(index) {
      this.showDeleteConfirm('interest', index);
    },
    showDeleteConfirm(itemType, index) {
      let title, message, callback;
      
      if (itemType === 'example') {
        const example = this.editedTranslations[this.currentLanguage].examples[index];
        title = this.$t('admin.removeExampleTitle');
        message = this.$t('admin.removeExampleMessage').replace('{title}', example.title);
        callback = () => {
          this.editedTranslations[this.currentLanguage].examples.splice(index, 1);
          
          // If we're removing from English, we should remove from all languages to maintain consistency
          if (this.currentLanguage === 'en') {
            Object.keys(this.editedTranslations).forEach(langCode => {
              if (langCode !== 'en' && this.editedTranslations[langCode].examples && 
                  this.editedTranslations[langCode].examples.length > index) {
                this.editedTranslations[langCode].examples.splice(index, 1);
              }
            });
          }
        };
      } else if (itemType === 'interest') {
        const suggestion = this.editedTranslations[this.currentLanguage].interestSuggestions[index];
        title = this.$t('admin.removeInterestTitle');
        message = this.$t('admin.removeInterestMessage').replace('{text}', suggestion.text);
        callback = () => {
          this.editedTranslations[this.currentLanguage].interestSuggestions.splice(index, 1);
          
          // If we're removing from English, we should remove from all languages to maintain consistency
          if (this.currentLanguage === 'en') {
            Object.keys(this.editedTranslations).forEach(langCode => {
              if (langCode !== 'en' && this.editedTranslations[langCode].interestSuggestions && 
                  this.editedTranslations[langCode].interestSuggestions.length > index) {
                this.editedTranslations[langCode].interestSuggestions.splice(index, 1);
              }
            });
          }
        };
      }
      
      this.confirmModalData = {
        title: title,
        message: message,
        confirmCallback: callback,
        type: 'delete'
      };
      
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
    },
    confirmAction() {
      if (this.confirmModalData.confirmCallback) {
        this.confirmModalData.confirmCallback();
      }
      this.closeConfirmModal();
    }
  },
  mounted() {
    // Try to load custom translations
    this.loadCustomTranslations();
    
    // Listen for translations-updated events
    if (window.eventBus) {
      window.eventBus.on('translations-updated', () => {
        this.loadCustomTranslations();
      });
    }
  },
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#E1F5FE] to-[#BBDEFB] pb-16">
      <!-- Navigation -->
      <nav class="bg-white shadow-md py-4 px-4 sm:px-6 flex items-center justify-between mb-4">
        <div class="flex items-center space-x-1 sm:space-x-4 overflow-x-auto whitespace-nowrap">
          <router-link to="/" class="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-[#4A90E2] hover:bg-[#F0F9FF] text-sm sm:text-base">
            {{ $t('ui.home') }}
          </router-link>
          <router-link to="/create" class="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-[#4A90E2] hover:bg-[#F0F9FF] text-sm sm:text-base">
            {{ $t('ui.new') }}
          </router-link>
          <router-link to="/my-stories" class="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-[#4A90E2] hover:bg-[#F0F9FF] text-sm sm:text-base">
            {{ $t('ui.myStories') }}
          </router-link>
        </div>
      </nav>
      
      <div class="admin-container p-4">
        <h1 class="text-2xl font-bold mb-4">Translation Management</h1>
        
        <!-- Language selector -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Select Language:</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="lang in languages" 
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="px-3 py-1 rounded"
              :class="currentLanguage === lang.code ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
            >
              {{ lang.name }}
            </button>
            <button 
              @click="showAddLanguageModal = true"
              class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
            >
              + Add Language
            </button>
          </div>
        </div>
        
        <!-- Toggle for editing English -->
        <div class="mb-6">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="allowEditingEnglish" 
              class="mr-2"
            />
            <span class="text-sm font-medium">Allow editing English translations</span>
          </label>
        </div>
        
        <!-- Section selector -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Select Section:</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="section in sections" 
              :key="section.id"
              @click="currentSection = section.id"
              class="px-3 py-1 rounded"
              :class="currentSection === section.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
            >
              {{ section.label }}
            </button>
          </div>
        </div>
        
        <!-- Search -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Search:</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search translations..." 
            class="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <!-- Translation editor -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Edit Translations</h2>
          
          <div v-if="filteredSectionData.length === 0" class="text-gray-500">
            No translations found for this section or search query.
          </div>
          
          <!-- Special UI for Examples section -->
          <div v-else-if="currentSection === 'examples'" class="space-y-6">
            <div class="flex justify-between mb-4">
              <h3 class="text-lg font-medium">Example Stories</h3>
              <button 
                @click="addNewExample" 
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Example
              </button>
            </div>
            
            <div 
              v-for="(example, index) in editedTranslations[currentLanguage].examples" 
              :key="index"
              class="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium text-lg">Example #{{ index + 1 }}</h4>
                <button 
                  @click="removeExample(index)" 
                  class="text-red-500 hover:text-red-700"
                  title="Remove this example"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Title -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Title:</label>
                  <input 
                    v-model="example.title" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Child Name -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Child's Name:</label>
                  <input 
                    v-model="example.childName" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Themes -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Themes:</label>
                  <input 
                    v-model="example.themes" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Voice -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Voice:</label>
                  <input 
                    v-model="example.voice" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Voice Avatar -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Voice Avatar URL:</label>
                  <input 
                    v-model="example.voiceAvatar" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Image -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Image URL:</label>
                  <input 
                    v-model="example.image" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Progress (for display purposes) -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Progress (e.g. "33%"):</label>
                  <input 
                    v-model="example.progress" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Is Playing (checkbox) -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">
                    <input 
                      v-model="example.isPlaying" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    Is Playing
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Special UI for Interest Suggestions section -->
          <div v-else-if="currentSection === 'interestSuggestions'" class="space-y-6">
            <div class="flex justify-between mb-4">
              <h3 class="text-lg font-medium">Interest Suggestions</h3>
              <button 
                @click="addNewInterestSuggestion" 
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Interest
              </button>
            </div>
            
            <div 
              v-for="(interest, index) in editedTranslations[currentLanguage].interestSuggestions || []" 
              :key="index"
              class="border rounded-lg p-4 bg-white shadow-sm mb-4"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium text-lg">Interest #{{ index + 1 }}</h4>
                <button 
                  @click="removeInterestSuggestion(index)" 
                  class="text-red-500 hover:text-red-700"
                  title="Remove this interest"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Text -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Text:</label>
                  <input 
                    v-model="interest.text" 
                    type="text" 
                    class="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <!-- Color -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium">Color (HEX):</label>
                  <div class="flex items-center gap-2">
                    <input 
                      v-model="interest.color" 
                      type="text" 
                      class="flex-1 px-3 py-2 border rounded"
                      placeholder="#RRGGBB"
                    />
                    <div 
                      class="w-8 h-8 border rounded" 
                      :style="{ backgroundColor: interest.color || '#CCCCCC' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Regular translation UI for other sections -->
            <div 
              v-for="item in filteredSectionData" 
              :key="item.key"
              class="border rounded p-4"
            >
              <!-- Regular key-value pair -->
              <template v-if="!item.isObject">
                <div class="mb-2">
                  <span class="font-medium">{{ item.key }}:</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">English:</label>
                    <textarea 
                      :value="item.enValue"
                      :readonly="currentLanguage !== 'en' && !allowEditingEnglish"
                      @input="currentLanguage === 'en' || allowEditingEnglish ? updateEnglishTranslation(item, $event.target.value) : null"
                      rows="2"
                      :class="'w-full px-3 py-2 border rounded ' + (currentLanguage !== 'en' && !allowEditingEnglish ? 'bg-gray-50' : '')"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">{{ languages.find(l => l.code === currentLanguage)?.name }}:</label>
                    <textarea 
                      v-model="item.currentValue" 
                      @input="updateTranslation(item, item.currentValue)"
                      rows="2"
                      class="w-full px-3 py-2 border rounded"
                    ></textarea>
                  </div>
                </div>
              </template>
              
              <!-- Object with nested properties -->
              <template v-else>
                <div class="flex justify-between items-center mb-2 cursor-pointer" @click="toggleExpand(item.key)">
                  <span class="font-medium">{{ item.key }}</span>
                  <span>{{ isExpanded(item.key) ? '▼' : '►' }}</span>
                </div>
                
                <div v-if="isExpanded(item.key)" class="pl-4 border-l-2 border-gray-200 mt-2 space-y-4">
                  <div v-for="prop in item.properties" :key="prop.key" class="mt-2">
                    <div class="mb-1">
                      <span class="font-medium">{{ prop.key }}:</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">English:</label>
                        <textarea 
                          :value="prop.enValue"
                          :readonly="currentLanguage !== 'en' && !allowEditingEnglish"
                          @input="currentLanguage === 'en' || allowEditingEnglish ? updateEnglishObjectTranslation(item, prop, $event.target.value) : null"
                          rows="2"
                          :class="'w-full px-3 py-2 border rounded ' + (currentLanguage !== 'en' && !allowEditingEnglish ? 'bg-gray-50' : '')"
                        ></textarea>
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">{{ languages.find(l => l.code === currentLanguage)?.name }}:</label>
                        <textarea 
                          v-model="prop.currentValue" 
                          @input="updateObjectTranslation(item, prop, prop.currentValue)"
                          rows="2"
                          class="w-full px-3 py-2 border rounded"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        
        <!-- Save button -->
        <div class="mt-6">
          <button 
            @click="saveTranslations" 
            :disabled="isSaving"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {{ isSaving ? 'Saving...' : 'Save Translations' }}
          </button>
          
          <div 
            v-if="saveMessage" 
            class="mt-2 p-2 rounded"
            :class="saveError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
          >
            {{ saveMessage }}
          </div>
        </div>
        
        <!-- Add Language Modal -->
        <div v-if="showAddLanguageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Add New Language</h2>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Language Code (2 letters):</label>
              <input 
                v-model="newLanguageCode" 
                type="text" 
                placeholder="e.g., fr, es, de" 
                class="w-full px-3 py-2 border rounded"
                maxlength="2"
              />
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium mb-1">Language Name:</label>
              <input 
                v-model="newLanguageName" 
                type="text" 
                placeholder="e.g., French, Spanish, German" 
                class="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div class="flex justify-end gap-2">
              <button 
                @click="cancelAddLanguage"
                class="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                @click="addNewLanguage"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                :disabled="!newLanguageCode || !newLanguageName"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>
        
        <!-- Confirmation Modal -->
        <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
          <div 
            class="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full relative overflow-hidden transform transition-all duration-300 ease-out"
            :class="{
              'border-l-4 border-[#ff6b6b]': confirmModalData.type === 'delete',
              'scale-100 opacity-100': showConfirmModal,
              'scale-95 opacity-0': !showConfirmModal
            }"
          >
            <!-- Header Icon -->
            <div class="flex justify-center mb-4" v-if="confirmModalData.type === 'delete'">
              <div class="bg-[#ff6b6b] bg-opacity-20 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                <i class="fa-solid fa-trash text-2xl text-[#ff6b6b]"></i>
              </div>
            </div>
            
            <!-- Title -->
            <h3 class="text-lg font-medium text-center mb-2">{{ confirmModalData.title }}</h3>
            
            <!-- Message -->
            <p class="text-gray-600 text-center mb-6">{{ confirmModalData.message }}</p>
            
            <!-- Buttons -->
            <div class="flex gap-3 justify-center">
              <button 
                @click="closeConfirmModal" 
                class="px-5 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition duration-200 font-medium text-sm"
              >
                {{ $t('ui.cancel') }}
              </button>
              <button 
                @click="confirmAction" 
                class="px-5 py-2 rounded-full text-white font-medium text-sm"
                :class="confirmModalData.type === 'delete' ? 'bg-[#ff6b6b] hover:bg-[#ff5252]' : 'bg-gradient-to-b from-[#4A90E2] to-[#2871CC] hover:from-[#5FA0E9] hover:to-[#4A90E2]'"
              >
                {{ $t('ui.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}; 