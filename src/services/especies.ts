import axios from 'axios'

import Especie from '../sheets/especie.type'
import ResponseList from '../sheets/response.type'
import Subespecie from '../sheets/subespecie.type'

const getEspecies = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
  const filtersCondition = []
  if (filters?.familiaId) {
    filtersCondition.push(['especies.familia_id', 'eq', filters.familiaId])
  }
  if (filters?.generoId) {
    filtersCondition.push(['especies.genero_id', 'eq', filters.generoId])
  }
  if (filters?.nome) {
    filtersCondition.push(['especies.nome', 'contains', filters.nome])
  }

  try {
    const response = await axios.get<ResponseList<Especie>>('/especies', {
      params: {
        page,
        limit,
        filters: filtersCondition
      }
    })
    return response.data
  } catch (error) {
    console.warn(error)
    throw error
  }
}

const getSubespecies = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
  const filtersCondition = []
  if (filters?.familiaId) {
    filtersCondition.push(['especies.familia_id', 'eq', filters.familiaId])
  }
  if (filters?.generoId) {
    filtersCondition.push(['especies.genero_id', 'eq', filters.generoId])
  }
  if (filters?.nome) {
    filtersCondition.push(['especies.nome', 'contains', filters.nome])
  }

  try {
    const response = await axios.get<ResponseList<Subespecie>>('/subespecies', {
      params: {
        page,
        limit,
        filters: filtersCondition
      }
    })
    return response.data
  } catch (error) {
    console.warn(error)
    throw error
  }
}

const generoService = {
  getEspecies,
  getSubespecies
}

export default generoService
