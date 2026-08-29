import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
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
