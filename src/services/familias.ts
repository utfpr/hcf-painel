import axios from 'axios';

import TFamilia from '../sheets/familia.type';
import TResponseList from '../sheets/response.type';

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

const familiaService = {
    getFamilias,
};

export default familiaService;
