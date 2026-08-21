/* eslint-disable no-console */

// vite/plugins/serve-images.js
import fs from 'fs';
import path from 'path';

/**
 * Plugin de Vite para servir imágenes desde el sistema de archivos
 * en desarrollo. Intercepta las peticiones a /images/ y sirve
 * los archivos desde el directorio especificado.
 */
export default function serveImagesPlugin(options = {}) {
  const {
    imagesRoot = '/var/lib/cattle_tracker/images',
    urlPrefix = '/images',
    debug = false
  } = options;

  // Mapa de tipos MIME para imágenes comunes
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.tiff': 'image/tiff',
    '.avif': 'image/avif'
  };

  return {
    name: 'serve-images',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Solo manejar rutas que comiencen con el prefijo especificado
        if (!req.url || !req.url.startsWith(urlPrefix)) {
          next();
          return;
        }

        try {
          // Decodificar la URL para manejar caracteres especiales
          const decodedUrl = decodeURIComponent(req.url);

          // Eliminar el prefijo de la URL
          const relativePath = decodedUrl.replace(urlPrefix, '');

          // Construir la ruta completa al archivo
          const imagePath = path.join(imagesRoot, relativePath);

          if (debug) {
            console.log('[serve-images] Buscando:', imagePath);
          }

          // Verificar que el archivo existe y es un archivo
          if (fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()) {
            const ext = path.extname(imagePath).toLowerCase();
            const contentType = contentTypes[ext] || 'application/octet-stream';

            // Stream el archivo para mejor rendimiento
            const imageStream = fs.createReadStream(imagePath);

            if (debug) {
              console.log('[serve-images] Sirviendo:', imagePath);
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'no-cache');
            res.statusCode = 200;

            imageStream.pipe(res);
          } else {
            if (debug) {
              console.log('[serve-images] No encontrada:', imagePath);
            }

            res.statusCode = 404;
            res.end('Image not found');
          }
        } catch (error) {
          console.error('[serve-images] Error:', error);
          res.statusCode = 500;
          res.end('Internal server error');
        }
      });
    }
  };
}
