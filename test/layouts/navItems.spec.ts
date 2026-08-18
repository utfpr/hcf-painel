import {
  getOpenMenuKeys,
  getSelectedMenuKey
} from '@/layouts/navItems'

describe('sidebar route matching', () => {
  it('selects the users item for nested user routes', () => {
    expect(getSelectedMenuKey('/usuarios')).toBe('usuarios')
    expect(getSelectedMenuKey('/usuarios/12')).toBe('usuarios')
  })

  it('opens the taxonomy submenu on taxonomy pages', () => {
    expect(getSelectedMenuKey('/familias')).toBe('familias')
    expect(getOpenMenuKeys('/familias')).toEqual(['taxonomia'])
  })

  it('opens reports when viewing a report route', () => {
    expect(getOpenMenuKeys('/relatorio-codigo-barras')).toEqual(['relatorios'])
  })
})
