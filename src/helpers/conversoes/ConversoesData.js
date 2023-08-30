import moment from 'moment';

export function formatarDataBRtoEN(valor) {
    if (valor) {
        if (valor.includes('/')) {
            return moment(valor, 'DD/MM/YYYY').format('YYYY-MM-DD');
        } else if (valor.includes('-') && !(/[\d]{4}-[\d]{2}-[\d]{2}/i.test(valor))) {
            return moment(valor, 'DD-MM-YYYY').format('YYYY-MM-DD');
        }
    }
    return valor;
}

export function formatarDataENtoBR(valor) {
    if (valor) {
        if (valor.includes('-')) {
            return moment(valor, 'YYYY-MM-DD').format('DD/MM/YYYY');
        } else if (valor.includes('/')) {
            return moment(valor, 'YYYY/MM/DD').format('DD/MM/YYYY');
        }
    } else {
        return valor;
    }
}

export function formatarDataBDtoDataHora(valor) {
    if (valor === null || valor === '') {
        return ''
    }

    return moment(valor, 'YYYY-MM-DDTHH:mm:sssZ')
        .format('DD/MM/YYYY HH:mm');
}

export function formatarDataHoraBRtoBD(valor) {
    return moment(valor, 'DD/MM/YYYY HH:mm')
        .format('YYYY-MM-DDTHH:mm:sssZ');
}

