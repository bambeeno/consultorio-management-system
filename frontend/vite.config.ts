import { defineConfig, type ServerOptions, type PreviewOptions } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Configuración para manejar client-side routing
    historyApiFallback: true,
  } as ServerOptions,
  preview: {
    port: 4173,
    historyApiFallback: true,
  } as PreviewOptions,
})
