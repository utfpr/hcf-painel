import {
  describe,
  expect,
  test
} from 'vitest'

import { TipoUsuario, type Usuario } from '@/@types/components'
import { Manager } from '@/libraries/auth/Manager'
import { createRules } from '@/resources/permissions'

function createUser(tipo_usuario_id: TipoUsuario): Usuario {
  return {
    id: 1,
    email: 'test@example.com',
    nome: 'Test User',
    tipo_usuario_id
  }
}

function canForRole(tipo_usuario_id: TipoUsuario, action: 'read' | 'create' | 'update' | 'delete') {
  const manager = new Manager({ rules: createRules(createUser(tipo_usuario_id)) })
  return manager.can(action, 'Vegetacao')
}

describe('Vegetacao permissions', () => {
  test.each([TipoUsuario.Curador, TipoUsuario.Operador])(
    'allows Curador and Operador to write (%s)',
    tipoUsuario => {
      expect(canForRole(tipoUsuario, 'read')).toBe(true)
      expect(canForRole(tipoUsuario, 'create')).toBe(true)
      expect(canForRole(tipoUsuario, 'update')).toBe(true)
      expect(canForRole(tipoUsuario, 'delete')).toBe(true)
    }
  )

  test('allows Identificador to read without write access', () => {
    expect(canForRole(TipoUsuario.Identificador, 'read')).toBe(true)
    expect(canForRole(TipoUsuario.Identificador, 'create')).toBe(false)
    expect(canForRole(TipoUsuario.Identificador, 'update')).toBe(false)
    expect(canForRole(TipoUsuario.Identificador, 'delete')).toBe(false)
  })
})
