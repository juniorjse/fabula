// Default language
let currentLanguage = 'en';

// Get browser language or use default
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const shortLang = browserLang.split('-')[0];
  
  // Check if we support this language
  // We'll check against window.i18n.translations once it's loaded
  return shortLang;
};

// Initialize language from localStorage or browser settings
const initLanguage = () => {
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang) {
    currentLanguage = savedLang;
  } else {
    currentLanguage = getBrowserLanguage();
    // Default to 'en' if we can't determine the language yet
    if (!currentLanguage || currentLanguage === '') {
      currentLanguage = 'en';
    }
    localStorage.setItem('appLanguage', currentLanguage);
  }
  return currentLanguage;
};

// Get current language
const getLanguage = () => currentLanguage;

// Set language
const setLanguage = (lang) => {
  // Check if the language is supported in our translations
  if (window.i18n && window.i18n.translations && window.i18n.translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    
    // Notify components of language change
    if (window.eventBus) {
      window.eventBus.emit('language-changed', lang);
    }
    
    // Dispatch DOM event for SEO meta tags update
    document.dispatchEvent(new CustomEvent('language-updated', { 
      detail: lang 
    }));
    
    return true;
  }
  return false;
};

// Get available languages
const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' }
    ];
};

const t = (key) => {
  if (!window.i18n || !window.i18n.translations) {
    return key; // Return the key itself if translations aren't loaded yet
  }
  
  const keys = key.split('.');
  let result = window.i18n.translations[currentLanguage];
  
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // Fallback to English if key not found in current language
      let fallback = window.i18n.translations['en'];
      if (!fallback) return key; // Return the key if English translations aren't available
      
      for (const fk of keys) {
        if (fallback && fallback[fk] !== undefined) {
          fallback = fallback[fk];
        } else {
          return key; // Return the key itself if not found in fallback
        }
      }
      return fallback;
    }
  }
  
  return result;
};

// Format a translation with variables
const tf = (key, variables = {}) => {
  let text = t(key);
  
  // Replace variables in the format {varName}
  Object.keys(variables).forEach(varName => {
    const regex = new RegExp(`{${varName}}`, 'g');
    text = text.replace(regex, variables[varName]);
  });
  
  return text;
};

// Export the i18n API
export default {
  initLanguage,
  getLanguage,
  setLanguage,
  getAvailableLanguages,
  t,
  tf
}; 