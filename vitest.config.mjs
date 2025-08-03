import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [path.resolve(__dirname, './apps/web-dashboard/tests/setup.ts')],
    include: [
      path.resolve(__dirname, 'apps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'),
      path.resolve(__dirname, 'packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}')
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
      '@': path.resolve(__dirname, '.'),
      '@/web': path.resolve(__dirname, './apps/web-dashboard'),
      '@/proxy': path.resolve(__dirname, './apps/proxy-service'),
      '@/shared': path.resolve(__dirname, './packages/shared-types'),
    },
  },
  esbuild: {
    target: 'node20',
  },
})
