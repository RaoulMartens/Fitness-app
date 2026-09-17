import { webkit, expect } from '@playwright/test'
import { createServer } from 'node:http'
import { mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'

const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname
  try {
    const file = resolve('dist', '.' + (path === '/' ? '/index.html' : path))
    if (!file.startsWith(resolve('dist') + sep)) { response.writeHead(403).end(); return }
    const data = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(data)
  } catch { response.writeHead(404).end() }
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const address = server.address()
const url = `http://127.0.0.1:${address.port}/`
const profile = await mkdtemp(join(tmpdir(), 'fitness-webkit-offline-'))
let context = await webkit.launchPersistentContext(profile)
try {
  let page = await context.newPage()
  await page.goto(url)
  await expect(page.getByText('App offline beschikbaar', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Start training', exact: true }).click()
  await page.getByRole('button', { name: 'Naar oefening 1' }).click()
  await page.getByRole('textbox', { name: 'Gewicht (kg)' }).fill('18,')
  await expect(page.getByRole('status')).toHaveText('Concept op apparaat opgeslagen')
  await page.getByRole('button', { name: 'Lukt niet', exact: true }).click()
  await page.getByRole('button', { name: 'Bezet', exact: true }).click()
  await page.getByRole('button', { name: 'Later doen', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Leg curl', exact: true })).toBeVisible()
  // Shut down the origin itself: WebKit's simulated offline mode fails before SW navigation here.
  server.closeAllConnections()
  await new Promise(done => server.close(done))
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Leg curl', exact: true })).toBeVisible()
  console.log('SERVER_OFFLINE_RELOAD_OK')
  await context.close()
  context = await webkit.launchPersistentContext(profile)
  page = await context.newPage()
  await page.goto(url)
  await page.getByRole('button', { name: 'Verder trainen', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Verder trainen', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Leg curl', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Aanpassing terugdraaien' }).click()
  await page.getByRole('button', { name: 'Terugdraaien', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Leg press', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Gewicht (kg)' })).toHaveValue('18,')
  console.log('SERVER_OFFLINE_BROWSER_RESTART_M3_UNDO_DRAFT_OK')
} finally {
  await context.close(); server.closeAllConnections(); server.close()
  const target = await realpath(profile)
  if (dirname(target) !== await realpath(tmpdir()) || !basename(target).startsWith('fitness-webkit-offline-')) throw new Error('Onverwachte testmap')
  await rm(target, { recursive: true, maxRetries: 3, retryDelay: 300 })
}
