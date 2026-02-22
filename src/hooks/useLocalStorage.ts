import React, { useCallback, useEffect, useState } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'

export type UseLocalStorageReturn<T> = [
  value: T | undefined,
  React.Dispatch<T>,
  () => void
]

export function useLocalStorage<T>(key: string, initialValue?: T): UseLocalStorageReturn<T> {
    const { broker } = useContainer()

    const readValue = (): T | undefined => {
        try {
            const value = window.localStorage.getItem(key)
            if (value === null) {
                return initialValue ?? undefined
            }
            const parsed = JSON.parse(value) as unknown as T
            // Convert null to undefined if initialValue is undefined
            return parsed === null && initialValue === undefined ? (undefined as T) : parsed
        } catch (error) {
            return initialValue ?? undefined
        }
    }

    const [storedValue, setStoredValue] = useState(readValue)

    const setStorageValue = useCallback<React.Dispatch<T>>(
        newValue => {
            setStoredValue(newValue)
            if (newValue === undefined) {
                window.localStorage.removeItem(key)
                broker.emit('local_storage.removed', { key })
            } else {
                window.localStorage.setItem(key, JSON.stringify(newValue))
                broker.emit('local_storage.updated', { key })
            }
        },
        [broker, key]
    )

    const removeStorageValue = useCallback(() => {
        window.localStorage.removeItem(key)
        setStoredValue(undefined)
    }, [key])

    useEffect(() => {
        const handleLocalStorageUpdate = (detail: unknown): void => {
            const { key: eventKey } = detail as { key: string }
            if (eventKey === key) {
                setStoredValue(readValue())
            }
        }
        broker.subscribe('local_storage.updated', handleLocalStorageUpdate)

        return () => {
            broker.unsubscribe('local_storage.updated', handleLocalStorageUpdate)
        }
    }, [broker, key])

    return [storedValue, setStorageValue, removeStorageValue]
}

export default null
