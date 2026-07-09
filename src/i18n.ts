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
        'navigator',
        'localStorage'
      ],
      caches: ['localStorage']
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
      'tombo',
      'servicosSpeciesLink',
      'servicosReflora',
      'verPendencia',
      'livroTombo',
      'buttonExport',
      'listaIdentificadoresScreen',
      'novoIdentificadorScreen',
      'listaColetoresScreen',
      'novoColetorScreen',
      'listaHerbariosScreen',
      'novoHerbarioScreen',
      'listaRemessasScreen',
      'novaRemessaScreen',
      'listaUsuariosScreen',
      'novoUsuarioScreen',
      'relatorioCoordenadaForaPoligonoScreen',
      'relatorioLocalColetaPeriodoScreen',
      'relatorioQtdPeriodoScreen',
      'relatorioTombosPorCidadeScreen',
      'rankingCard',
      'dashboardScreen',
      'comparativeAreaChart',
      'listaLocalColetaScreen',
      'listaPendenciasScreen',
      'relatorioCodigoBarrasScreen',
      'relatorioColetaLocalPeriodoScreen',
      'relatorioColetaPeriodoScreen',
      'relatorioColetorPeriodoScreen',
      'cidadeComponent',
      'cidadeContainer',
      'perfilScreen'
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
