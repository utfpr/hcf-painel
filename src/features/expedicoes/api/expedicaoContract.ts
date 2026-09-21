/**
 * PONTO ÚNICO DE ACOPLAMENTO COM A API DE EXPEDIÇÕES.
 *
 * ⚠️ O contrato de criação de expedições AINDA NÃO FOI ALINHADO com o time de
 * back-end (responsável: Eduardo Tyio). Enquanto o alinhamento não acontece,
 * nada fora deste arquivo conhece nomes de campos, formato de data ou a URL do
 * endpoint.
 *
 * Quando o contrato for definido, SÓ ESTE ARQUIVO precisa mudar:
 *   1. ajustar `CreateExpedicaoPayload` para os nomes/tipos reais;
 *   2. ajustar `toCreateExpedicaoPayload` (serialização de data e participantes);
 *   3. ajustar `EXPEDICOES_ENDPOINT` se a rota for diferente;
 *   4. trocar `CONTRATO_ALINHADO` para `true`.
 *
 * Os valores abaixo são uma HIPÓTESE derivada das migrations da branch
 * `532-cadastro-expedicoes` do hcf-api (tabelas `expedicoes`,
 * `expedicoes_participantes`) e NÃO devem ser tratados como definitivos.
 */

import type { Dayjs } from 'dayjs'

/** Enquanto `false`, o submit não dispara POST — ver `useNovaExpedicaoPage`. */
export const CONTRATO_ALINHADO = false

export const EXPEDICOES_ENDPOINT = '/expedicoes'

/** Hipótese de payload. Confirmar com o back antes de considerar estável. */
export interface CreateExpedicaoPayload {
  data_inicio: string
  data_fim?: string
  cidade_id: number
  descricao: string
  participantes: number[]
}

/** Valores que a tela produz. Este formato é NOSSO e não muda com a API. */
export interface NovaExpedicaoFormValues {
  dataInicio: Dayjs
  dataFim?: Dayjs
  destino: number
  descricao: string
  participantes: number[]
}

/**
 * Adapter entre o formulário e a API.
 * Formato de data assumido: ISO 8601 com offset. Confirmar com o back.
 */
export function toCreateExpedicaoPayload(
  values: NovaExpedicaoFormValues
): CreateExpedicaoPayload {
  return {
    data_inicio: values.dataInicio.toISOString(),
    data_fim: values.dataFim ? values.dataFim.toISOString() : undefined,
    cidade_id: values.destino,
    descricao: values.descricao.trim(),
    participantes: values.participantes
  }
}
