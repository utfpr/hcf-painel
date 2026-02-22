import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    mockReset: true,
    clearMocks: true,
    setupFiles: ['.config/vitest.setup.ts'],
    include: [
      'test/**/*.test.ts',
      'test/**/*.spec.ts',
      'test/**/*.test.tsx',
      'test/**/*.spec.tsx'
    ],
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'json',
        'html'
      ],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: 'reports'
    },
    css: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '#': path.resolve(__dirname, './test')
    }
  }
})
