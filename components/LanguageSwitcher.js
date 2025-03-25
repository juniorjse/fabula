// Language Switcher Component
export default {
    template: `
        <div class="language-switcher">
            <div class="relative inline-flex items-center">
                <i class="fa-solid fa-globe text-[#8B5CF6] absolute left-3 z-10 pointer-events-none"></i>
                <select 
                    v-model="currentLanguage"
                    @change="changeLanguage"
                    class="appearance-none pl-9 pr-8 py-2 rounded-full bg-[#EDE9FE] hover:bg-[#F5F3FF] border border-[#A78BFA] text-sm text-[#6D28D9] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                >
                    <option 
                        v-for="lang in languages" 
                        :key="lang.code" 
                        :value="lang.code"
                    >
                        {{ lang.name }}
                    </option>
                </select>
                <i class="fa-solid fa-chevron-down text-xs text-[#6D28D9] absolute right-3 pointer-events-none"></i>
            </div>
        </div>
    `,
    data() {
        return {
            languages: window.i18n.getAvailableLanguages(),
            currentLanguage: window.i18n.getLanguage()
        };
    },
    methods: {
        changeLanguage() {
            window.i18n.setLanguage(this.currentLanguage);
            // The i18n system will now handle the notification
            
            // Also dispatch a DOM event for the SEO meta tags update
            document.dispatchEvent(new CustomEvent('language-updated', { 
                detail: this.currentLanguage 
            }));
        }
    }
}; 