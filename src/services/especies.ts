import axios from 'axios';

import TEspecie from '../sheets/especie.type';
import TResponseList from '../sheets/response.type';
import TSubespecie from '../sheets/subespecie.type';

const getEspecies = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
  const filtersCondition = [];
  if (filters?.familiaId) {
    filtersCondition.push(['especies.familia_id', 'eq', filters.familiaId]);
  }
  if (filters?.generoId) {
    filtersCondition.push(['especies.genero_id', 'eq', filters.generoId]);
  }
  if (filters?.nome) {
    filtersCondition.push(['especies.nome', 'contains', filters.nome]);
  }

  try {
    const response = await axios.get<TResponseList<TEspecie>>('/especies', {
      params: {
        page,
        limit,
        filters: filtersCondition,
      },
    });
    return response.data;
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

const getSubespecies = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
  const filtersCondition = [];
  if (filters?.familiaId) {
    filtersCondition.push(['especies.familia_id', 'eq', filters.familiaId]);
  }
  if (filters?.generoId) {
    filtersCondition.push(['especies.genero_id', 'eq', filters.generoId]);
  }
  if (filters?.nome) {
    filtersCondition.push(['especies.nome', 'contains', filters.nome]);
  }

  try {
    const response = await axios.get<TResponseList<TSubespecie>>('/subespecies', {
      params: {
        page,
        limit,
        filters: filtersCondition,
      },
    });
    return response.data;
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

const generoService = {
  getEspecies,
  getSubespecies,
};

export default generoService;
