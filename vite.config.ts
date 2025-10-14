/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

const baseUrl = process.env.BASE_URL ?? '/'

export default defineConfig({
  base: baseUrl,
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /%VITE_RECAPTCHA_SITE_KEY%/g,
          process.env.VITE_RECAPTCHA_SITE_KEY ?? ''
        )
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '#': path.resolve(__dirname, './test')
    }
  }
})
