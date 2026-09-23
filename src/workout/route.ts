/**
 * Waar je bent in de app, als hash in de adresbalk. Dan werken de terugknop van de
 * browser en de veegbeweging op iOS zonder extra code, en overleeft een scherm als
 * Klaar het verversen van de pagina. De service worker ziet de hash niet, dus elke
 * route laadt offline dezelfde index.html.
 */
import { useEffect, useState } from 'react'

export type Tab = 'vandaag' | 'programma' | 'voortgang'

export type Route =
  | { naam: 'vandaag' }
  | { naam: 'sessie' }
  | { naam: 'klaar'; sessionId: string }
  | { naam: 'programma' }
  | { naam: 'oefeningen' }
  /**
   * Een oefening is te bereiken vanuit Programma en vanuit Voortgang; `van` houdt de tab
   * vast. Op oefening-id en niet op slot: Voortgang toont ook oefeningen met historie die
   * niet in het schema staan, zoals een oefening die je ooit achteraan toevoegde.
   */
  | { naam: 'oefening'; exerciseId: string; van: 'programma' | 'voortgang' }
  | { naam: 'voortgang' }
  | { naam: 'historie'; sessionId: string }
  | { naam: 'instellingen' }

export function leesRoute(hash: string): Route {
  const delen = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [eerste, tweede, derde] = delen
  if (eerste === 'sessie') return { naam: 'sessie' }
  if (eerste === 'klaar' && tweede) return { naam: 'klaar', sessionId: tweede }
  if (eerste === 'programma' && tweede === 'oefeningen') return { naam: 'oefeningen' }
  if ((eerste === 'programma' || eerste === 'voortgang') && tweede === 'oefening' && derde) {
    return { naam: 'oefening', exerciseId: derde, van: eerste }
  }
  if (eerste === 'programma') return { naam: 'programma' }
  if (eerste === 'voortgang' && tweede === 'sessie' && derde) return { naam: 'historie', sessionId: derde }
  if (eerste === 'voortgang') return { naam: 'voortgang' }
  if (eerste === 'instellingen') return { naam: 'instellingen' }
  return { naam: 'vandaag' }
}

export function schrijfRoute(route: Route): string {
  const deel = encodeURIComponent
  switch (route.naam) {
    case 'vandaag': return '#/'
    case 'sessie': return '#/sessie'
    case 'klaar': return `#/klaar/${deel(route.sessionId)}`
    case 'programma': return '#/programma'
    case 'oefeningen': return '#/programma/oefeningen'
    case 'oefening': return `#/${route.van}/oefening/${deel(route.exerciseId)}`
    case 'voortgang': return '#/voortgang'
    case 'historie': return `#/voortgang/sessie/${deel(route.sessionId)}`
    case 'instellingen': return '#/instellingen'
  }
}

/** Bij welke tab een scherm hoort. Tijdens een sessie is er geen tabbalk. */
export function tabVan(route: Route): Tab {
  switch (route.naam) {
    case 'programma': case 'oefeningen': case 'instellingen': return 'programma'
    case 'oefening': return route.van
    case 'voortgang': case 'historie': return 'voortgang'
    default: return 'vandaag'
  }
}

/**
 * De huidige route plus een functie om te navigeren. `vervang` overschrijft de huidige
 * stap in de geschiedenis in plaats van er een toe te voegen: na het afronden van een
 * sessie hoort terug niet naar die afgeronde sessie te gaan.
 */
export function useRoute(): [Route, (route: Route, opties?: { vervang?: boolean }) => void] {
  const [route, setRoute] = useState(() => leesRoute(location.hash))
  useEffect(() => {
    const bij = () => setRoute(leesRoute(location.hash))
    window.addEventListener('hashchange', bij)
    return () => window.removeEventListener('hashchange', bij)
  }, [])
  function ga(naar: Route, opties?: { vervang?: boolean }) {
    const hash = schrijfRoute(naar)
    if (opties?.vervang) {
      history.replaceState(null, '', hash)
      setRoute(naar)
    } else if (location.hash !== hash) {
      location.hash = hash
    }
    window.scrollTo(0, 0)
  }
  return [route, ga]
}
