// hcf-painel/src/@types/components.ts

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  email: string;
  nome: string;
}

export interface ApiError {
  mensagem: string;
  codigo: number;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description: string;
}

export interface InicioScreenProps {
  history: {
    push: (path: string) => void;
  };
}

export interface InicioScreenState {
  loading: boolean;
  mobileMenuVisible: boolean;
}

export interface LoginLayoutProps {
  redirect: () => void;
  load: (loading: boolean) => void;
  requisicao: (error: ApiError) => void;
}

export interface LoginLayoutState {
  message: string | null;
  loading: boolean;
}

export interface LoginFormProps {
  handleSubmit: (err: any, valores: LoginRequest) => void;
  loading: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}