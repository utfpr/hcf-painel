import { createMongoAbility, AbilityBuilder, MongoAbility } from '@casl/ability'

export type Conditions = object

export interface Rule<Resource extends string, Action extends string, Conditions extends object = object> {
    resource: Resource
    action: Action | Action[]
    conditions?: Conditions
}

export class Manager<R extends string, A extends string> {
    private readonly ability: MongoAbility

    readonly rules: Rule<R, A>[]

    constructor(params: { rules: Rule<R, A>[] }) {
        const builder = new AbilityBuilder(createMongoAbility)

        // eslint-disable-next-line no-restricted-syntax
        for (const rule of params.rules) {
            const action = rule.action as string
            const resource = rule.resource as string
            builder.can(action, resource)
        }

        this.ability = builder.build()
        this.rules = params.rules
    }

    can(action: A, resource: R): boolean {
        return this.ability.can(action, resource)
    }

    canAny(actions: A[], resource: R): boolean {
        if (!actions.length) return false
        return actions.some(action => this.can(action, resource))
    }

    canAll(actions: A[], resource: R): boolean {
        if (!actions.length) return false
        return actions.every(action => this.can(action, resource))
    }
}
