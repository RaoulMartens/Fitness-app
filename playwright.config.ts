import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' } },
  ],
  webServer: { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
})
