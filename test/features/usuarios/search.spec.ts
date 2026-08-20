import { inferSearchField, toSearchFilters } from '@/features/usuarios/redesign/search'

describe('toSearchFilters', () => {
  it('maps e-mail queries to the email filter', () => {
    expect(toSearchFilters('greta@utfpr.edu.br')).toEqual({
      email: 'greta@utfpr.edu.br'
    })
    expect(inferSearchField('greta@utfpr.edu.br')).toBe('email')
  })

  it('maps phone-like queries to the phone filter', () => {
    expect(toSearchFilters('+55 44 99968-2514')).toEqual({
      telefone: '+55 44 99968-2514'
    })
    expect(inferSearchField('44999682514')).toBe('telefone')
  })

  it('maps other queries to the name filter', () => {
    expect(toSearchFilters('Greta Aline')).toEqual({
      nome: 'Greta Aline'
    })
  })

  it('returns no filters for blank search', () => {
    expect(toSearchFilters('   ')).toEqual({})
    expect(inferSearchField('')).toBeUndefined()
  })
})
