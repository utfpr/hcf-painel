import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',

    supportedLngs: [
      'pt',
      'en',
      'es'
    ],

    detection: {
      order: [
        'path',
        'localStorage',
        'navigator'
      ]
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },

    ns: [
      'common',
      'forms',
      'navigation',
      'ui',
      'validation',
      'placeholder',
      'taxonomy',
      'erroMessage',
      'geolocation'
    ],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false
    }
  })

export default i18n
