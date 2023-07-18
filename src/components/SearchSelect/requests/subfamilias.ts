import familiaService from '../../../services/familias'
import { RequestFn } from '../types'

const requestSubfamilias: RequestFn = async params => {
  const response = await familiaService
    .getSubfamilias(params.page, params.limit, { nome: params.text, familiaId: params.familiaId })
  return response.records.map(record => {
    return {
      key: record.id,
      label: record.nome,
      value: record.id
    }
  })
}

export default requestSubfamilias
