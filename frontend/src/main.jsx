import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App.jsx'
import './index.css'
import './styles/globals.css'
import { registerServiceWorker } from './registerSW'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Enregistrer le Service Worker pour la PWA
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
)
