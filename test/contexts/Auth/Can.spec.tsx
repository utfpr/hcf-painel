import type { ReactNode } from 'react'

import { type Mock, vi } from 'vitest'

import { AuthProvider } from '@/contexts/Auth/AuthProvider'
import { Can } from '@/contexts/Auth/Can'
import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/useCookie', () => ({
  useCookie: vi.fn(() => [
    undefined,
    vi.fn(),
    vi.fn()
  ])
}))
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => [
    undefined,
    vi.fn(),
    vi.fn()
  ])
}))

function renderWithProviders(ui: ReactNode) {
  return render(
    <ContainerProvider baseUrl="https://api.example.com">
      {ui}
    </ContainerProvider>
  )
}

describe('Can', () => {
  it('renders children when user can perform action', () => {
    // arrange
    (useCookie as Mock).mockReturnValue([
      undefined,
      vi.fn(),
      vi.fn()
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])

    // act
    renderWithProviders(
      <AuthProvider>
        <Can action="read" resource="Tombo">
          <span data-testId="visible-content">Visible content</span>
        </Can>
      </AuthProvider>
    )

    // assert
    expect(screen.getByTestId('visible-content')).toBeInTheDocument()
  })

  it('renders null when user cannot perform action', () => {
    // arrange
    (useCookie as Mock).mockReturnValue([
      undefined,
      vi.fn(),
      vi.fn()
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])

    // act
    renderWithProviders(
      <AuthProvider>
        <Can action="create" resource="Tombo">
          <span data-testId="hidden-content">Hidden content</span>
        </Can>
      </AuthProvider>
    )

    // assert
    expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument()
  })

  it('with not prop renders children when user cannot perform action', () => {
    // arrange
    (useCookie as Mock).mockReturnValue([
      undefined,
      vi.fn(),
      vi.fn()
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])

    // act
    renderWithProviders(
      <AuthProvider>
        <Can not action="create" resource="Tombo">
          <span data-testId="shown-when-cannot-create">Shown when cannot create</span>
        </Can>
      </AuthProvider>
    )

    // assert
    expect(screen.getByTestId('shown-when-cannot-create')).toBeInTheDocument()
  })

  it('with not prop renders null when user can perform action', () => {
    // arrange
    (useCookie as Mock).mockReturnValue([
      undefined,
      vi.fn(),
      vi.fn()
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])
      .mockReturnValueOnce([
        undefined,
        vi.fn(),
        vi.fn()
      ])

    // act
    renderWithProviders(
      <AuthProvider>
        <Can not action="read" resource="Tombo">
          <span data-testId="hidden-when-can-read">Hidden when can read</span>
        </Can>
      </AuthProvider>
    )

    // assert
    expect(screen.queryByText('Hidden when can read')).not.toBeInTheDocument()
  })
})
