import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { NerveProvider } from './state/NerveContext'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Nerve could not find its root element.')
}

createRoot(rootElement).render(
  <StrictMode>
    <NerveProvider>
      <App />
    </NerveProvider>
  </StrictMode>,
)
