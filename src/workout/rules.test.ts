import { describe, expect, it } from 'vitest'
import {
  bereikGehaald, dagenTussen, isPauzeSessie, isVergeten, magTrainenOp, magVastleggen,
  naPauzeSessie, naPlateau, pauzeGewicht, plateauBereikt, stap, vandaagToestand, voorstel,
  type LoggedSet, type PlannedSlot,
} from './rules'

const slot: PlannedSlot = {
  exerciseId: 'chest-press', plannedSets: 2, repsMin: 8, repsMax: 12, step: 2.5, minWeight: 10,
}
const work = (weight: number, reps: number): LoggedSet => ({ kind: 'work', weight, reps })
const warmup = (weight: number, reps: number): LoggedSet => ({ kind: 'warmup', weight, reps })
const extra = (weight: number, reps: number): LoggedSet => ({ kind: 'extra', weight, reps })

describe('progressie', () => {
  it('gaat omhoog als elke werkset de bovenkant haalt', () => {
    expect(voorstel([work(35, 12), work(35, 12)], slot)).toMatchObject({ weight: 37.5, reason: 'boven-bereik' })
  })

  it('houdt vast als het bereik wel maar de bovenkant niet wordt gehaald', () => {
    expect(voorstel([work(35, 11), work(35, 10)], slot)).toMatchObject({ weight: 35, reason: 'vasthouden' })
  })

  it('gaat omlaag zodra één werkset onder het bereik valt', () => {
    expect(voorstel([work(35, 12), work(35, 7)], slot)).toMatchObject({ weight: 32.5, reason: 'onder-bereik' })
  })

  it('telt exact op de ondergrens als gehaald', () => {
    expect(voorstel([work(35, 8), work(35, 8)], slot)?.reason).toBe('vasthouden')
  })

  it('telt exact op de bovengrens als bovenkant', () => {
    expect(voorstel([work(35, 12), work(35, 12)], slot)?.reason).toBe('boven-bereik')
  })

  it('laat een onafgeronde oefening met rust', () => {
    expect(voorstel([work(35, 12)], slot)).toBeNull()
  })

  it('laat een oefening zonder werksets met rust', () => {
    expect(voorstel([warmup(20, 15)], slot)).toBeNull()
  })

  it('negeert de warming-up, ook als die onder het bereik ligt', () => {
    expect(voorstel([warmup(20, 4), work(35, 12), work(35, 12)], slot)?.reason).toBe('boven-bereik')
  })

  it('negeert een extra set die het beeld zou vertekenen', () => {
    expect(voorstel([work(35, 12), work(35, 12), extra(35, 3)], slot)?.reason).toBe('boven-bereik')
  })

  it('rekent vanaf de zwaarste werkset bij verschillende gewichten', () => {
    expect(voorstel([work(30, 12), work(35, 12)], slot)?.weight).toBe(37.5)
  })

  it('zakt nooit onder het laagste gewicht van het apparaat', () => {
    expect(voorstel([work(10, 5), work(10, 5)], slot)?.weight).toBe(10)
  })

  it('beoordeelt een ingekorte oefening op het ingekorte plan', () => {
    const ingekort = { ...slot, plannedSets: 1 }
    expect(voorstel([work(35, 12)], ingekort)?.reason).toBe('boven-bereik')
  })

  it('verhoogt de teller alleen bij vasthouden', () => {
    expect(voorstel([work(35, 11), work(35, 10)], slot)?.stalls(2)).toBe(3)
    expect(voorstel([work(35, 12), work(35, 12)], slot)?.stalls(2)).toBe(0)
    expect(voorstel([work(35, 12), work(35, 4)], slot)?.stalls(2)).toBe(0)
  })
})

describe('plateau', () => {
  it('verschijnt pas bij drie keer stilstaan', () => {
    expect(plateauBereikt(2)).toBe(false)
    expect(plateauBereikt(3)).toBe(true)
  })

  it('zet de teller op nul bij elke uitkomst', () => {
    for (const keuze of ['terug', 'vervangen', 'laten'] as const) {
      expect(naPlateau(keuze, 30, slot).stalls).toBe(0)
    }
  })

  it('gaat bij terugzetten twee stappen omlaag en onthoudt waarvandaan', () => {
    expect(naPlateau('terug', 30, slot)).toMatchObject({ weight: 25, deloadFrom: 30 })
  })

  it('zakt ook bij terugzetten niet onder het apparaat', () => {
    expect(naPlateau('terug', 12.5, slot).weight).toBe(10)
  })
})

describe('pauze', () => {
  it('slaat pas aan boven tien dagen', () => {
    expect(isPauzeSessie('2026-09-01', '2026-09-11')).toBe(false)
    expect(isPauzeSessie('2026-09-01', '2026-09-12')).toBe(true)
  })

  it('geldt niet zonder historie', () => {
    expect(isPauzeSessie(null, '2026-09-12')).toBe(false)
  })

  it('verlaagt één stap en bewaart het oude gewicht', () => {
    expect(pauzeGewicht(37.5, slot)).toEqual({ weight: 35, preBreakWeight: 37.5 })
  })

  it('zet terug naar het oude gewicht zodra je je bereik haalt', () => {
    expect(naPauzeSessie([work(35, 10), work(35, 9)], slot, 37.5))
      .toMatchObject({ weight: 37.5, preBreakWeight: null, hersteld: true })
  })

  it('houdt het verlaagde gewicht als het bereik niet gehaald wordt', () => {
    expect(naPauzeSessie([work(35, 6), work(35, 5)], slot, 37.5))
      .toMatchObject({ weight: 35, preBreakWeight: null })
  })

  it('houdt het oude gewicht vast voor een overgeslagen oefening', () => {
    expect(naPauzeSessie([], slot, 37.5)).toMatchObject({ weight: 37.5, preBreakWeight: 37.5 })
  })

  it('verlaagt niet twee keer: zonder gewicht valt er niets te verlagen', () => {
    expect(pauzeGewicht(null, slot)).toEqual({ weight: null, preBreakWeight: null })
  })
})

describe('kalender', () => {
  it('telt hele dagen, ook over een maandgrens', () => {
    expect(dagenTussen('2026-09-28', '2026-10-02')).toBe(4)
  })

  it('houdt twee volledige rustdagen aan', () => {
    expect(magTrainenOp('2026-09-18', '2026-09-20')).toBe(false)
    expect(magTrainenOp('2026-09-18', '2026-09-21')).toBe(true)
  })

  it('laat trainen zonder historie altijd toe', () => {
    expect(magTrainenOp(null, '2026-09-18')).toBe(true)
  })
})

describe('vergeten sessie', () => {
  const uur = 3_600_000

  it('is niet vergeten op dezelfde dag', () => {
    expect(isVergeten({ sessieDag: '2026-09-18', laatsteActiviteit: 0, nu: 99 * uur, vandaag: '2026-09-18' })).toBe(false)
  })

  it('spaart de sessie die net over middernacht doorloopt', () => {
    const start = Date.parse('2026-09-18T23:50:00')
    expect(isVergeten({ sessieDag: '2026-09-18', laatsteActiviteit: start, nu: start + uur, vandaag: '2026-09-19' })).toBe(false)
  })

  it('sluit de sessie van gisteravond de volgende ochtend', () => {
    const start = Date.parse('2026-09-18T21:00:00')
    expect(isVergeten({ sessieDag: '2026-09-18', laatsteActiviteit: start, nu: start + 12 * uur, vandaag: '2026-09-19' })).toBe(true)
  })
})

describe('schermvoorrang op Vandaag', () => {
  const basis = { nu: Date.parse('2026-09-19T09:00:00'), vandaag: '2026-09-19', laatsteSessieDag: '2026-09-18' }

  it('zet een open sessie van vandaag op hervatten', () => {
    expect(vandaagToestand({ ...basis, isTrainingsdag: true, openSessie: { sessieDag: '2026-09-19', laatsteActiviteit: basis.nu } })).toBe('hervatten')
  })

  it('zet een oude open sessie op vergeten, ook op een rustdag', () => {
    expect(vandaagToestand({ ...basis, isTrainingsdag: false, openSessie: { sessieDag: '2026-09-18', laatsteActiviteit: Date.parse('2026-09-18T21:00:00') } })).toBe('vergeten')
  })

  it('laat een lange pauze voorgaan op een gewone trainingsdag', () => {
    expect(vandaagToestand({ ...basis, laatsteSessieDag: '2026-09-01', isTrainingsdag: true, openSessie: null })).toBe('terug')
  })

  it('valt terug op rustdag als er niets te doen is', () => {
    expect(vandaagToestand({ ...basis, isTrainingsdag: false, openSessie: null })).toBe('rustdag')
  })
})

describe('invoer', () => {
  it('weigert lege, nul en gebroken herhalingen', () => {
    expect(magVastleggen(35, null)).toBe(false)
    expect(magVastleggen(35, 0)).toBe(false)
    expect(magVastleggen(35, 8.5)).toBe(false)
    expect(magVastleggen(null, 8)).toBe(false)
  })

  it('accepteert een gewicht met een decimaal', () => {
    expect(magVastleggen(37.5, 8)).toBe(true)
  })

  it('gebruikt de stapgrootte van het apparaat', () => {
    expect(stap(80, 1, 'leg-press')).toBe(85)
    expect(stap(35, 1, 'chest-press')).toBe(37.5)
  })

  it('gaat met de stapper niet onder het apparaat', () => {
    expect(stap(10, -1, 'chest-press')).toBe(10)
  })
})
