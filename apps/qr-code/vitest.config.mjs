import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['./**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/app/**', '**/components/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@quick-pdfs/common': path.resolve(__dirname, '../../packages/common/src'),
      '@quick-pdfs/database': path.resolve(__dirname, '../../packages/database'),
      'server-only': path.resolve(__dirname, './tests/__mocks__/server-only.ts'),
    },
  },
  esbuild: { target: 'node20' },
})
