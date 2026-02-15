import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { initGeoLanguageDetection } from './i18n'
import App from './App'

function registerServiceWorker() {
  if (import.meta.env.DEV) return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const isSecureContext =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (!isSecureContext) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize geolocation-based language detection after app mounts
// This runs asynchronously so it doesn't block the initial render
initGeoLanguageDetection().catch(console.error)

registerServiceWorker()
