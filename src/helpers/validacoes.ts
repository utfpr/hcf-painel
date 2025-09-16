export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LoginFormData {
  email: string;
  senha: string;
}

/**
 * Valida se o email possui formato válido
 */
export const validarEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se a senha atende aos critérios mínimos
 */
export const validarSenha = (senha: string, tamanhoMinimo: number = 6): boolean => {
  if (!senha || typeof senha !== 'string') {
    return false;
  }
  
  return senha.length >= tamanhoMinimo;
};

/**
 * Valida se um campo obrigatório não está vazio
 */
export const validarCampoObrigatorio = (valor: any): boolean => {
  if (valor === null || valor === undefined) {
    return false;
  }
  
  if (typeof valor === 'string') {
    return valor.trim().length > 0;
  }
  
  return true;
};

/**
 * Valida um formulário de login
 */
export const validarFormularioLogin = (dados: LoginFormData): ValidationResult => {
  const errors: string[] = [];
  
  if (!validarCampoObrigatorio(dados.email)) {
    errors.push('Email é obrigatório');
  } else if (!validarEmail(dados.email)) {
    errors.push('Email inválido');
  }
  
  if (!validarCampoObrigatorio(dados.senha)) {
    errors.push('Senha é obrigatória');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
