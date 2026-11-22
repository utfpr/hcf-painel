import {
  describe,
  expect,
  test
} from 'vitest'

import { TipoUsuario } from '@/@types/components'
import { Manager } from '@/libraries/auth/Manager'
import {
  createRules,
  type Action,
  type Resource
} from '@/resources/permissions'

describe('successional stage CRUD permissions', () => {
  test.each([TipoUsuario.Curador, TipoUsuario.Operador])(
    'allows CRUD for user type %s',
    tipoUsuarioId => {
      const ability = new Manager<Resource, Action>({
        rules: createRules({
          id: 1,
          email: 'user@example.test',
          nome: 'Test user',
          tipo_usuario_id: tipoUsuarioId
        })
      })

      expect(ability.can('create', 'FaseSucessional')).toBe(true)
      expect(ability.can('update', 'FaseSucessional')).toBe(true)
      expect(ability.can('delete', 'FaseSucessional')).toBe(true)
    }
  )

  test('does not grant CRUD to an identifier', () => {
    const ability = new Manager<Resource, Action>({
      rules: createRules({
        id: 1,
        email: 'user@example.test',
        nome: 'Test user',
        tipo_usuario_id: TipoUsuario.Identificador
      })
    })

    expect(ability.can('create', 'FaseSucessional')).toBe(false)
    expect(ability.can('update', 'FaseSucessional')).toBe(false)
    expect(ability.can('delete', 'FaseSucessional')).toBe(false)
  })
})
