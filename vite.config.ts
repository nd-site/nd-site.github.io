import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'trailing-slash-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Only redirect GET and HEAD navigation requests
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              return next();
            }

            const rawUrl = req.url || '';
            const urlPath = rawUrl.split('?')[0];

            // Ignore internal Vite requests, API routes, or paths with extensions
            if (
              !urlPath ||
              urlPath.startsWith('/@') ||
              urlPath.startsWith('/__') ||
              urlPath.startsWith('/api') ||
              urlPath.includes('.') ||
              urlPath.endsWith('/')
            ) {
              return next();
            }

            // Only redirect recognized directory-based routes
            const KNOWN_DIRECTORIES = [
              '/eduspace',
              '/psychology',
              '/admin',
              '/auth',
              '/chat',
              '/games',
              '/media',
              '/utils',
              '/morse',
              '/privacy',
              '/beta'
            ];

            const isKnownDir = KNOWN_DIRECTORIES.some(
              dir => urlPath === dir || urlPath.startsWith(`${dir}/`)
            );

            if (isKnownDir) {
              const query = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';
              res.writeHead(301, { Location: `${urlPath}/${query}` });
              res.end();
              return;
            }

            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'https://nd-puce.vercel.app',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'assets/mw-dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/miniworld/main.tsx')
        },
        output: {
          entryFileNames: 'bundle.js',
          assetFileNames: 'style.[ext]'
        }
      }
    }
  };
});
