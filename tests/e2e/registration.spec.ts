import { test, expect, chromium, webkit } from '@playwright/test'
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

const temporaryProfiles: string[] = []
test.afterAll(async () => {
  const root = await realpath(tmpdir())
  for (const profile of temporaryProfiles) {
    const target = await realpath(profile)
    if (dirname(target) !== root || !basename(target).startsWith('fitness-m1-')) throw new Error('Onverwacht testprofielpad; niet verwijderd.')
    await rm(target, { recursive: true, maxRetries: 3, retryDelay: 300 })
  }
})

test('concept, sheet, dubbel tikken, correctie, offline en een nieuwe sessie', async ({ page, context }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Set 1', exact: true })).toBeVisible()
  await expect(page.getByText('Testgegevens · nog geen persoonlijk trainingsschema')).toBeVisible()
  const weight = page.getByRole('textbox', { name: 'Gewicht kg' })
  await weight.fill('12,')
  await page.getByRole('textbox', { name: 'Herhalingen reps' }).fill('11')
  await expect(page.getByRole('status')).toHaveText('Concept op apparaat opgeslagen')
  await page.reload()
  await expect(weight).toHaveValue('12,')
  await expect(page.getByRole('textbox', { name: 'Herhalingen reps' })).toHaveValue('11')
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Vul een gewicht')
  await weight.fill('12,5')
  await expect(page.getByRole('status')).toHaveText('Concept op apparaat opgeslagen')
  await page.getByRole('button', { name: 'Oefenuitleg bekijken' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Terug naar de set' }).click()
  await expect(weight).toHaveValue('12,5')
  await page.getByRole('button', { name: 'Naar Vandaag' }).click()
  await page.getByRole('button', { name: 'Verder trainen' }).click()
  await expect(weight).toHaveValue('12,5')
  // Two events before the first transaction completes must share the same set identity.
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).evaluate(button => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await expect(page.getByRole('heading', { name: 'Set 1 vastgelegd' })).toBeVisible()
  await expect(page.getByRole('cell', { name: '12,5 × 11', exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: 'Set 1 aanpassen' }).click()
  await weight.fill('13')
  await page.getByRole('button', { name: 'Wijziging vastleggen' }).click()
  await expect(page.getByRole('cell', { name: '13 × 11', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Volgende set' }).click()
  await expect(page.getByRole('heading', { name: 'Set 2', exact: true })).toBeVisible()
  await expect(page.getByText('App offline beschikbaar', { exact: true })).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('cell', { name: '13 × 11', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Set 2', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
  await page.getByRole('button', { name: 'Volgende set' }).click()
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
  await page.getByRole('button', { name: 'Testsessie afronden' }).click()
  await expect(page.getByRole('heading', { name: 'Testsessie afgerond' })).toBeVisible()
  await page.getByRole('button', { name: 'Nieuwe testsessie' }).click()
  await expect(page.getByRole('heading', { name: 'Set 1', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Naar Vandaag' }).click()
  await page.getByRole('button', { name: /Bekijk sets/ }).click()
  await expect(page.getByText('Set 1: 13 kg × 11 reps', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Verder trainen' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true })
  await context.setOffline(false)
  expect(errors).toEqual([])
})

test('opslagfout toont geen succes en een nieuwe poging werkt', async ({ page }) => {
  await page.goto('/')
  const weight = page.getByRole('textbox', { name: 'Gewicht kg' })
  await expect(weight).toBeVisible()
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put
    let fail = true
    IDBObjectStore.prototype.put = function (...args) {
      if (fail && this.name === 'drafts') { fail = false; throw new DOMException('Test quota failure', 'QuotaExceededError') }
      return original.apply(this, args)
    }
  })
  await weight.fill('14')
  await expect(page.getByRole('alert')).toContainText('opslag is vol')
  await expect(page.getByRole('status')).toHaveText('Invoer niet opgeslagen')
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Set 1 vastgelegd' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('cell', { name: '14 × 10', exact: true })).toBeVisible()
})

test('twee vensters overschrijven bevestigde sets niet stilzwijgend', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.getByRole('textbox', { name: 'Gewicht kg' })).toBeVisible()
  const second = await context.newPage()
  await second.goto('/')
  await expect(second.getByRole('textbox', { name: 'Gewicht kg' })).toBeVisible()
  await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Set 1 vastgelegd' })).toBeVisible()
  await expect(second.getByRole('button', { name: 'Set 1 aanpassen' })).toBeVisible()
  await second.getByRole('button', { name: 'Set 1 aanpassen' }).click()
  await second.getByRole('textbox', { name: 'Gewicht kg' }).fill('14')
  await expect(second.getByRole('status')).toHaveText('Concept op apparaat opgeslagen')
  await page.getByRole('button', { name: 'Set 1 aanpassen' }).click()
  await page.getByRole('textbox', { name: 'Gewicht kg' }).fill('15')
  await page.getByRole('button', { name: 'Wijziging vastleggen' }).click()
  await second.getByRole('button', { name: 'Wijziging vastleggen' }).click()
  await expect(second.getByRole('alert')).toContainText('ander venster')
  await expect(second.getByRole('textbox', { name: 'Gewicht kg' })).toHaveValue('14')
  await expect(second.getByRole('cell', { name: '15 × 10', exact: true })).toBeVisible()
})

test('hele browser sluiten bewaart bevestigde set en concept, ook bij offline heropenen', async ({ browserName }, testInfo) => {
  const browserType = browserName === 'webkit' ? webkit : chromium
  // Keep Chromium's nested cache paths below Windows path-length limits.
  const profile = await mkdtemp(join(tmpdir(), 'fitness-m1-'))
  temporaryProfiles.push(profile)
  const options = { headless: true, viewport: { width: 375, height: 812 } }
  const first = await browserType.launchPersistentContext(profile, options)
  const diagnostics: string[] = []
  try {
    const page = await first.newPage()
    page.on('console', message => { if (message.type() === 'error') diagnostics.push(message.text()) })
    page.on('pageerror', error => diagnostics.push(error.message))
    await page.goto('http://127.0.0.1:4173')
    await page.getByRole('button', { name: 'Set vastleggen', exact: true }).click()
    await page.getByRole('button', { name: 'Volgende set' }).click()
    await page.getByRole('textbox', { name: 'Gewicht kg' }).fill('16,')
    await expect(page.getByRole('status')).toHaveText('Concept op apparaat opgeslagen')
    await expect(page.getByText('App offline beschikbaar', { exact: true })).toBeVisible()
  } finally {
    if (diagnostics.length) await testInfo.attach('browser-diagnostics', { body: diagnostics.join('\n'), contentType: 'text/plain' })
    await first.close()
  }
  const second = await browserType.launchPersistentContext(profile, options)
  try {
    await second.setOffline(true)
    const page = await second.newPage()
    await page.goto('http://127.0.0.1:4173')
    await expect(page.getByRole('textbox', { name: 'Gewicht kg' })).toHaveValue('16,')
    const firstRow = page.getByRole('row').filter({ has: page.getByRole('rowheader', { name: '1', exact: true }) })
    await expect(firstRow.getByRole('cell', { name: '12 × 10', exact: true })).toHaveCount(2)
  } finally { await second.close() }
})
