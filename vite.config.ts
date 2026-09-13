import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Philstudio Autonomous Agent',
          short_name: 'Philstudio',
          description: 'A powerful autonomous AI and Web3 workspace.',
          theme_color: '#f9f3d7',
          background_color: '#f9f3d7',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {src: '/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable'},
            {src: '/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable'},
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            charts: ['recharts'],
            markdown: ['react-markdown'],
            icons: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
