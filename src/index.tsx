import './setup'
import { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

declare global {
  interface Window {
    grecaptcha?: any
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string

function Root() {
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Root />
)
