import { useState } from 'react'
import { wisAlles } from './db'
import type { Route } from './route'
import { PAUZE_DAGEN, PLATEAU_GRENS, RUSTDAGEN_TUSSEN_SESSIES } from './rules'

type Ga = (route: Route, opties?: { vervang?: boolean }) => void

/**
 * In v1 zijn de regels vast. Ze staan hier toch, als uitleg: waarom Vandaag op rustdag
 * staat, of waarom een oefening lager begint. Rijen zonder pijltje, want er valt nog
 * niets aan te veranderen; een rij die eruitziet als een knop en niets doet is erger
 * dan geen rij.
 *
 * Rust per set en stapgrootte horen bij een apparaat, niet bij de app. Die staan op het
 * scherm van de oefening zelf.
 */
export function Instellingen({ ga, onFout }: { ga: Ga; onFout: (melding: string) => void }) {
  const [vraagt, setVraagt] = useState(false)

  async function wissen() {
    try {
      await wisAlles()
      setVraagt(false)
      ga({ naam: 'vandaag' }, { vervang: true })
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Wissen lukte niet. Er is niets verwijderd.')
    }
  }

  return (
    <>
      <div className="bar">
        <button className="terug" onClick={() => ga({ naam: 'programma' })}>‹ Terug</button>
        <span className="title">Instellingen</span>
        <span />
      </div>
      <div className="body">
        <h2>Trainen</h2>
        <div className="list2">
          <div className="row"><span className="nm">Rust tussen sessies</span><span className="rv">minstens {RUSTDAGEN_TUSSEN_SESSIES} dagen</span></div>
          <div className="row"><span className="nm">Lager beginnen na</span><span className="rv">{PAUZE_DAGEN} dagen niet trainen</span></div>
          <div className="row"><span className="nm">Stilstand melden na</span><span className="rv">{PLATEAU_GRENS} keer hetzelfde gewicht</span></div>
        </div>

        <h2>Je gegevens</h2>
        <button className="link" onClick={() => setVraagt(true)}>Alles wissen</button>
      </div>

      {vraagt && (
        <div className="sheet-wrap" onClick={() => setVraagt(false)}>
          <div className="sheet" onClick={event => event.stopPropagation()}>
            <div className="grip" />
            <h1>Alles wissen?</h1>
            <p className="sub">
              Al je sessies, sets en gewichten verdwijnen, en de app begint opnieuw alsof je
              hem net hebt geïnstalleerd. Alles staat alleen op dit toestel, dus er is nergens
              een kopie. Dit kun je niet terugdraaien.
            </p>
            <button className="btn" onClick={wissen}>Alles wissen</button>
            <button className="link" onClick={() => setVraagt(false)}>Annuleren</button>
          </div>
        </div>
      )}
    </>
  )
}
