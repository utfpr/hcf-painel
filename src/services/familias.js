import axios from 'axios';

const getFamilias = async (page = 1, limit = 20, filters = undefined) => {
    const filtersCondition = [];
    if (filters?.nome) {
        filtersCondition.push(['familias.nome', 'contains', filters.nome]);
    }

    try {
        const response = await axios.get('/familias', {
            params: {
                page,
                limit,
                filters: filtersCondition,
            },
        });
        return response.data;
    } catch (error) {
        console.warn(error);
        return [];
    }
};

const familiaService = {
    getFamilias,
};

export default familiaService;
