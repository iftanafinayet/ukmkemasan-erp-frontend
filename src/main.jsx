import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './app/components/ui/ErrorBoundary'
import { FEATURES } from './app/config/environment'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary showDetails={FEATURES.SHOW_ERROR_DETAILS}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
