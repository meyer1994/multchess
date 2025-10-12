// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/ui', 'nitro-cloudflare-dev'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  build: { transpile: ['trpc-nuxt'] },

  compatibilityDate: '2025-07-15',

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  typescript: { typeCheck: true, strict: true },
  eslint: { config: { stylistic: true } },
})
