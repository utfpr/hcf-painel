import familiaService from '../../../services/familias';
import { TRequestFn } from '../types';

const searchFamilias: TRequestFn = async params => {
    const response = await familiaService
        .getFamilias(params.page, params.limit, { nome: params.text });
    return response.records.map(record => {
        return {
            key: record.id,
            label: record.nome,
            value: record.id,
        };
    });
};

export default searchFamilias;
