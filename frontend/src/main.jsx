import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTrafficSource } from './lib/trafficSource'

// Initialize traffic source detection BEFORE React renders
// This captures fbclid/referrer before any SPA navigation
initTrafficSource();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
