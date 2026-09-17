import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.GITHUB_PAGES === '1' ? '/Fitness-app/' : '/'

export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'apple-touch-icon.png'],
    manifest: {
      name: 'Training — werkend wireframe',
      short_name: 'Training',
      description: 'Low-fidelity trainingsflow met lokale sessies, setregistratie en rust.',
      lang: 'nl',
      start_url: base,
      scope: base,
      display: 'standalone',
      background_color: '#f5f5f5',
      theme_color: '#e8e8e8',
      icons: [
        { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      globIgnores: ['m2-voorstel/**'],
      navigateFallback: `${base}index.html`,
      navigateFallbackDenylist: [/^\/ux-flows\//, /\/m2-voorstel(?:\/|$)/],
      cleanupOutdatedCaches: true,
    },
  })],
  test: { include: ['src/**/*.test.ts'], setupFiles: ['tests/setup.ts'] },
})
