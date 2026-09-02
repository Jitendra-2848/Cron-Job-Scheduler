import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "../index.css"
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} toastOptions={{ duration: 4000 }} />
    <App />
  </StrictMode>,
)
