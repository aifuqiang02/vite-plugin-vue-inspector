import { defineNuxtConfig } from 'nuxt/config'
import Inspector from 'vite-plugin-vue-inspector-ai'

export default defineNuxtConfig({
  vite: {
    plugins: [
      Inspector({
        enabled: true,
        toggleButtonVisibility: 'always',
        launchEditor: 'code',
      }),
    ],
  },
})
