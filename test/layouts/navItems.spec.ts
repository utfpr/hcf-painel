import {
  describe,
  expect,
  test
} from 'vitest'

import {
  buildNavItems,
  getOpenMenuKeys,
  getSelectedMenuKey
} from '@/layouts/navItems'

describe('sidebar route matching', () => {
  test('selects the users item for nested user routes', () => {
    expect(getSelectedMenuKey('/usuarios')).toBe('usuarios')
    expect(getSelectedMenuKey('/usuarios/12')).toBe('usuarios')
  })

  test('opens the taxonomy submenu on taxonomy pages', () => {
    expect(getSelectedMenuKey('/familias')).toBe('familias')
    expect(getOpenMenuKeys('/familias')).toEqual(['taxonomia'])
  })

  test('opens reports when viewing a report route', () => {
    expect(getOpenMenuKeys('/relatorio-codigo-barras')).toEqual(['relatorios'])
  })

  test('opens ecology when viewing a successional phase', () => {
    expect(getSelectedMenuKey('/fases-sucessionais')).toBe('fasesSucessionais')
    expect(getOpenMenuKeys('/fases-sucessionais')).toEqual(['ecologia'])
  })

  test('opens ecology when viewing soil', () => {
    expect(getSelectedMenuKey('/solos')).toBe('solos')
    expect(getOpenMenuKeys('/solos')).toEqual(['ecologia'])
  })

  test('opens ecology when viewing relief', () => {
    expect(getSelectedMenuKey('/relevos')).toBe('relevos')
    expect(getOpenMenuKeys('/relevos')).toEqual(['ecologia'])
  })

  test('shows only permitted ecology items', () => {
    const t = ((key: string) => key) as never
    const auth = {
      can: (_action: string, resource: string) => resource === 'Relevo',
      canAny: (_actions: string[], resource: string) => resource === 'Relevo'
    } as never

    const items = buildNavItems({
      t, auth, isCuradorOuOperador: false, isExpedicionario: false
    })
    const geography = items?.find(item => item && 'key' in item && item.key === 'geography')
    const ecology = geography && 'children' in geography
      ? geography.children?.find(item => item && 'key' in item && item.key === 'ecologia')
      : undefined

    expect(ecology && 'children' in ecology ? ecology.children : []).toHaveLength(2)
    expect(ecology && 'children' in ecology ? ecology.children?.[0] : undefined).toMatchObject({ key: 'relevos' })

    const deniedAuth = {
      can: () => false,
      canAny: () => false
    } as never
    const deniedItems = buildNavItems({
      t, auth: deniedAuth, isCuradorOuOperador: false, isExpedicionario: false
    })
    const deniedGeography = deniedItems?.find(item => item && 'key' in item && item.key === 'geography')
    const deniedEcology = deniedGeography && 'children' in deniedGeography
      ? deniedGeography.children?.find(item => item && 'key' in item && item.key === 'ecologia')
      : undefined

    expect(deniedEcology && 'children' in deniedEcology ? deniedEcology.children : []).toHaveLength(0)
  })

  test('opens ecology when viewing vegetation', () => {
    expect(getSelectedMenuKey('/vegetacoes')).toBe('vegetacoes')
    expect(getOpenMenuKeys('/vegetacoes')).toEqual(['ecologia'])
  })
  test('opens the expeditions submenu on expedition routes', () => {
    expect(getSelectedMenuKey('/expedicoes')).toBe('expedicoesGerenciamento')
    expect(getSelectedMenuKey('/expedicoes/detalhes/3')).toBe('expedicoesGerenciamento')
    expect(getSelectedMenuKey('/expedicoes-app')).toBe('expedicoesApp')
    expect(getOpenMenuKeys('/expedicoes')).toEqual(['expedicoes'])
    expect(getOpenMenuKeys('/expedicoes-app')).toEqual(['expedicoes'])
  })

  test('hides logged-in only items from expeditioners', () => {
    const t = ((key: string) => key) as never
    const auth = {
      loggedIn: true,
      can: () => false,
      canAny: () => false
    } as never
    const collectKeys = (items: unknown[] | undefined): string[] => (items ?? []).flatMap(item => {
      const node = item as { key?: string; children?: unknown[] }
      return [node.key ?? '', ...collectKeys(node.children)]
    })

    const hiddenKeys = [
      'herbarios',
      'fichaTombo',
      'localColeta',
      'relatorios',
      'rfid'
    ]

    const regularKeys = collectKeys(buildNavItems({
      t, auth, isCuradorOuOperador: false, isExpedicionario: false
    }))
    expect(regularKeys).toEqual(expect.arrayContaining([
      ...hiddenKeys,
      'expedicoesGerenciamento',
      'expedicoesApp'
    ]))

    const expedicionarioKeys = collectKeys(buildNavItems({
      t, auth, isCuradorOuOperador: false, isExpedicionario: true
    }))
    expect(expedicionarioKeys).toEqual(expect.arrayContaining(['expedicoes', 'expedicoesApp']))
    ;[...hiddenKeys, 'expedicoesGerenciamento'].forEach(key => expect(expedicionarioKeys).not.toContain(key))
  })
})
