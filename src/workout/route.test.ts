import { describe, expect, it } from 'vitest'
import { leesRoute, schrijfRoute, tabVan, type Route } from './route'

const alle: Route[] = [
  { naam: 'vandaag' },
  { naam: 'sessie' },
  { naam: 'klaar', sessionId: 'abc-123' },
  { naam: 'programma' },
  { naam: 'oefeningen' },
  { naam: 'oefening', exerciseId: 'leg-press', van: 'programma' },
  { naam: 'oefening', exerciseId: 'hammer-curl', van: 'voortgang' },
  { naam: 'voortgang' },
  { naam: 'historie', sessionId: 'abc-123' },
  { naam: 'instellingen' },
]

describe('routes', () => {
  it('komt elke route ongeschonden terug uit de hash', () => {
    for (const route of alle) expect(leesRoute(schrijfRoute(route))).toEqual(route)
  })
  it('valt bij een onbekende of lege hash terug op Vandaag', () => {
    expect(leesRoute('')).toEqual({ naam: 'vandaag' })
    expect(leesRoute('#/bestaat-niet')).toEqual({ naam: 'vandaag' })
    expect(leesRoute('#/klaar')).toEqual({ naam: 'vandaag' })
  })
  it('houdt bij een oefening de tab vast waar je vandaan kwam', () => {
    expect(tabVan({ naam: 'oefening', exerciseId: 'row', van: 'voortgang' })).toBe('voortgang')
    expect(tabVan({ naam: 'oefening', exerciseId: 'row', van: 'programma' })).toBe('programma')
    expect(tabVan({ naam: 'instellingen' })).toBe('programma')
  })
})
