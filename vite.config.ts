import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-charts': ['lightweight-charts'],
          'vendor-ui': ['lucide-react', 'react-spinners', 'classnames'],
          'vendor-state': ['zustand', 'swr', 'axios'],
        }
      }
    }
  },
  server: {
    proxy: {
      '^/bluemap/.*/live/markers\\.json': {
        target: 'http://backend:5000/territories/bluemap-markers',
        changeOrigin: true,
        rewrite: (path) => {
          const mapMatch = path.match(/\/maps\/([^/]+)/);
          const mapName = mapMatch ? mapMatch[1] : 'world';
          return `?map=${mapName}`;
        }
      },
      '^/bluemap/.*': {
        target: 'http://minecraft_server:8100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bluemap/, '')
      }
    }
  }
});
