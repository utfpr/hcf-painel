import axios from 'axios';

const getTombos = async (
    page = 1,
    limit = 20,
    filters = null,
) => {
    let filtersCondition = [];
    if (filters) {
        const orWhere = [];
        const {
            hcf,
            nomesPopulares,
            nomeCientifico,
            // localColeta,
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
        filtersCondition = [
            {
                orWhere,
            },
        ];
    }

    try {
        const response = await axios.get('/tombos', {
            params: {
                orders: [['hcf', 'desc']],
                filters: filtersCondition,
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

const getDetailsTombo = async tomboId => {
    try {
        const response = await axios.get(`/tombos/${tomboId}`);
        return response.data;
    } catch (ex) {
        console.warn(ex);
        return null;
    }
};

const getCollectionDate = (dia, mes, ano) => {
    if (dia && mes && ano) return `${dia}/${mes}/${ano}`;
    if (mes && ano) return `${mes}/${ano}`;
    if (ano) return ano;

    return '';
};

const getDms = value => {
    const absValue = Math.abs(value);

    const valDeg = Math.floor(absValue);
    let result = `${valDeg}º`;

    const valMin = Math.floor((absValue - valDeg) * 60);
    result += `${valMin}'`;

    const valSec = Math.round((absValue - valDeg - valMin / 60) * 3600 * 1000) / 1000;
    result += `${valSec}"`;

    return result;
};

const decimalToDMS = (latitude, longitude) => {
    let latResult;
    let lngResult;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    latResult = getDms(lat);
    latResult += (lat >= 0) ? 'N' : 'S';
    lngResult = getDms(lng);
    lngResult += (lng >= 0) ? 'L' : 'O';

    return { latResult, lngResult };
};

export {
    getTombos,
    getDetailsTombo,
    getCollectionDate,
    decimalToDMS,
};
