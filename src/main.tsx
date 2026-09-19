import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WorkoutApp } from './workout/WorkoutApp'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><WorkoutApp /></StrictMode>)
