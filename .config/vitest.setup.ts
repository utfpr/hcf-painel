import React from 'react'

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

;(global as unknown as Record<string, unknown>).React = React

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    search: ''
  }
})

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length(): number {
      return store.size
    },
    getItem(key) {
      return store.get(key) || null
    },
    setItem(key, value) {
      store.set(key, value)
    },
    removeItem(key) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
    key(index) {
      const entry = Array.from(store.entries())
        .find((_, keyIndex) => keyIndex === index)
      return entry ? entry[0] : null
    }
  }
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: createLocalStorageMock()
})
