// Vite is the build tool that runs our React app
// This file configures how Vite works
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],  // Enables React support
  server: {
    port: 5173  // Our frontend runs on port 5173
  }
})
