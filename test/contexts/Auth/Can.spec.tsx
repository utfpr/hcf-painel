import { AuthProvider } from '@/contexts/Auth/AuthProvider'
import { Can } from '@/contexts/Auth/Can'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { render, screen } from '@testing-library/react'

jest.mock('@/hooks/useCookie', () => ({
  useCookie: jest.fn(() => [undefined, jest.fn(), jest.fn()])
}))
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(() => [undefined, jest.fn(), jest.fn()])
}))

describe('Can', () => {
  beforeEach(() => {
    (useCookie as jest.Mock).mockReturnValue([undefined, jest.fn(), jest.fn()]);
    (useLocalStorage as jest.Mock)
      .mockReturnValueOnce([undefined, jest.fn(), jest.fn()])
      .mockReturnValueOnce([undefined, jest.fn(), jest.fn()])
  })

  it('renders children when user can perform action', () => {
    render(
      <AuthProvider>
        <Can action="read" resource="Tombo">
          <span data-testId="visible-content">Visible content</span>
        </Can>
      </AuthProvider>
    )

    expect(screen.getByTestId('visible-content')).toBeInTheDocument()
  })

  it('renders null when user cannot perform action', () => {
    render(
      <AuthProvider>
        <Can action="create" resource="Tombo">
          <span data-testId="hidden-content">Hidden content</span>
        </Can>
      </AuthProvider>
    )

    expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument()
  })

  it('with not prop renders children when user cannot perform action', () => {
    render(
      <AuthProvider>
        <Can not action="create" resource="Tombo">
          <span data-testId="shown-when-cannot-create">Shown when cannot create</span>
        </Can>
      </AuthProvider>
    )

    expect(screen.getByTestId('shown-when-cannot-create')).toBeInTheDocument()
  })

  it('with not prop renders null when user can perform action', () => {
    render(
      <AuthProvider>
        <Can not action="read" resource="Tombo">
          <span data-testId="hidden-when-can-read">Hidden when can read</span>
        </Can>
      </AuthProvider>
    )

    expect(screen.queryByText('Hidden when can read')).not.toBeInTheDocument()
  })
})
