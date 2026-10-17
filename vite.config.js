import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import serveImagesPlugin from './vite/plugins/serve-images.js';

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
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

    build: {
      rollupOptions: {
        output: {
          // Libraries in their own files: a deploy that only changes app code doesn't
          // make clients download them again (they keep their hash)
          manualChunks(id) {
            if (id.includes('/node_modules/maplibre-gl/')) {
              return 'maplibre';
            }
            if (id.includes('/node_modules/terra-draw')) {
              return 'terra-draw';
            }
            if (/\/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) {
              return 'react';
            }
            return undefined;
          },
        },
      },
      // maplibre alone is ~1 MB (minified); it is a single dependency, not app code
      chunkSizeWarningLimit: 1100,
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
          navigateFallbackDenylist: [/^\/api\//],
          // Default patterns plus the Inter subsets used by Spanish, so text keeps its font offline.
          // The dev service worker (dev-dist) has no fonts: Vite serves them from node_modules.
          globPatterns: [
            '**/*.{js,css,html}',
            ...(command === 'build' ? ['**/inter-latin-*.woff2'] : []),
          ],
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
          theme_color: '#071a16',
          background_color: '#071a16',
          display: 'standalone', // fullscreen
          orientation: 'portrait',
        }
      }),
    ],
  };
})
