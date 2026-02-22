import { Manager, type Rule } from '@/libraries/auth/Manager'

describe('Manager', () => {
  it('returns a manager with the given rules', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]

    // act
    const manager = new Manager({ rules })

    // assert
    expect(manager.rules).toBe(rules)
    expect(manager.rules).toHaveLength(1)
    expect(manager.rules[0]).toEqual({ resource: 'Tombo', action: 'read' })
  })

  it('returns can=true when action and resource match a rule', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    // act
    const result = manager.can('read', 'Tombo')

    // assert
    expect(result).toBe(true)
  })

  it('returns can=false when action is not allowed', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    // act
    const canCreate = manager.can('create', 'Tombo')
    const canUpdate = manager.can('update', 'Tombo')
    const canDelete = manager.can('delete', 'Tombo')

    // assert
    expect(canCreate).toBe(false)
    expect(canUpdate).toBe(false)
    expect(canDelete).toBe(false)
  })

  it('returns can=false when resource does not match', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    // act
    const result = manager.can('read', 'Familia')

    // assert
    expect(result).toBe(false)
  })

  it('supports multiple rules for different resources', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' },
      { resource: 'Familia', action: ['read', 'create'] }
    ]
    const manager = new Manager({ rules })

    // act
    const canReadTombo = manager.can('read', 'Tombo')
    const canReadFamilia = manager.can('read', 'Familia')
    const canCreateFamilia = manager.can('create', 'Familia')
    const canUpdateFamilia = manager.can('update', 'Familia')

    // assert
    expect(canReadTombo).toBe(true)
    expect(canReadFamilia).toBe(true)
    expect(canCreateFamilia).toBe(true)
    expect(canUpdateFamilia).toBe(false)
  })

  it('handles empty rules', () => {
    // arrange
    const manager = new Manager({ rules: [] })

    // act
    const canRead = manager.can('read', 'Tombo')

    // assert
    expect(manager.rules).toEqual([])
    expect(canRead).toBe(false)
  })

  it('supports rules with multiple actions as array', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Especie', action: ['read', 'create', 'update'] }
    ]
    const manager = new Manager({ rules })

    // act
    const canRead = manager.can('read', 'Especie')
    const canCreate = manager.can('create', 'Especie')
    const canUpdate = manager.can('update', 'Especie')
    const canDelete = manager.can('delete', 'Especie')

    // assert
    expect(canRead).toBe(true)
    expect(canCreate).toBe(true)
    expect(canUpdate).toBe(true)
    expect(canDelete).toBe(false)
  })

  it.skip('manage returns true when user has any action on resource', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Usuario', action: ['read', 'create', 'update', 'delete'] }
    ]
    const manager = new Manager({ rules })

    // act
    const canManageUsuario = manager.can('manage', 'Usuario')
    const canManageTombo = manager.can('manage', 'Tombo')

    // assert
    expect(canManageUsuario).toBe(true)
    expect(manager.can('read', 'Usuario')).toBe(true)
    expect(manager.can('create', 'Usuario')).toBe(true)
    expect(manager.can('update', 'Usuario')).toBe(true)
    expect(manager.can('delete', 'Usuario')).toBe(true)
    expect(canManageTombo).toBe(false)
  })

  it.skip('manage returns false when user lacks all actions', () => {
    // arrange
    const rules: Rule<string, string>[] = [
      { resource: 'Usuario', action: ['read', 'update'] }
    ]
    const manager = new Manager({ rules })

    // act
    const canManageTombo = manager.can('manage', 'Tombo')
    const canReadUsuario = manager.can('read', 'Usuario')
    const canUpdateUsuario = manager.can('update', 'Usuario')

    // assert
    expect(canManageTombo).toBe(false)
    expect(canReadUsuario).toBe(true)
    expect(canUpdateUsuario).toBe(true)
  })

  describe('canAny', () => {
    it('returns true when any action is allowed', () => {
      // arrange
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      // act
      const result1 = manager.canAny(['read'], 'Tombo')
      const result2 = manager.canAny(['read', 'create'], 'Tombo')

      // assert
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })

    it('returns false when no action is allowed', () => {
      // arrange
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      // act
      const result = manager.canAny(['create', 'update'], 'Tombo')

      // assert
      expect(result).toBe(false)
    })

    it('returns false for empty actions array', () => {
      // arrange
      const manager = new Manager({ rules: [{ resource: 'Tombo', action: 'read' }] })

      // act
      const result = manager.canAny([], 'Tombo')

      // assert
      expect(result).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns true when all actions are allowed', () => {
      // arrange
      const rules: Rule<string, string>[] = [
        { resource: 'Familia', action: ['read', 'create'] }
      ]
      const manager = new Manager({ rules })

      // act
      const result = manager.canAll(['read', 'create'], 'Familia')

      // assert
      expect(result).toBe(true)
    })

    it('returns false when any action is not allowed', () => {
      // arrange
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      // act
      const result = manager.canAll(['read', 'create'], 'Tombo')

      // assert
      expect(result).toBe(false)
    })

    it('returns false for empty actions array', () => {
      // arrange
      const manager = new Manager({
        rules: [
          { resource: 'Tombo', action: 'read' }
        ]
      })

      // act
      const result = manager.canAll([], 'Tombo')

      // assert
      expect(result).toBe(false)
    })

    it('returns true for all actions when resource has full CRUD', () => {
      // arrange
      const manager = new Manager({
        rules: [
          { resource: 'Usuario', action: ['read', 'create', 'update', 'delete'] }
        ]
      })

      // act
      const result = manager.canAll(['read', 'create', 'update', 'delete'], 'Usuario')

      // assert
      expect(result).toBe(true)
    })
  })
})
