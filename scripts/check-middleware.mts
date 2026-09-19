import middleware from '../middleware.ts'

const b64 = (text: string) =>
  Buffer.from(new TextEncoder().encode(text)).toString('base64')

const call = (path: string, header?: string) =>
  middleware(new Request(`https://x.test${path}`, header ? { headers: { authorization: header } } : undefined))

const status = (result: Response | undefined) => (result ? result.status : 'door')

process.env.APP_PASSWORD = 'ge:heim-é'
const good = `Basic ${b64('raoul:ge:heim-é')}`

const cases: [string, unknown, unknown][] = [
  ['wachtwoord met dubbele punt en accent', status(call('/', good)), 'door'],
  ['schema in kleine letters', status(call('/', good.replace('Basic', 'basic'))), 'door'],
  ['wachtwoord met extra staart', status(call('/', `Basic ${b64('raoul:ge:heim-é:extra')}`)), 401],
  ['fout wachtwoord', status(call('/', `Basic ${b64('raoul:fout')}`)), 401],
  ['ongeldige base64', status(call('/', 'Basic !!niet-base64!!')), 401],
  ['geen header', status(call('/')), 401],
  ['prototype blijft open', status(call('/proto/index.html')), 'door'],
  ['prototype-private is dicht', status(call('/prototype-private')), 401],
  ['icoon blijft open', status(call('/icon-192.png')), 'door'],
]

let failed = 0
for (const [name, actual, expected] of cases) {
  const ok = actual === expected
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FOUT'}  ${name}: ${actual} (verwacht ${expected})`)
}

delete process.env.APP_PASSWORD
process.env.VERCEL_ENV = 'production'
const closed = status(call('/'))
console.log(`${closed === 401 ? 'ok  ' : 'FOUT'}  productie zonder wachtwoord blijft dicht: ${closed}`)
if (closed !== 401) failed++

process.exit(failed ? 1 : 0)
