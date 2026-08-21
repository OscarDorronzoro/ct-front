import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import serveImagesPlugin from './vite/plugins/serve-images.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  return {
    server: {
      https: {
        key: fs.readFileSync('./tlscert/server.key'),
        cert: fs.readFileSync('./tlscert/server.crt')
      },
      //https: true, // same as "--https" flag
      host: true, // same as "--host" flag
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    plugins: [
      // React core
      react(),

      serveImagesPlugin({
        imagesRoot: '/var/lib/cattle_tracker/images',
        urlPrefix: '/images',
        debug: false,
      }),

      // PWA service worker and manifest
      VitePWA({
        devOptions: {
          enabled: true
        },
        registerType: 'autoUpdate',
        workbox: {
          navigateFallbackDenylist: [/^\/api\//]
        },
        manifest: {
          name: isDev ? 'Rastreo DEV' : 'Rastreo de Vacas',
          short_name: isDev ? 'RastreoDEV' : 'Rastreo',
          description: 'Seguimiento de ganado por GPS',
          icons: [
            {
              src: '/favicon/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/favicon/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          theme_color: '#00241B',
          background_color: '#00241B',
          display: 'standalone', // fullscreen
          orientation: 'portrait',
        }
      }),
    ],
  };
})
