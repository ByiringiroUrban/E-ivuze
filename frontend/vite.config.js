import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    include: ['src/tests/**/*.test.{js,jsx,ts,tsx}'],
  },
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 5173
  },
  preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173
  },
  build: {
    // Strip console and debugger in production for security (no data in browser console)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
})
