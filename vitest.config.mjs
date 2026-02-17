import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./apps/web-app/tests/setup.ts'],
    include: [
      'apps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/app/**', // Exclude Next.js app directory from tests
      '**/components/**', // Exclude React components from unit tests
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web-app'),
      '@quick-pdfs/common': path.resolve(__dirname, 'packages/common/src'),
      '@quick-pdfs/database': path.resolve(__dirname, 'packages/database'),
      'server-only': path.resolve(__dirname, 'apps/web-app/tests/__mocks__/server-only.ts'),
    },
  },
  esbuild: {
    target: 'node20',
  },
})
