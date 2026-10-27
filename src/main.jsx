import React from 'react'
import ReactDOM from 'react-dom/client'
// Fonts are self-hosted (no third-party request, no render-blocking CSS).
// Only the latin subset is actually downloaded thanks to unicode-range.
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import 'lenis/dist/lenis.css'
import App from './App.jsx'
import './index.css'
import { detectTier } from './lib/quality.js'
import { initScroll } from './lib/scroll.js'

// Publish the device tier on <html> so CSS can drop expensive effects
// (backdrop blur, film grain) on low-end hardware.
document.documentElement.dataset.q = String(detectTier())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Start the shared scroll/animation loop once the first paint is committed.
requestAnimationFrame(() => initScroll())
