import familiaService from '../../../services/subfamilias';
import { TRequestFn } from '../types';

const searchFamilias: TRequestFn = async params => {
    const response = await familiaService
        .getSubfamilias(params.page, params.limit, { nome: params.text, familiaId: params.familiaId });
    return response.records.map(record => {
        return {
            key: record.id,
            label: record.nome,
            value: record.id,
        };
    });
};

export default searchFamilias;
