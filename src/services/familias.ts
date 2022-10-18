import axios from 'axios';

import TFamilia from '../sheets/familia.type';
import TResponseList from '../sheets/response.type';
import TSubfamilia from '../sheets/subfamilia.type';

const getFamilias = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
    const filtersCondition = [];
    if (filters?.nome) {
        filtersCondition.push(['familias.nome', 'contains', filters.nome]);
    }

    try {
        const response = await axios.get<TResponseList<TFamilia>>('/familias', {
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

const getSubfamilias = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
    const filtersCondition = [];
    if (filters?.familiaId) {
        filtersCondition.push(['sub_familias.familia_id', 'eq', filters.familiaId]);
    }
    if (filters?.nome) {
        filtersCondition.push(['sub_familias.nome', 'contains', filters.nome]);
    }

    try {
        const response = await axios.get<TResponseList<TSubfamilia>>('/subfamilias', {
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

const familiaService = {
    getFamilias,
    getSubfamilias,
};

export default familiaService;
