// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/ui', 'nitro-cloudflare-dev'],

  devtools: {
    enabled: false,
    timeline: {
      enabled: true,
    },
  },

  css: ['~/assets/css/main.css', 'vue3-chessboard/style.css'],

  build: { transpile: ['trpc-nuxt'] },

  compatibilityDate: '2025-10-12',

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@trpc/client',
        'vue3-chessboard',
      ],
    },
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  eslint: {
    // checker: true,
    config: { stylistic: true },
  },
})
