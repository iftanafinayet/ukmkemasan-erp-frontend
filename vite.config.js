import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const certKeyPath = path.resolve(__dirname, 'certs/localhost-key.pem')
const certPath = path.resolve(__dirname, 'certs/localhost.pem')
const hasLocalCerts = fs.existsSync(certKeyPath) && fs.existsSync(certPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    https: hasLocalCerts
      ? {
          key: fs.readFileSync(certKeyPath),
          cert: fs.readFileSync(certPath),
        }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
