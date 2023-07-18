enum TipoUsuario {
  Curador = 1,
}

interface Regra {
  action: string[]
  subject: string
  conditions: object
}

interface Usuario {
  id: number
  nome: string
  herbario: {
    id: number
    nome: string
  }
  tipo: {
    id: number
    tipo: TipoUsuario
  }
}

export interface Login {
  token: string
  usuario: Usuario
  regras: Regra[]
}

export default Usuario
