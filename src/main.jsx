import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ToastmastersVpeAgendaEngine from './ToastmastersVpeAgendaEngine'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastmastersVpeAgendaEngine />
  </StrictMode>,
)
