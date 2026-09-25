import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'

import './styles/tokens.css'
import './styles/machine.css'
import './styles/crt.css'

if (import.meta.env.DEV) {
  void import('./dev/devBridge').then((module) => module.installDevBridge())
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('FORM//LAB: root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
