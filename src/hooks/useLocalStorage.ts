import React, { useCallback, useEffect, useState } from 'react'

export type UseLocalStorageReturn<T> = [
  value: T | undefined,
  React.Dispatch<T>,
  () => void
]

export function useLocalStorage<T>(key: string, initialValue?: T): UseLocalStorageReturn<T> {
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
            let event: CustomEvent<{ key: string }>
            if (newValue === undefined) {
                window.localStorage.removeItem(key)
                event = new CustomEvent('local_storage.removed', {
                    cancelable: false,
                    detail: { key }
                })
            } else {
                window.localStorage.setItem(key, JSON.stringify(newValue))
                event = new CustomEvent('local_storage.updated', {
                    cancelable: false,
                    detail: { key }
                })
            }
            window.dispatchEvent(event)
        },
        [key]
    )

    const removeStorageValue = useCallback(() => {
        window.localStorage.removeItem(key)
        setStoredValue(undefined)
    }, [key])

    useEffect(() => {
        const handleLocalStorageChange = (event: Event): void => {
            if (event instanceof CustomEvent && (event as CustomEvent<{ key: string }>).detail.key === key) {
                setStoredValue(readValue())
            }
        }
        window.addEventListener('local_storage.updated', handleLocalStorageChange)

        return () => {
            window.removeEventListener('local_storage.updated', handleLocalStorageChange)
        }
    }, [])

    return [storedValue, setStorageValue, removeStorageValue]
}

export default null
