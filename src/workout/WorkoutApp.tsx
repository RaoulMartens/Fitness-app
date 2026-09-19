import { useLiveQuery } from 'dexie-react-hooks'
import { workoutDb } from './db'
import { exercises } from './exercises'

/**
 * Tijdelijk scherm tijdens de herbouw. De oude M3a-schermen zijn verwijderd;
 * de nieuwe komen in stap 3 van bouwdocument-v1.md. De opslaglaag eronder werkt.
 */
export function WorkoutApp() {
  const counts = useLiveQuery(async () => ({
    sessions: await workoutDb.sessions.count(),
    sets: await workoutDb.sets.count(),
  }), [])

  return (
    <main className="app">
      <h1>Training</h1>
      <p>De schermen worden opnieuw gebouwd. De opslag werkt.</p>
      <p className="note">
        {counts ? `${counts.sessions} sessies, ${counts.sets} sets in de database.` : 'Bezig met lezen…'}
      </p>
      <p className="note">{exercises.length} oefeningen in de catalogus.</p>
    </main>
  )
}
