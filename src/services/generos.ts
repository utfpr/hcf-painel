import axios from 'axios';

import TGenero from '../sheets/genero.type';
import TResponseList from '../sheets/response.type';

const getGeneros = async (page = 1, limit = 20, filters: Record<string, unknown> | undefined = undefined) => {
    const filtersCondition = [];
    if (filters?.familiaId) {
        filtersCondition.push(['generos.familia_id', 'eq', filters.familiaId]);
    }
    if (filters?.nome) {
        filtersCondition.push(['generos.nome', 'contains', filters.nome]);
    }

    try {
        const response = await axios.get<TResponseList<TGenero>>('/generos', {
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
    getGeneros,
};

export default generoService;
