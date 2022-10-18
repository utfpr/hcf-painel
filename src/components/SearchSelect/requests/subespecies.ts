import especieService from '../../../services/especies';
import { TRequestFn } from '../types';

const requestSubespecies: TRequestFn = async params => {
    const filters = {
        nome: params.text,
        familiaId: params.familiaId,
        generoId: params.generoId,
    };
    const response = await especieService
        .getSubespecies(params.page, params.limit, filters);
    return response.records.map(record => {
        return {
            key: record.id,
            label: record.nome,
            value: record.id,
        };
    });
};

export default requestSubespecies;
