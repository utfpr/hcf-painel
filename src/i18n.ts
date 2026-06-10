import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-br',

    supportedLngs: [
      'pt-br',
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
      'simpleTableComponent',
      'totalRecordsFound',
      'selectedFormField',
      'loginLayout',
      'mainLayout',
      'fundo',
      'recuperacaoSenha',
      'listaTaxonomiaReino',
      'listaTaxonomiaFamilia',
      'totalRecordsFound',
      'listaTaxonomiaSubfamilia',
      'listaTaxonomiaGenero',
      'listaTaxonomiaEspecie'
    ],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false
    }
  })

export default i18n
