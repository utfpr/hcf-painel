import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',

    supportedLngs: [
      'pt-BR',
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
      'listaTaxonomiaEspecie',
      'listaTaxonomiaSubespecie',
      'unauthorized',
      'relatorioInventarioEspecies',
      'relatorioPorPeriodo',
      'listaTaxonomiaVariedade',
      'listaTaxonomiaAutores',
      'mapaCompleto',
      'filtrosMapa',
      'filtersMap',
      'relatorioFamiliasGenero',
      'authService',
      'listaTaxonomiaVariedade',
      'exportacaoScreen',
      'listaHerbariosScreen',
      'novoHerbarioScreen',
      'listaRemessasScreen',
      'novaRemessaScreen',
      'listaUsuariosScreen',
      'novoUsuarioScreen',
      'relatorioCoordenadaForaPoligonoScreen',
      'relatorioLocalColetaPeriodoScreen',
      'relatorioQtdPeriodoScreen',
      'relatorioTombosPorCidadeScreen'
    ],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false
    }
  })

export default i18n
