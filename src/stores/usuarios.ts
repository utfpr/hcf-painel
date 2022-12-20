import createStore from 'zustand';

import IUsuario from '../sheets/usuarios.interface';

interface IUseAuthState {
  isAutenticado: boolean;
  token?: string;
  usuario?: IUsuario;
  login: (token: string, usuario: IUsuario) => void;
}

const useAuth = createStore<IUseAuthState>(setState => {
  return {
    isAutenticado: false,
    token: undefined,
    usuario: undefined,
    login: (token, usuario) => {
      setState({
        isAutenticado: true,
        token,
        usuario,
      });
    },
  };
});

export default useAuth;
