/**
 * Tipos da feature de expedições.
 *
 * Só entram aqui contratos de endpoints QUE JÁ EXISTEM na API (cidades e
 * usuários). O contrato de criação de expedição vive isolado em
 * `api/expedicaoContract.ts` porque ainda depende de alinhamento com o back.
 */

/** GET /cidades?nome= — retorna um array direto (sem envelope). */
export interface CidadeListItem {
  id: number
  nome: string
  estado?: {
    id: number
    nome: string
    sigla: string
  }
}

/** GET /usuarios?nome=&pagina=&limite= — retorna envelope com metadados. */
export interface UsuarioListItem {
  id: number
  nome: string
  email: string
}

export interface UsuariosListResponse {
  usuarios: UsuarioListItem[]
  metadados: {
    total: number
  }
}

/** Formato consumido pelos <Select> da tela. */
export interface SelectOption {
  value: number
  label: string
}
