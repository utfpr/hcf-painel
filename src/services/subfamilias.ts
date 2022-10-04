import axios from 'axios';

import TSubfamilia from '../sheets/familia.type';
import TResponseList from '../sheets/response.type';

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

const subfamiliaService = {
    getSubfamilias,
};

export default subfamiliaService;
