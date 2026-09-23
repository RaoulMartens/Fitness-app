/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { createHandlerBoundToURL, cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { createPartialResponse } from 'workbox-range-requests'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<string | { url: string; revision: string | null }> }

const base = new URL(self.registration.scope).pathname

// Een video wordt vooraf volledig opgeslagen; een speler vraagt daarna vaak slechts een bytebereik op.
registerRoute(
  ({ url, request }) => url.origin === self.location.origin
    && url.pathname.startsWith(`${base}video/`)
    && url.pathname.endsWith('.mp4')
    && request.destination === 'video',
  async ({ request }) => {
    const cached = await matchPrecache(request.url)
    if (!cached) return fetch(request)
    return request.headers.has('range') ? createPartialResponse(request, cached) : cached
  },
)

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

registerRoute(new NavigationRoute(createHandlerBoundToURL(`${base}index.html`), {
  denylist: [/\/(?:ux-flows|proto)(?:\/|$)/],
}))

// De nieuwe worker neemt meteen de openstaande app over, net als voorheen.
self.skipWaiting()
clientsClaim()
