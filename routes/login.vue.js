window.LoginPage = {
    template: `
        <div class="min-h-screen bg-gradient-to-b from-[#E1F5FE] to-[#BBDEFB] pb-16">
            <!-- Navigation -->
            <nav class="bg-white shadow-md py-4 px-4 sm:px-6 flex items-center justify-between">
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
            
            <main class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
                <h2 class="text-2xl font-semibold mb-6 text-center">{{ $t('login.title') }}</h2>
                <form class="space-y-4" @submit.prevent>
                    <div>
                        <label class="block text-gray-700 mb-2">{{ $t('login.email') }}</label>
                        <input type="email" class="w-full p-2 border rounded-lg" :placeholder="$t('login.emailPlaceholder')">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">{{ $t('login.password') }}</label>
                        <input type="password" class="w-full p-2 border rounded-lg" :placeholder="$t('login.passwordPlaceholder')">
                    </div>
                    <button class="w-full bg-[#4A90E2] text-white py-2 rounded-lg hover:bg-[#5FA0E9]">{{ $t('login.loginButton') }}</button>
                </form>
            </main>
        </div>
    `
}; 