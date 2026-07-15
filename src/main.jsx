import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async' // 🎯 Step 1: Import the provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider> {/* 🎯 Step 2: Wrap your App */}
      <App />
    </HelmetProvider>
  </StrictMode>,
)