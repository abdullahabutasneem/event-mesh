import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

/*
Vite dev server config.

The /api proxy forwards browser requests to the backend on port 3000 so
the frontend can call relative URLs like fetch("/api/orders") and avoid
CORS during local development. In production you'd serve both behind the
same reverse proxy or set CORS on the backend.
*/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
