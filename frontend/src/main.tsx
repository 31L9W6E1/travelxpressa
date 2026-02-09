import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { initGeoLanguageDetection } from './i18n'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize geolocation-based language detection after app mounts
// This runs asynchronously so it doesn't block the initial render
initGeoLanguageDetection().catch(console.error)
