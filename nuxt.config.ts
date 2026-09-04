import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#e5e5e5' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  devServer: {
    host: '127.0.0.1',
    port: 43117,
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [tailwindcss()],
  },
  // Otherwise a first `pnpm dev` blocks on an interactive consent prompt.
  telemetry: false,
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
