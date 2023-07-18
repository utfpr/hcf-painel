import especieService from '../../../services/especies'
import { RequestFn } from '../types'

const requestEspecies: RequestFn = async params => {
  const filters = {
    nome: params.text,
    familiaId: params.familiaId,
    generoId: params.generoId
  }
  const response = await especieService
    .getEspecies(params.page, params.limit, filters)
  return response.records.map(record => {
    return {
      key: record.id,
      label: record.nome,
      value: record.id
    }
  })
}

export default requestEspecies
