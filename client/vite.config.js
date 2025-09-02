import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://www.apiblog.grabatoz.ae",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
