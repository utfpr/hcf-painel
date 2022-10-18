import generoService from '../../../services/generos';
import { TRequestFn } from '../types';

const requestGeneros: TRequestFn = async params => {
  const response = await generoService
    .getGeneros(params.page, params.limit, { nome: params.text, familiaId: params.familiaId });
  return response.records.map(record => {
    return {
      key: record.id,
      label: record.nome,
      value: record.id,
    };
  });
};

export default requestGeneros;
