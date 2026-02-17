import './setup'
import { useEffect } from 'react'

import { ConfigProvider } from 'antd'
import ReactDOM from 'react-dom/client'

import App from './App'
import { AnalyticsProvider } from './components/Analytics/AnalyticsContext'
import { analyticsAppId } from './config/analytics'
import { recaptchaKey } from './config/api'
import { AuthProvider } from './contexts/Auth/AuthProvider'
import { useAuth } from './contexts/Auth/useAuth'

declare global {
    interface Window {
        grecaptcha?: any
    }
}

function AppWrapper() {
    const { token, user, logOut } = useAuth()
    return <App token={token} user={user} logOut={logOut} />
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
        <ConfigProvider>
            <AnalyticsProvider appId={analyticsAppId}>
                <AuthProvider>
                    <AppWrapper />
                </AuthProvider>
            </AnalyticsProvider>
        </ConfigProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
