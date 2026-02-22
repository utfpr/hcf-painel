import { type Mock, vi } from 'vitest'

import { TipoUsuario, Usuario } from '@/@types/components'
import { AuthProvider } from '@/contexts/Auth/AuthProvider'
import { useAuth } from '@/contexts/Auth/useAuth'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

const mockUser: Usuario = {
  id: 1,
  email: 'test@example.com',
  nome: 'Test User',
  tipo_usuario_id: TipoUsuario.Operador
}

function AuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testId="token">{auth.token ?? 'none'}</span>
      <span data-testId="user">{auth.user?.nome ?? 'none'}</span>
      <span data-testId="can-read-tombo">{auth.can('read', 'Tombo') ? 'yes' : 'no'}</span>
      <span data-testId="can-create-tombo">{auth.can('create', 'Tombo') ? 'yes' : 'no'}</span>
      <span data-testId="can-any">{auth.canAny(['read', 'create'], 'Tombo') ? 'yes' : 'no'}</span>
      <span data-testId="can-all">{auth.canAll(['read'], 'Tombo') ? 'yes' : 'no'}</span>
      <button
        data-testId="log-in-button"
        type="button"
        onClick={() => auth.logIn({ token: 'new-token', user: mockUser })}
      >
        Log In
      </button>
      <button data-testId="log-out-button" type="button" onClick={auth.logOut}>
        Log Out
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('renders children', () => {
    // arrange
    const mockSetAccessToken = vi.fn()
    const mockRemoveAccessToken = vi.fn();
    (useCookie as Mock).mockReturnValue([
      undefined,
      mockSetAccessToken,
      mockRemoveAccessToken
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
    render(
      <AuthProvider>
        <span>Child content</span>
      </AuthProvider>
    )

    // assert
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('provides context with default permissions when logged out', () => {
    // arrange
    const mockSetAccessToken = vi.fn()
    const mockRemoveAccessToken = vi.fn();
    (useCookie as Mock).mockReturnValue([
      undefined,
      mockSetAccessToken,
      mockRemoveAccessToken
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
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // assert
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('can-read-tombo')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-create-tombo')).toHaveTextContent('no')
    expect(screen.getByTestId('can-any')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-all')).toHaveTextContent('yes')
  })

  it('logIn updates context', async () => {
    // arrange
    const mockSetAccessToken = vi.fn()
    const mockRemoveAccessToken = vi.fn()
    const mockSetLoggedUser = vi.fn()
    const mockRemoveLoggedUser = vi.fn()
    const mockSetOldAccessToken = vi.fn()
    const mockRemoveOldAccessToken = vi.fn();
    (useCookie as Mock).mockReturnValue([
      undefined,
      mockSetAccessToken,
      mockRemoveAccessToken
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        mockSetLoggedUser,
        mockRemoveLoggedUser
      ])
      .mockReturnValueOnce([
        undefined,
        mockSetOldAccessToken,
        mockRemoveOldAccessToken
      ])
    const user = userEvent.setup()

    // act
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    await user.click(screen.getByTestId('log-in-button'))

    // assert
    expect(mockSetAccessToken).toHaveBeenCalledWith('new-token')
    expect(mockSetLoggedUser).toHaveBeenCalledWith(mockUser)
    expect(mockSetOldAccessToken).toHaveBeenCalledWith('new-token')
  })

  it('logOut clears context and calls remove functions', async () => {
    // arrange
    const mockSetAccessToken = vi.fn()
    const mockRemoveAccessToken = vi.fn()
    const mockSetLoggedUser = vi.fn()
    const mockRemoveLoggedUser = vi.fn()
    const mockSetOldAccessToken = vi.fn()
    const mockRemoveOldAccessToken = vi.fn();
    (useCookie as Mock).mockReturnValue([
      undefined,
      mockSetAccessToken,
      mockRemoveAccessToken
    ]);
    (useLocalStorage as Mock)
      .mockReturnValueOnce([
        undefined,
        mockSetLoggedUser,
        mockRemoveLoggedUser
      ])
      .mockReturnValueOnce([
        undefined,
        mockSetOldAccessToken,
        mockRemoveOldAccessToken
      ])
    const user = userEvent.setup()

    // act
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await user.click(screen.getByTestId('log-in-button'))
    expect(screen.getByTestId('token')).toHaveTextContent('new-token')
    await user.click(screen.getByTestId('log-out-button'))

    // assert
    expect(mockRemoveAccessToken).toHaveBeenCalled()
    expect(mockRemoveLoggedUser).toHaveBeenCalled()
    expect(mockRemoveOldAccessToken).toHaveBeenCalled()
    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // arrange & act & assert
    expect(() => {
      render(
        <div>
          <AuthConsumer />
        </div>
      )
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
