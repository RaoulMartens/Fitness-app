import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { WorkoutApp } from './workout/WorkoutApp'
import './styles.css'

const legacy = new URLSearchParams(location.search).get('m1') === '1'
createRoot(document.getElementById('root')!).render(<StrictMode>{legacy ? <App /> : <WorkoutApp />}</StrictMode>)
