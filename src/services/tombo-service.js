/* eslint-disable no-unused-vars */
import axios from 'axios';

const getTombos = async (
    page = 1,
    limit = 20,
    filters = {},
) => {
    const orWhere = [];
    const {
        hcf,
        nomesPopulares,
        nomeCientifico,
        localColeta,
    } = filters;
    if (nomesPopulares) {
        orWhere.push(['tombos.nomes_populares', 'contains', nomesPopulares]);
    }
    if (hcf) {
        orWhere.push(['tombos.hcf', 'eq', hcf]);
    }
    if (nomeCientifico) {
        orWhere.push(['tombos.nome_cientifico', 'contains', nomeCientifico]);
    }
    try {
        const response = await axios.get('/tombos', {
            params: {
                orders: [['hcf', 'desc']],
                filters: [
                    {
                        orWhere,
                    },
                ],
                limit,
                page,
            },
        });
        return response.data;
    } catch (ex) {
        console.warn(ex);
        return null;
    }
};

const getDetailsTombo = () => {

};

const getCollectionDate = (dia, mes, ano) => {
    if (dia && mes && ano) return `${dia}/${mes}/${ano}`;
    if (mes && ano) return `${mes}/${ano}`;
    if (ano) return ano;

    return '';
};

export {
    getTombos,
    getDetailsTombo,
    getCollectionDate,
};
