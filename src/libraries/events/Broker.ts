import type { Events } from '@/resources/events'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Broker<EventMap extends Record<string, (...args: any[]) => void> = Events> {
    private readonly listeners = new Map<keyof EventMap, EventMap[keyof EventMap][]>()

    subscribe<Name extends keyof EventMap>(name: Name, callback: EventMap[Name]): this {
        const listeners = this.listeners.get(name) ?? []
        if (listeners) listeners.push(callback)

        this.listeners.set(name, listeners)
        return this
    }

    unsubscribe<Name extends keyof EventMap>(name: Name, callback: EventMap[Name]): this {
        const listeners = this.listeners.get(name)
        if (listeners) {
            const index = listeners.indexOf(callback)
            if (index >= 0) {
                listeners.splice(index, 1)
            }
        }
        return this
    }

    emit<Name extends keyof EventMap>(name: Name, ...args: Parameters<EventMap[Name]>): this {
        const listeners = this.listeners.get(name)
        if (listeners?.length) {
            // eslint-disable-next-line no-restricted-syntax
            for (const listener of listeners) {
                listener(...args)
            }
        }

        return this
    }
}

export const broker: Broker = new Broker()

export default null
