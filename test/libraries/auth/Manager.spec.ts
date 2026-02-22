import { Manager, type Rule } from '@/libraries/auth/Manager'

describe('Manager', () => {
  it('returns a manager with the given rules', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    expect(manager.rules).toBe(rules)
    expect(manager.rules).toHaveLength(1)
    expect(manager.rules[0]).toEqual({ resource: 'Tombo', action: 'read' })
  })

  it('returns can=true when action and resource match a rule', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('read', 'Tombo')).toBe(true)
  })

  it('returns can=false when action is not allowed', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('create', 'Tombo')).toBe(false)
    expect(manager.can('update', 'Tombo')).toBe(false)
    expect(manager.can('delete', 'Tombo')).toBe(false)
  })

  it('returns can=false when resource does not match', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('read', 'Familia')).toBe(false)
  })

  it('supports multiple rules for different resources', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Tombo', action: 'read' },
      { resource: 'Familia', action: ['read', 'create'] }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('read', 'Tombo')).toBe(true)
    expect(manager.can('read', 'Familia')).toBe(true)
    expect(manager.can('create', 'Familia')).toBe(true)
    expect(manager.can('update', 'Familia')).toBe(false)
  })

  it('handles empty rules', () => {
    const manager = new Manager({ rules: [] })

    expect(manager.rules).toEqual([])
    expect(manager.can('read', 'Tombo')).toBe(false)
  })

  it('supports rules with multiple actions as array', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Especie', action: ['read', 'create', 'update'] }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('read', 'Especie')).toBe(true)
    expect(manager.can('create', 'Especie')).toBe(true)
    expect(manager.can('update', 'Especie')).toBe(true)
    expect(manager.can('delete', 'Especie')).toBe(false)
  })

  it.skip('manage returns true when user has any action on resource', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Usuario', action: ['read', 'create', 'update', 'delete'] }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('manage', 'Usuario')).toBe(true)
    expect(manager.can('read', 'Usuario')).toBe(true)
    expect(manager.can('create', 'Usuario')).toBe(true)
    expect(manager.can('update', 'Usuario')).toBe(true)
    expect(manager.can('delete', 'Usuario')).toBe(true)
    expect(manager.can('manage', 'Tombo')).toBe(false)
  })

  it.skip('manage returns false when user lacks all actions', () => {
    const rules: Rule<string, string>[] = [
      { resource: 'Usuario', action: ['read', 'update'] }
    ]
    const manager = new Manager({ rules })

    expect(manager.can('manage', 'Tombo')).toBe(false)
    expect(manager.can('read', 'Usuario')).toBe(true)
    expect(manager.can('update', 'Usuario')).toBe(true)
  })

  describe('canAny', () => {
    it('returns true when any action is allowed', () => {
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      expect(manager.canAny(['read'], 'Tombo')).toBe(true)
      expect(manager.canAny(['read', 'create'], 'Tombo')).toBe(true)
    })

    it('returns false when no action is allowed', () => {
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      expect(manager.canAny(['create', 'update'], 'Tombo')).toBe(false)
    })

    it('returns false for empty actions array', () => {
      const manager = new Manager({ rules: [{ resource: 'Tombo', action: 'read' }] })

      expect(manager.canAny([], 'Tombo')).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns true when all actions are allowed', () => {
      const rules: Rule<string, string>[] = [
        { resource: 'Familia', action: ['read', 'create'] }
      ]
      const manager = new Manager({ rules })

      expect(manager.canAll(['read', 'create'], 'Familia')).toBe(true)
    })

    it('returns false when any action is not allowed', () => {
      const rules: Rule<string, string>[] = [
        { resource: 'Tombo', action: 'read' }
      ]
      const manager = new Manager({ rules })

      expect(manager.canAll(['read', 'create'], 'Tombo')).toBe(false)
    })

    it('returns false for empty actions array', () => {
      const manager = new Manager({
        rules: [
          { resource: 'Tombo', action: 'read' }
        ]
      })

      expect(manager.canAll([], 'Tombo')).toBe(false)
    })

    it('returns true for all actions when resource has full CRUD', () => {
      const manager = new Manager({
        rules: [
          { resource: 'Usuario', action: ['read', 'create', 'update', 'delete'] }
        ]
      })

      expect(manager.canAll(['read', 'create', 'update', 'delete'], 'Usuario')).toBe(true)
    })
  })
})
