import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// Explicitly import process from node:process
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      'VITE_API_URI': JSON.stringify(env.VITE_API_URI),
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000
    }
  }
})