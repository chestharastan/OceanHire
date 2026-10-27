import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // The three.js chunk (~570 kB, ~143 kB gzip) is intentionally large but it is
    // lazy-loaded after first paint, so the size warning doesn't apply to it.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        // three.js is the heavy part of the bundle. Keeping it in its own chunk means
        // the page (hero copy, nav, form) paints first and the 3D engine streams in
        // afterwards; it is also cached independently of app code between deploys.
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
