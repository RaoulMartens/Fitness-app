/**
 * Back-up naar een bestand en weer terug.
 *
 * Alles staat alleen op dit toestel, en een app op het iOS-startscherm heeft zijn eigen
 * opslag die meegaat als je het icoon verwijdert. Dit is de enige kopie die daar buiten
 * kan bestaan.
 *
 * Terugzetten vervangt alles en voegt niets samen. Twee geschiedenissen door elkaar
 * geven elk hun eigen voorstel voor dezelfde oefening, en dan is er geen goed gewicht
 * voor de volgende keer.
 */
import { markeerBackup, openWorkspace, workoutDb, type WorkoutDatabase } from './db'
import type { SessionOutcome } from './model'

const APP = 'fitness-app-training'

export interface Backup {
  app: typeof APP
  /** De Dexie-versie waarmee de back-up is gemaakt. */
  versie: number
  gemaaktOp: string
  tabellen: Record<string, unknown[]>
}

/** Alle tabellen, zoals ze nu zijn, in één transactie zodat de kopie klopt met zichzelf. */
export async function maakBackup(database: WorkoutDatabase = workoutDb, nu = new Date()): Promise<Backup> {
  return database.transaction('r', database.tables, async () => {
    const tabellen: Record<string, unknown[]> = {}
    for (const table of database.tables) tabellen[table.name] = await table.toArray()
    return { app: APP, versie: database.verno, gemaaktOp: nu.toISOString(), tabellen }
  })
}

/**
 * Een bestand lezen en controleren voordat er iets gewist wordt. Elke fout hier is een
 * melding voor jou, geen halve terugzetting: er is dan nog niets aangeraakt.
 */
export function leesBackup(tekst: string, database: WorkoutDatabase = workoutDb): Backup {
  let data: unknown
  try { data = JSON.parse(tekst) }
  catch { throw new Error('Dit bestand is geen back-up: het is niet te lezen.') }

  const backup = data as Partial<Backup>
  if (!backup || backup.app !== APP) throw new Error('Dit bestand is geen back-up van deze app.')
  if (typeof backup.versie !== 'number' || typeof backup.gemaaktOp !== 'string' || !backup.tabellen) {
    throw new Error('Deze back-up is onvolledig.')
  }
  if (backup.versie > database.verno) {
    throw new Error('Deze back-up is gemaakt met een nieuwere versie van de app. Ververs de app en probeer het opnieuw.')
  }
  const bekend = new Set(database.tables.map(table => table.name))
  for (const [naam, rijen] of Object.entries(backup.tabellen)) {
    if (!bekend.has(naam) || !Array.isArray(rijen)) throw new Error('Deze back-up bevat onderdelen die de app niet kent.')
  }
  return backup as Backup
}

/** Hoeveel afgeronde sessies erin staan, voor de bevestiging. */
export const sessiesIn = (backup: Backup) => (backup.tabellen.outcomes as SessionOutcome[] | undefined)?.length ?? 0

/**
 * Alles vervangen door de back-up, in één transactie: lukt één tabel niet, dan blijft
 * alles zoals het was. Daarna een werkruimte als die in de back-up ontbrak.
 *
 * De datum van de laatste back-up wordt die van dit bestand. De werkruimte in de back-up
 * is van vóór hij bewaard werd en zegt dus 'nog nooit', terwijl je gegevens nu precies
 * deze back-up zijn.
 */
export async function zetBackupTerug(backup: Backup, database: WorkoutDatabase = workoutDb) {
  await database.transaction('rw', database.tables, async () => {
    for (const table of database.tables) {
      await table.clear()
      const rijen = backup.tabellen[table.name]
      if (rijen?.length) await table.bulkPut(rijen)
    }
  })
  await openWorkspace(database)
  await markeerBackup(backup.gemaaktOp, database)
}

/**
 * De back-up bij je laten landen. Op een iPhone via het deelmenu: bewaren in Bestanden,
 * AirDrop, of mailen naar jezelf. Waar dat niet kan, als gewone download.
 * Geeft false als je het deelmenu zonder keuze sluit.
 */
export async function bewaarBackup(backup: Backup): Promise<boolean> {
  const naam = `training-backup-${backup.gemaaktOp.slice(0, 10)}.json`
  const bestand = new File([JSON.stringify(backup)], naam, { type: 'application/json' })
  if (navigator.canShare?.({ files: [bestand] })) {
    try {
      await navigator.share({ files: [bestand], title: 'Training back-up' })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false
      throw error
    }
  }
  const url = URL.createObjectURL(bestand)
  const link = Object.assign(document.createElement('a'), { href: url, download: naam })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
