import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { WorkoutApp } from './workout/WorkoutApp'
import './styles.css'

// Draait de app offline, en haalt een nieuwe versie binnen zonder dat je er
// iets voor hoeft aan te klikken. De sets staan in IndexedDB, niet in de
// cache van de service worker, dus een verversing raakt je invoer niet.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(<StrictMode><WorkoutApp /></StrictMode>)
