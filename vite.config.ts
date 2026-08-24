import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// scripts/next-build-version.mjs がビルド時に書き込むバージョン情報（dev 時は 'dev'）
function loadBuildVersion(): string {
  try {
    const counterFile = join(dirname(fileURLToPath(import.meta.url)), 'build-info.json')
    const { date, count } = JSON.parse(readFileSync(counterFile, 'utf8'))
    return `${date}.${count}`
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  base: './',
  define: {
    __BUILD_VERSION__: JSON.stringify(loadBuildVersion()),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'KinJournal',
        short_name: 'KinJournal',
        description: '筋トレを記録するアプリ',
        lang: 'ja',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#f3f4f6',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
