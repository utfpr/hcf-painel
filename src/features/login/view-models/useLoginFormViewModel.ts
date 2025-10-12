import { useState, useCallback } from 'react';
import { LoginRequest } from '../../../@types/components';
import { validarFormularioLogin } from '../../../helpers/validacoes';

export interface LoginFormViewModel {
  // State
  email: string;
  senha: string;
  lembrar: boolean;
  senhaVisivel: boolean;
  
  // Actions
  setEmail: (email: string) => void;
  setSenha: (senha: string) => void;
  setLembrar: (lembrar: boolean) => void;
  toggleSenhaVisivel: () => void;
  handleSubmit: () => void;
  resetForm: () => void;
  loadSavedCredentials: () => void;
  clearSavedCredentials: () => void;
}

export const useLoginFormViewModel = (onHandleSubmit: (err: any, valores: LoginRequest) => void): LoginFormViewModel => {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [lembrar, setLembrar] = useState<boolean>(false);
  const [senhaVisivel, setSenhaVisivel] = useState<boolean>(false);

  const loadSavedCredentials = useCallback(() => {
    try {
      const savedEmail = localStorage.getItem('hcf_saved_email');
      const savedPassword = localStorage.getItem('hcf_saved_password');
      const shouldRemember = localStorage.getItem('hcf_remember_me') === 'true';

      if (savedEmail && savedPassword && shouldRemember) {
        setEmail(savedEmail);
        setSenha(savedPassword);
        setLembrar(true);
      }
    } catch (error) {
      console.warn('Erro ao carregar credenciais salvas:', error);
    }
  }, []);


  const clearSavedCredentials = useCallback(() => {
    try {
      localStorage.removeItem('hcf_saved_email');
      localStorage.removeItem('hcf_saved_password');
      localStorage.removeItem('hcf_remember_me');
    } catch (error) {
      console.warn('Erro ao limpar credenciais salvas:', error);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const validacao = validarFormularioLogin({ email, senha });
    
    if (!validacao.isValid) {
      onHandleSubmit({ message: validacao.errors[0] }, { email, senha });
      return;
    }

    onHandleSubmit(null, { email, senha });
  }, [email, senha, onHandleSubmit]);

  const toggleSenhaVisivel = useCallback(() => {
    setSenhaVisivel(prev => !prev);
  }, []);

  const handleSetLembrar = useCallback((valor: boolean) => {
    setLembrar(valor);
    
    if (!valor) {
      clearSavedCredentials();
    }
  }, [clearSavedCredentials]);

  const resetForm = useCallback(() => {
    setEmail('');
    setSenha('');
    setLembrar(false);
    setSenhaVisivel(false);
  }, []);

  return {
    // State
    email,
    senha,
    lembrar,
    senhaVisivel,
    
    // Actions
    setEmail,
    setSenha,
    setLembrar: handleSetLembrar,
    toggleSenhaVisivel,
    handleSubmit,
    resetForm,
    loadSavedCredentials,
    clearSavedCredentials
  };
};