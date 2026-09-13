import type { TFunction } from 'i18next'
import { Link } from 'react-router'

import type { AuthContextValue } from '@/contexts/Auth/AuthContext'
import {
  BankOutlined,
  BarsOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FlagOutlined,
  ScanOutlined,
  SearchOutlined,
  SnippetsOutlined,
  TeamOutlined
} from '@ant-design/icons'

import type { MenuProps } from 'antd6'

type MenuItem = NonNullable<MenuProps['items']>[number]

const TAXONOMIA_RESOURCES = [
  'Reino',
  'Familia',
  'Subfamilia',
  'Genero',
  'Especie',
  'Subespecie',
  'Variedade',
  'Autor'
] as const

interface BuildNavItemsParams {
  t: TFunction
  auth: AuthContextValue
  isCuradorOuOperador: boolean
}

function navLink(to: string, label: string) {
  return <Link to={to}>{label}</Link>
}

function filterItems(items: Array<MenuItem | null>): MenuItem[] {
  return items.filter((item): item is MenuItem => item != null)
}

export function getSelectedMenuKey(pathname: string): string {
  const routes: Array<[string, string]> = [
    ['/tombos', 'tombos'],
    ['/reinos', 'reinos'],
    ['/familias', 'familias'],
    ['/subfamilias', 'subfamilias'],
    ['/generos', 'generos'],
    ['/especies', 'especies'],
    ['/subespecies', 'subespecies'],
    ['/variedades', 'variedades'],
    ['/autores', 'autores'],
    ['/identificadores', 'identificadores'],
    ['/coletores', 'coletores'],
    ['/herbarios', 'herbarios'],
    ['/fichas/tombos', 'fichaTombo'],
    ['/usuarios', 'usuarios'],
    ['/estados', 'estados'],
    ['/cidades', 'cidades'],
    ['/locais-coleta', 'localColeta'],
    ['/mapa', 'mapa'],
    ['/filtros', 'filtrosAvancados'],
    ['/relatorio-por-periodo', 'relatorioPorPeriodo'],
    ['/relatorio-inventario-especies', 'inventarioEspecies'],
    ['/relatorio-coleta-data', 'coletaIntervaloData'],
    ['/relatorio-coletor-data', 'coletaColetorIntervaloData'],
    ['/relatorio-familias-genero', 'familiasGeneros'],
    ['/relatorio-locais-coleta', 'locaisColeta'],
    ['/relatorio-tombos-por-cidade', 'tombosPorCidade'],
    ['/relatorio-quantidade-familia-generos', 'quantidadeFamiliaGenero'],
    ['/relatorio-codigo-barras', 'codigoBarras'],
    ['/relatorio-coordenadas-fora-poligono', 'diagnosticoErrosPosicionamento'],
    ['/exportacao', 'exportacao'],
    ['/reflora', 'reflora'],
    ['/specieslink', 'specieslink'],
    ['/rfid-configuracao', 'rfidConfiguracao'],
    ['/rfid-conferencia', 'rfidConferencia'],
    ['/rfid-vinculacao', 'rfidVinculacao'],
    ['/rfid-inventario', 'rfidInventario'],
    ['/pendencias', 'pendencias'],
    ['/remessas', 'remessas']
  ]

  for (const [prefix, key] of routes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return key
    }
  }

  return ''
}

export function getOpenMenuKeys(pathname: string): string[] {
  const selected = getSelectedMenuKey(pathname)
  const groups: Record<string, string[]> = {
    taxonomia: [
      'reinos',
      'familias',
      'subfamilias',
      'generos',
      'especies',
      'subespecies',
      'variedades',
      'autores'
    ],
    locais: [
      'estados',
      'cidades',
      'localColeta'
    ],
    geolocalizacao: ['mapa', 'filtrosAvancados'],
    relatorios: [
      'relatorioPorPeriodo',
      'inventarioEspecies',
      'coletaIntervaloData',
      'coletaColetorIntervaloData',
      'familiasGeneros',
      'locaisColeta',
      'tombosPorCidade',
      'quantidadeFamiliaGenero',
      'codigoBarras',
      'diagnosticoErrosPosicionamento'
    ],
    servicos: ['reflora', 'specieslink'],
    rfid: [
      'rfidConfiguracao',
      'rfidConferencia',
      'rfidVinculacao',
      'rfidInventario'
    ]
  }

  return Object.entries(groups)
    .filter(([, keys]) => keys.includes(selected))
    .map(([group]) => group)
}

export function buildNavItems({
  t,
  auth,
  isCuradorOuOperador
}: BuildNavItemsParams): MenuProps['items'] {
  const taxonomiaChildren = filterItems([
    auth.can('read', 'Reino')
      ? {
          key: 'reinos',
          label: navLink('/reinos', t('mainLayout:reinos')),
          title: t('mainLayout:reinos')
        }
      : null,
    auth.can('read', 'Familia')
      ? {
          key: 'familias',
          label: navLink('/familias', t('mainLayout:familias')),
          title: t('mainLayout:familias')
        }
      : null,
    auth.can('read', 'Subfamilia')
      ? {
          key: 'subfamilias',
          label: navLink('/subfamilias', t('mainLayout:subfamilias')),
          title: t('mainLayout:subfamilias')
        }
      : null,
    auth.can('read', 'Genero')
      ? {
          key: 'generos',
          label: navLink('/generos', t('mainLayout:generos')),
          title: t('mainLayout:generos')
        }
      : null,
    auth.can('read', 'Especie')
      ? {
          key: 'especies',
          label: navLink('/especies', t('mainLayout:especies')),
          title: t('mainLayout:especies')
        }
      : null,
    auth.can('read', 'Subespecie')
      ? {
          key: 'subespecies',
          label: navLink('/subespecies', t('mainLayout:subespecies')),
          title: t('mainLayout:subespecies')
        }
      : null,
    auth.can('read', 'Variedade')
      ? {
          key: 'variedades',
          label: navLink('/variedades', t('mainLayout:variedades')),
          title: t('mainLayout:variedades')
        }
      : null,
    auth.can('read', 'Autor')
      ? {
          key: 'autores',
          label: navLink('/autores', t('mainLayout:autores')),
          title: t('mainLayout:autores')
        }
      : null
  ])

  const collectionItems = filterItems([
    auth.can('read', 'Tombo')
      ? {
          key: 'tombos',
          icon: <DesktopOutlined />,
          label: navLink('/tombos', t('mainLayout:tombos')),
          title: t('mainLayout:tombos')
        }
      : null,
    TAXONOMIA_RESOURCES.some(resource => auth.can('read', resource))
      ? {
          key: 'taxonomia',
          icon: <BankOutlined />,
          label: t('mainLayout:taxonomia'),
          title: t('mainLayout:taxonomia'),
          children: taxonomiaChildren
        }
      : null,
    auth.can('read', 'Identificador')
      ? {
          key: 'identificadores',
          icon: <TeamOutlined />,
          label: navLink('/identificadores', t('mainLayout:identificadores')),
          title: t('mainLayout:identificadores')
        }
      : null,
    auth.can('read', 'Coletor')
      ? {
          key: 'coletores',
          icon: <TeamOutlined />,
          label: navLink('/coletores', t('mainLayout:coletores')),
          title: t('mainLayout:coletores')
        }
      : null,
    auth.loggedIn
      ? {
          key: 'herbarios',
          icon: <FlagOutlined />,
          label: navLink('/herbarios', t('mainLayout:herbarios')),
          title: t('mainLayout:herbarios')
        }
      : null,
    auth.loggedIn
      ? {
          key: 'fichaTombo',
          icon: <FileTextOutlined />,
          label: navLink('/fichas/tombos', t('mainLayout:fichaTombo')),
          title: t('mainLayout:fichaTombo')
        }
      : null
  ])

  const peopleItems = filterItems([
    auth.can('read', 'Usuario')
      ? {
          key: 'usuarios',
          icon: <TeamOutlined />,
          label: navLink('/usuarios', t('mainLayout:usuarios')),
          title: t('mainLayout:usuarios')
        }
      : null
  ])

  const geographyItems = filterItems([
    {
      key: 'locais',
      icon: <EnvironmentOutlined />,
      label: t('mainLayout:locais'),
      title: t('mainLayout:locais'),
      children: filterItems([
        {
          key: 'estados',
          label: navLink('/estados', t('mainLayout:estados')),
          title: t('mainLayout:estados')
        },
        {
          key: 'cidades',
          label: navLink('/cidades', t('mainLayout:cidades')),
          title: t('mainLayout:cidades')
        },
        auth.loggedIn
          ? {
              key: 'localColeta',
              label: navLink('/locais-coleta', t('mainLayout:localColeta')),
              title: t('mainLayout:localColeta')
            }
          : null
      ])
    },
    {
      key: 'geolocalizacao',
      icon: <EnvironmentOutlined />,
      label: t('mainLayout:geolocalizacao'),
      title: t('mainLayout:geolocalizacao'),
      children: [
        {
          key: 'mapa',
          label: navLink('/mapa', t('mainLayout:mapaCompleto')),
          title: t('mainLayout:mapaCompleto')
        },
        {
          key: 'filtrosAvancados',
          label: navLink('/filtros', t('mainLayout:filtrosAvancados')),
          title: t('mainLayout:filtrosAvancados')
        }
      ]
    }
  ])

  const reportChildren = auth.loggedIn
    ? [
        {
          key: 'relatorioPorPeriodo',
          label: navLink('/relatorio-por-periodo', t('mainLayout:relatorioPorPeriodo')),
          title: t('mainLayout:relatorioPorPeriodo')
        },
        {
          key: 'inventarioEspecies',
          label: navLink('/relatorio-inventario-especies', t('mainLayout:inventarioEspecies')),
          title: t('mainLayout:inventarioEspecies')
        },
        {
          key: 'coletaIntervaloData',
          label: navLink('/relatorio-coleta-data', t('mainLayout:coletaIntervaloData')),
          title: t('mainLayout:coletaIntervaloData')
        },
        {
          key: 'coletaColetorIntervaloData',
          label: navLink('/relatorio-coletor-data', t('mainLayout:coletaColetorIntervaloData')),
          title: t('mainLayout:coletaColetorIntervaloData')
        },
        {
          key: 'familiasGeneros',
          label: navLink('/relatorio-familias-genero', t('mainLayout:familiasGeneros')),
          title: t('mainLayout:familiasGeneros')
        },
        {
          key: 'locaisColeta',
          label: navLink('/relatorio-locais-coleta', t('mainLayout:locaisColeta')),
          title: t('mainLayout:locaisColeta')
        },
        {
          key: 'tombosPorCidade',
          label: navLink('/relatorio-tombos-por-cidade', t('mainLayout:tombosPorCidade')),
          title: t('mainLayout:tombosPorCidade')
        },
        {
          key: 'quantidadeFamiliaGenero',
          label: navLink(
            '/relatorio-quantidade-familia-generos',
            t('mainLayout:quantidadeFamiliaGenero')
          ),
          title: t('mainLayout:quantidadeFamiliaGenero')
        },
        {
          key: 'codigoBarras',
          label: navLink('/relatorio-codigo-barras', t('mainLayout:codigoBarras')),
          title: t('mainLayout:codigoBarras')
        },
        {
          key: 'diagnosticoErrosPosicionamento',
          label: navLink(
            '/relatorio-coordenadas-fora-poligono',
            t('mainLayout:diagnosticoErrosPosicionamento')
          ),
          title: t('mainLayout:diagnosticoErrosPosicionamento')
        }
      ]
    : []

  const serviceChildren = filterItems([
    auth.can('read', 'Reflora')
      ? {
          key: 'reflora',
          label: navLink('/reflora', 'Reflora'),
          title: 'Reflora'
        }
      : null,
    auth.can('read', 'SpeciesLink')
      ? {
          key: 'specieslink',
          label: navLink('/specieslink', 'speciesLink'),
          title: 'speciesLink'
        }
      : null
  ])

  const operationsItems = filterItems([
    isCuradorOuOperador
      ? {
          key: 'pendencias',
          icon: <BarsOutlined />,
          label: navLink('/pendencias', t('mainLayout:pendencias')),
          title: t('mainLayout:pendencias')
        }
      : null,
    isCuradorOuOperador
      ? {
          key: 'remessas',
          icon: <DatabaseOutlined />,
          label: navLink('/remessas', t('mainLayout:remessas')),
          title: t('mainLayout:remessas')
        }
      : null,
    auth.loggedIn
      ? {
          key: 'relatorios',
          icon: <SnippetsOutlined />,
          label: t('mainLayout:relatorios'),
          title: t('mainLayout:relatorios'),
          children: reportChildren
        }
      : null,
    auth.can('export', 'Tombo')
      ? {
          key: 'exportacao',
          icon: <DesktopOutlined />,
          label: navLink('/exportacao', t('mainLayout:exportacao')),
          title: t('mainLayout:exportacao')
        }
      : null,
    serviceChildren.length > 0
      ? {
          key: 'servicos',
          icon: <SearchOutlined />,
          label: t('mainLayout:servicos'),
          title: t('mainLayout:servicos'),
          children: serviceChildren
        }
      : null,
    auth.loggedIn
      ? {
          key: 'rfid',
          icon: <ScanOutlined />,
          label: 'RFID',
          title: 'RFID',
          children: [
            {
              key: 'rfidConfiguracao',
              label: navLink('/rfid-configuracao', t('rfid:menu.configuration')),
              title: t('rfid:menu.configuration')
            },
            {
              key: 'rfidConferencia',
              label: navLink('/rfid-conferencia', t('rfid:menu.conference')),
              title: t('rfid:menu.conference')
            },
            {
              key: 'rfidVinculacao',
              label: navLink('/rfid-vinculacao', t('rfid:menu.link')),
              title: t('rfid:menu.link')
            },
            {
              key: 'rfidInventario',
              label: navLink('/rfid-inventario', t('rfid:menu.inventory')),
              title: t('rfid:menu.inventory')
            }
          ]
        }
      : null
  ])

  return filterItems([
    collectionItems.length > 0
      ? {
          type: 'group',
          key: 'collection',
          label: t('mainLayout:grupoColecao'),
          children: collectionItems
        }
      : null,
    peopleItems.length > 0
      ? {
          type: 'group',
          key: 'people',
          label: t('mainLayout:grupoPessoasAcesso'),
          children: peopleItems
        }
      : null,
    geographyItems.length > 0
      ? {
          type: 'group',
          key: 'geography',
          label: t('mainLayout:grupoGeografia'),
          children: geographyItems
        }
      : null,
    operationsItems.length > 0
      ? {
          type: 'group',
          key: 'operations',
          label: t('mainLayout:grupoDadosOperacoes'),
          children: operationsItems
        }
      : null
  ])
}
