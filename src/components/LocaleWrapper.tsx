import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useHistory, useParams } from 'react-router-dom'

const SUPPORTED_LOCALES = [
  'pt',
  'en',
  'es'
]

interface LocaleWrapperProps {
  children: React.ReactNode
}

export function LocaleWrapper({ children }: LocaleWrapperProps) {
  const { locale } = useParams<{ locale: string }>()
  const history = useHistory()

  const { i18n } = useTranslation()

  useEffect(() => {
    if (SUPPORTED_LOCALES.includes(locale)) {
      void i18n.changeLanguage(locale)
    } else {
      history.replace('/pt')
    }
  }, [locale])

  return children
}
