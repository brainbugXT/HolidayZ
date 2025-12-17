import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Add build timestamp for cache debugging
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    // Cost optimization: smaller bundles, better compression
    target: 'es2020',
    minify: 'esbuild', // Faster than terser for development
    sourcemap: false, // Disable source maps in production to save space
    rollupOptions: {
      output: {
        // Split vendor code for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@heroicons')) {
              return 'heroicons';
            }
            return 'vendor';
          }
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Development server optimization
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    // Preview server for Google Cloud (matches app.yaml)
    host: '0.0.0.0',
    port: 8080,
  },
})
