// Slot op de app. Het prototype blijft open zodat je dat kunt delen voor reviews;
// de app zelf en de video's zitten erachter.
//
// De middleware draait op elk pad. De uitzonderingen staan hieronder als exacte
// patronen, niet in de matcher: een matcher met `(?!proto)` sluit ook /prototype-x uit.

export const config = { matcher: '/:path*' }

const OPEN = [
  /^\/proto(?:\/|$)/,
  /^\/icon(?:-\d+)?\.(?:png|svg)$/,
  /^\/apple-touch-icon\.png$/,
  /^\/favicon\.ico$/,
]

/** Base64 naar tekst via bytes, zodat een wachtwoord met é of ü blijft werken. */
function decodeCredentials(value: string): string | null {
  try {
    const bytes = Uint8Array.from(atob(value), character => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

/** Vergelijkt in vaste tijd, zodat de duur van het antwoord niets over het wachtwoord zegt. */
function matches(given: string, expected: string): boolean {
  const a = new TextEncoder().encode(given)
  const b = new TextEncoder().encode(expected)
  let different = a.length ^ b.length
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    different |= (a[index] ?? 0) ^ (b[index] ?? 0)
  }
  return different === 0
}

const deny = (body: string, extra: Record<string, string> = {}) =>
  new Response(body, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Training", charset="UTF-8"',
      'cache-control': 'no-store',
      ...extra,
    },
  })

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  if (OPEN.some(pattern => pattern.test(pathname))) return

  const password = process.env.APP_PASSWORD
  if (!password) {
    // Buiten productie mag het slot ontbreken; in productie blijft het dicht,
    // zodat een vergeten instelling niet stilzwijgend alles openzet.
    if (process.env.VERCEL_ENV === 'production') {
      return deny('APP_PASSWORD ontbreekt. Zet die in Vercel en rol opnieuw uit.')
    }
    return
  }

  const header = request.headers.get('authorization') ?? ''
  const match = /^basic\s+(\S+)$/i.exec(header)
  if (match) {
    const decoded = decodeCredentials(match[1])
    // Alleen op de eerste dubbele punt splitsen: het wachtwoord mag er zelf ook een bevatten.
    const separator = decoded?.indexOf(':') ?? -1
    if (decoded && separator !== -1 && matches(decoded.slice(separator + 1), password)) return
  }

  return deny('Niet toegankelijk')
}
