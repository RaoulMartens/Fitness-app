import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.GITHUB_PAGES === '1' ? '/Fitness-app/' : '/'

export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    // De app vernieuwt zichzelf. Met 'prompt' bleef een oude service worker de
    // vorige build serveren zolang niemand op een bijwerkknop drukte, en die
    // knop bestaat niet meer.
    registerType: 'autoUpdate',
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
      // Kleur bij het opstarten, voordat WorkoutApp hem per scherm zet. De app opent op Vandaag.
      theme_color: '#f5f5f5',
      icons: [
        { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,woff2,mp4}'],
      globIgnores: ['proto/**'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
  })],
  test: { include: ['src/**/*.test.ts'], setupFiles: ['tests/setup.ts'] },
})
