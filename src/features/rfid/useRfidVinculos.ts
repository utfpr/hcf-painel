import axios from 'axios'

import { RfidVinculo } from '@/components/rfid-conferencia/types'
import { useMutation } from '@/hooks/query/useMutation'
import { useQuery } from '@/hooks/query/useQuery'

export interface FiltrosVinculos {
  tombo_hcf?: string
  codigo_barra?: string
  epc?: string
  status?: string
}

interface VinculosResponse {
  dados: RfidVinculo[]
  meta: { pagina: number; limite: number; total: number }
}

export async function fetchVinculos(pagina: number, limite: number, filtros: FiltrosVinculos) {
  const response = await axios.get<VinculosResponse>('/rfids', {
    params: {
      pagina, limite, ...filtros
    }
  })
  return response.data
}

export function useRfidVinculos(pagina: number, limite: number, filtros: FiltrosVinculos) {
  return useQuery(
    () => fetchVinculos(pagina, limite, filtros),
    [
      '/rfids',
      pagina,
      limite,
      filtros
    ],
    { keepPreviousData: true }
  )
}

export function useDesvincularEtiqueta(id: number) {
  return useMutation(
    () => axios.delete(`/rfids/${id}`),
    [
      '/rfids',
      id,
      'delete'
    ]
  )
}
