import { useRef, useState } from 'react'
import { bewaarBackup, leesBackup, maakBackup, sessiesIn, zetBackupTerug, type Backup } from './backup'
import { markeerBackup, wisAlles } from './db'
import type { Route } from './route'
import { PAUZE_DAGEN, PLATEAU_GRENS, RUSTDAGEN_TUSSEN_SESSIES } from './rules'

type Ga = (route: Route, opties?: { vervang?: boolean }) => void

const datum = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })

/**
 * In v1 zijn de regels vast. Ze staan hier toch, als uitleg: waarom Vandaag op rustdag
 * staat, of waarom een oefening lager begint. Rijen zonder pijltje, want er valt nog
 * niets aan te veranderen; een rij die eruitziet als een knop en niets doet is erger
 * dan geen rij.
 *
 * Rust per set en stapgrootte horen bij een apparaat, niet bij de app. Die staan op het
 * scherm van de oefening zelf.
 */
export function Instellingen({ ga, onFout, laatsteBackup }: {
  ga: Ga
  onFout: (melding: string) => void
  laatsteBackup?: string
}) {
  const [vraagt, setVraagt] = useState<'wissen' | null>(null)
  const [terug, setTerug] = useState<Backup | null>(null)
  const kiezer = useRef<HTMLInputElement>(null)

  async function maak() {
    try {
      const backup = await maakBackup()
      if (await bewaarBackup(backup)) await markeerBackup(backup.gemaaktOp)
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'De back-up is niet gemaakt.')
    }
  }

  async function gekozen(event: React.ChangeEvent<HTMLInputElement>) {
    const bestand = event.target.files?.[0]
    // Leegmaken, zodat hetzelfde bestand nog eens kiezen ook weer iets doet.
    event.target.value = ''
    if (!bestand) return
    try { setTerug(leesBackup(await bestand.text())) }
    catch (error) { onFout(error instanceof Error ? error.message : 'Dit bestand kon niet gelezen worden.') }
  }

  async function terugzetten() {
    if (!terug) return
    try {
      await zetBackupTerug(terug)
      setTerug(null)
      ga({ naam: 'vandaag' }, { vervang: true })
    } catch (error) {
      setTerug(null)
      onFout(error instanceof Error ? error.message : 'Terugzetten lukte niet. Er is niets veranderd.')
    }
  }

  async function wissen() {
    try {
      await wisAlles()
      setVraagt(null)
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
        <p className="sub">
          {laatsteBackup ? `Laatste back-up: ${datum(laatsteBackup)}.` : 'Nog geen back-up gemaakt.'}
          {' '}Alles staat alleen op deze telefoon, en gaat mee weg als je de app van je startscherm haalt.
        </p>
        <div>
          <button className="link" onClick={maak}>Back-up maken</button>
          <button className="link" onClick={() => kiezer.current?.click()}>Back-up terugzetten</button>
          <button className="link" onClick={() => setVraagt('wissen')}>Alles wissen</button>
        </div>
        <input ref={kiezer} type="file" accept=".json,application/json" hidden onChange={gekozen} />
      </div>

      {terug && (
        <div className="sheet-wrap" onClick={() => setTerug(null)}>
          <div className="sheet" onClick={event => event.stopPropagation()}>
            <div className="grip" />
            <h1>Back-up terugzetten?</h1>
            <p className="sub">
              Back-up van {datum(terug.gemaaktOp)}, met {sessiesIn(terug)} {sessiesIn(terug) === 1 ? 'sessie' : 'sessies'}.
              Wat er nu op je telefoon staat wordt vervangen. Dit kun je niet terugdraaien.
            </p>
            <button className="btn" onClick={terugzetten}>Terugzetten</button>
            <button className="link" onClick={() => setTerug(null)}>Annuleren</button>
          </div>
        </div>
      )}

      {vraagt === 'wissen' && (
        <div className="sheet-wrap" onClick={() => setVraagt(null)}>
          <div className="sheet" onClick={event => event.stopPropagation()}>
            <div className="grip" />
            <h1>Alles wissen?</h1>
            <p className="sub">
              Al je sessies, sets en gewichten verdwijnen, en de app begint opnieuw alsof je
              hem net hebt geïnstalleerd. Heb je geen back-up, dan is er nergens een kopie.
              Dit kun je niet terugdraaien.
            </p>
            <button className="btn" onClick={wissen}>Alles wissen</button>
            <button className="link" onClick={() => setVraagt(null)}>Annuleren</button>
          </div>
        </div>
      )}
    </>
  )
}
