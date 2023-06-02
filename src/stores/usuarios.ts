import createStore from 'zustand'

import Usuario from '../sheets/usuarios.interface'

interface UseAuthState {
  isAutenticado: boolean
  token?: string
  usuario?: Usuario
  login: (token: string, usuario: Usuario) => void
}

const useAuth = createStore<UseAuthState>(setState => {
  return {
    isAutenticado: false,
    token: undefined,
    usuario: undefined,
    login: (token, usuario) => {
      setState({
        isAutenticado: true,
        token,
        usuario
      })
    }
  }
})

export default useAuth
