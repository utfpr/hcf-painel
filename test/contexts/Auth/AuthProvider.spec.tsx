import { TipoUsuario, Usuario } from '@/@types/components'
import { AuthProvider } from '@/contexts/Auth/AuthProvider'
import { useAuth } from '@/contexts/Auth/useAuth'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/hooks/useCookie', () => ({
  useCookie: jest.fn(() => [undefined, jest.fn(), jest.fn()])
}))
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(() => [undefined, jest.fn(), jest.fn()])
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
  const mockSetAccessToken = jest.fn()
  const mockRemoveAccessToken = jest.fn()
  const mockSetLoggedUser = jest.fn()
  const mockRemoveLoggedUser = jest.fn()
  const mockSetOldAccessToken = jest.fn()
  const mockRemoveOldAccessToken = jest.fn()

  beforeEach(() => {
    (useCookie as jest.Mock).mockReturnValue([undefined, mockSetAccessToken, mockRemoveAccessToken]);
    (useLocalStorage as jest.Mock)
      .mockReturnValueOnce([undefined, mockSetLoggedUser, mockRemoveLoggedUser])
      .mockReturnValueOnce([undefined, mockSetOldAccessToken, mockRemoveOldAccessToken])
  })

  it('renders children', () => {
    render(
      <AuthProvider>
        <span>Child content</span>
      </AuthProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('provides context with default permissions when logged out', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('can-read-tombo')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-create-tombo')).toHaveTextContent('no')
    expect(screen.getByTestId('can-any')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-all')).toHaveTextContent('yes')
  })

  it('logIn updates context', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('token')).toHaveTextContent('none')

    await user.click(screen.getByTestId('log-in-button'))

    expect(mockSetAccessToken).toHaveBeenCalledWith('new-token')
    expect(mockSetLoggedUser).toHaveBeenCalledWith(mockUser)
    expect(mockSetOldAccessToken).toHaveBeenCalledWith('new-token')
  })

  it('logOut clears context and calls remove functions', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await user.click(screen.getByTestId('log-in-button'))
    expect(screen.getByTestId('token')).toHaveTextContent('new-token')

    await user.click(screen.getByTestId('log-out-button'))

    expect(mockRemoveAccessToken).toHaveBeenCalled()
    expect(mockRemoveLoggedUser).toHaveBeenCalled()
    expect(mockRemoveOldAccessToken).toHaveBeenCalled()
    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => {
      render(
        <div>
          <AuthConsumer />
        </div>
      )
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
