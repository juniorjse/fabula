# AI Storyteller Translation & Admin System

## Overview

The AI Storyteller application implements a custom Content Management System (CMS) for translations and prompts using Webdraw's filesystem API. This approach allows administrators to modify translations and prompts directly through the application without requiring a traditional backend or database.

## How the Translation System Works

### File Structure

The translation system relies on two key files:

1. **Default translations**: `./i18n/translations.json` - This file is bundled with the application and contains all the default translations, examples, and prompts. This is what most users will see.

2. **Custom translations**: `~/AI Storyteller/translations.json` - This is an optional file that can be created in the user's Webdraw filesystem to override the default translations.

### Default Translations

The default translations are loaded from the application's codebase using fetch:

```javascript
// In app.js
async function loadDefaultTranslations() {
  const response = await fetch('./i18n/translations.json');
  const translations = await response.json();
  window.i18n.translations = translations;
}
```

This file contains all the text strings, prompts, voice options, theme suggestions, and example stories for all supported languages. The application initializes with these translations, and they serve as the fallback when custom translations are not available.

### Admin Access Detection

The application determines if a user has admin privileges by checking if they can read and write to the `~/AI Storyteller/translations.json` file using Webdraw's filesystem API (`sdk.fs`). This check happens in the `checkTranslatorAccess()` method:

```javascript
async checkTranslatorAccess() {
    try {
        // Check if we can read and write to the ~/AI Storyteller/translations.json file
        if (sdk && typeof sdk.fs?.read === 'function' && typeof sdk.fs?.write === 'function') {
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
                console.log("Admin access granted - ~/AI Storyteller/translations.json can be read and written");
            } catch (readError) {
                // File doesn't exist or can't be read
                console.log("Translator file doesn't exist or can't be read:", readError.message);
                this.isAdmin = false;
            }
        }
    } catch (error) {
        console.log("Not showing admin menu - ~/AI Storyteller/translations.json cannot be accessed:", error);
        this.isAdmin = false;
    }
}
```

> **Important Note**: The application should NOT try to create this file automatically. The file should only be manually placed in the user's Webdraw filesystem by administrators.

### Admin UI Access

When a user has admin privileges (can read/write the translations file), they will see:

1. An admin link in the navigation bar:
   ```html
   <router-link v-if="isAdmin" to="/_admin" class="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-[#00B7EA] hover:bg-[#F0F9FF] text-sm sm:text-base">
       <i class="fa-solid fa-gear mr-1"></i>
       {{ $t('ui.admin') }}
   </router-link>
   ```

2. Additionally, in preview environments, there's a gear icon that links to the admin page:
   ```html
   <router-link v-if="isPreviewEnvironment" to="/_admin" class="text-[#00B7EA] hover:text-[#0284C7] text-sm sm:text-base px-2 py-1">
       <i class="fa-solid fa-gear"></i>
   </router-link>
   ```

## Translation Loading Process

1. The application initializes and loads the default translations from `./i18n/translations.json` using fetch.
2. After loading the default translations, it attempts to load the custom `~/AI Storyteller/translations.json` file from the user's Webdraw filesystem.
3. If the custom file exists and can be read, its contents override the default translations.
4. The application uses the `window.i18n` object to manage translations.
5. Examples for the homepage are loaded from the translations based on the current language:
   ```javascript
   const currentLang = window.i18n.getLanguage();
   
   if (window.i18n.translations && window.i18n.translations[currentLang] && window.i18n.translations[currentLang].examples) {
       this.examples = window.i18n.translations[currentLang].examples;
   } else if (window.i18n.translations && window.i18n.translations.en && window.i18n.translations.en.examples) {
       // Fallback to English if current language doesn't have examples
       this.examples = window.i18n.translations.en.examples;
   }
   ```

## Admin Interface

The admin interface (accessible at `/_admin`) provides:

1. A UI for editing translations for all supported languages
2. The ability to modify AI prompts used for story generation
3. Tools to manage example stories shown on the homepage

## How Updates Work

1. When an admin makes changes in the admin interface, the application:
   - Updates the in-memory translations
   - Writes the updated content to `~/AI Storyteller/translations.json` using `sdk.fs.write()`
   - Emits a 'translations-updated' event to notify components of the changes
   
2. These changes are immediately available to all users of the application

3. The changes persist because they're stored in the Webdraw filesystem, making this a simple but effective CMS

## Security Considerations

- Only users with filesystem write access to the `~/AI Storyteller/` directory can modify translations
- The application verifies both read and write access before enabling admin features
- In production environments, this effectively restricts admin access to application owners
- In preview environments, the admin link is always visible for testing purposes

## Fallback Mechanism

If the custom translations file cannot be accessed or doesn't exist:
1. The application falls back to default translations from the bundled `./i18n/translations.json` file
2. Admin features are disabled
3. The application continues to function normally for end users 