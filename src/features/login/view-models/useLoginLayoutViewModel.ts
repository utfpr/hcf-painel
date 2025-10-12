// hcf-painel/src/features/login/view-models/useLoginLayoutViewModel.ts

import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginLayoutProps, LoginRequest, ApiError } from '../../../@types/components';

export interface LoginLayoutViewModel {
  // State
  message: string | null;
  
  // Actions
  handleSubmit: (err: any, valores: LoginRequest, lembrar?: boolean) => void;
  onCloseMessage: () => void;
}

export const useLoginLayoutViewModel = (props: LoginLayoutProps): LoginLayoutViewModel => {
  const [message, setMessage] = useState<string | null>(null);
  const { login, saveCredentials } = useAuth();

  const handleRequestError = useCallback(({ message }: { message: string }) => {
    const error: ApiError = {
      mensagem: '',
      codigo: 500
    };
    props.requisicao(error);
    setMessage(message);
  }, [props.requisicao]);

  const requestUserLogin = useCallback(async (values: LoginRequest, shouldRemember: boolean) => {
    try {
      props.load(true);
      const response = await login(values);
      saveCredentials(response);
      
      // Salva credenciais do "Lembrar-me" apenas após login bem-sucedido
      if (shouldRemember) {
        try {
          localStorage.setItem('hcf_saved_email', values.email);
          localStorage.setItem('hcf_saved_password', values.senha);
          localStorage.setItem('hcf_remember_me', 'true');
        } catch (storageError) {
          console.warn('Erro ao salvar credenciais de lembrar-me:', storageError);
        }
      } else {
        // Se não marcou lembrar-me, limpa credenciais salvas
        try {
          localStorage.removeItem('hcf_saved_email');
          localStorage.removeItem('hcf_saved_password');
          localStorage.removeItem('hcf_remember_me');
        } catch (storageError) {
          console.warn('Erro ao limpar credenciais de lembrar-me:', storageError);
        }
      }
      
      props.load(false);
      props.redirect();
    } catch (error: any) {
      props.load(false);
      
      if (error.codigo) {
        // É um erro da API
        props.requisicao(error);
      } else {
        // É um erro de rede ou outro
        handleRequestError({ message: error.message || 'Erro desconhecido' });
      }
    }
  }, [props, login, saveCredentials, handleRequestError]);

  const handleSubmit = useCallback((err: any, valores: LoginRequest, lembrar: boolean = false) => {
    if (!err) {
      requestUserLogin(valores, lembrar);
    }
  }, [requestUserLogin]);

  const onCloseMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    // State
    message,
    
    // Actions
    handleSubmit,
    onCloseMessage
  };
};