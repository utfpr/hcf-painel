enum TipoUsuario {
  Curador = 1,
}

interface IRegra {
  action: string[];
  subject: string;
  conditions: object;
}

interface IUsuario {
  id: number;
  nome: string;
  herbario: {
    id: number;
    nome: string;
  };
  tipo: {
    id: number;
    tipo: TipoUsuario;
  };
}

export interface ILogin {
  token: string;
  usuario: IUsuario;
  regras: IRegra[];
}

export default IUsuario;
