// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxt/ui'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL as string | undefined,
  },

  build: { transpile: ['trpc-nuxt'] },

  compatibilityDate: '2025-07-15',

  nitro: {
    experimental: { database: true },
  },

  typescript: { typeCheck: true, strict: true },
  eslint: { config: { stylistic: true } },
})
