/* eslint-disable import/no-default-export, import/no-extraneous-dependencies */
import path from 'path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '#': path.resolve(__dirname, './test')
    }
  },
  plugins: [react()]
})
