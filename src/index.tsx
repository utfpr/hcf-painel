import './setup'
import './i18n'
import { useEffect } from 'react'

import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { AnalyticsProvider } from './components/Analytics/AnalyticsContext'
import { analyticsAppId } from './config/analytics'
import { recaptchaKey } from './config/api'
import { AuthProvider } from './contexts/Auth/AuthProvider'
import { ContainerProvider } from './contexts/Container/ContainerProvider'
import { router } from './router'

declare global {
  interface Window {
    grecaptcha?: unknown
  }
}

function Root() {
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaKey as string
      }`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  return (
    <ContainerProvider baseUrl={import.meta.env.VITE_API_URL}>
      <AnalyticsProvider appId={analyticsAppId}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AnalyticsProvider>
    </ContainerProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
