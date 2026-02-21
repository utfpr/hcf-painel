import { TipoUsuario, Usuario } from '@/@types/components'

import { Rule } from '../libraries/auth/Manager'

const RESOURCES = [
    'Tombo',
    'Reino',
    'Familia',
    'Subfamilia',
    'Genero',
    'Especie',
    'Subespecie',
    'Variedade',
    'Autor',
    'Pais',
    'Estado',
    'Cidade'
] as const

const ACTIONS = [
    'read',
    'create',
    'update',
    'delete'
]

export type Resource = typeof RESOURCES[number]
export type Action = typeof ACTIONS[number]

const ruleSpecificMapping: Record<TipoUsuario, (user: Usuario) => Rule<Resource, Action>[]> = {
    [TipoUsuario.Curador]: () => [],
    [TipoUsuario.Operador]: () => [],
    [TipoUsuario.Identificador]: () => []
} as const

const defaultRules: Rule<Resource, Action>[] = [
    {
        resource: 'Tombo',
        action: ['read']
    },
    {
        resource: 'Reino',
        action: ['read']
    },
    {
        resource: 'Familia',
        action: ['read']
    },
    {
        resource: 'Subfamilia',
        action: ['read']
    },
    {
        resource: 'Genero',
        action: ['read']
    },
    {
        resource: 'Especie',
        action: ['read']
    },
    {
        resource: 'Subespecie',
        action: ['read']
    },
    {
        resource: 'Variedade',
        action: ['read']
    },
    {
        resource: 'Autor',
        action: ['read']
    }
]

export function createRules(user?: Usuario): Rule<Resource, Action>[] {
    if (!user) return defaultRules

    return [
        ...defaultRules,
        ...ruleSpecificMapping[user.tipo_usuario_id](user)
    ]
}

export default null
