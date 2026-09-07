import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Load service account if available during build
let serviceAccountData: any = null
const possiblePaths = [
  path.resolve(__dirname, 'service-account.json'),
  '/etc/secrets/service-account.json',
]

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      serviceAccountData = JSON.parse(fs.readFileSync(p, 'utf-8'))
      break
    } catch {}
  }
}

if (!serviceAccountData && process.env.SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccountData = JSON.parse(process.env.SERVICE_ACCOUNT_JSON)
  } catch {}
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    __GOOGLE_SERVICE_ACCOUNT__: JSON.stringify(serviceAccountData),
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  }
})

