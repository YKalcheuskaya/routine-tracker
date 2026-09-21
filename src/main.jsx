/**
 * Browser entry point. It mounts the React application in the single root element
 * and enables StrictMode so development builds surface unsafe React behavior early.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
