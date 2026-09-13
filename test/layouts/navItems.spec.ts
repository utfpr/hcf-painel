import {
  describe,
  expect,
  test
} from 'vitest'

import {
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
})
