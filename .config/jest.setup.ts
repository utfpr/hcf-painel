/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import '@testing-library/jest-dom'

;(global as unknown as Record<string, unknown>).React = React

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    search: '',
  }
})

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length(): number {
      return store.size
    },
    getItem(key) {
      return store.get(key) || null;
    },
    setItem(key, value) {
      store.set(key, value);
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
    },
  }
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: createLocalStorageMock()
})
