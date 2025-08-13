import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
   server: {
    allowedHosts: [
      'localhost',
      '9f3cf747a3b9.ngrok-free.app'
    ]
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

    },
    
  },
})
