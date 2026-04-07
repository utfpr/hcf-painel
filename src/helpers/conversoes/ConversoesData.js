import dayjs from 'dayjs'

export function formatarDataBRtoEN(valor) {
    if (valor) {
        if (valor.includes('/')) {
            return dayjs(valor, 'DD/MM/YYYY').format('YYYY-MM-DD')
        }
        if (valor.includes('-') && !(/[\d]{4}-[\d]{2}-[\d]{2}/i.test(valor))) {
            return dayjs(valor, 'DD-MM-YYYY').format('YYYY-MM-DD')
        }
    }
    return valor
}

export function formatarDataENtoBR(valor) {
    if (valor) {
        if (valor.includes('-')) {
            return dayjs(valor, 'YYYY-MM-DD').format('DD/MM/YYYY')
        }
        if (valor.includes('/')) {
            return dayjs(valor, 'YYYY/MM/DD').format('DD/MM/YYYY')
        }
    } else {
        return valor
    }
}

export function formatarDataBDtoDataHora(valor) {
    if (valor === null || valor === '') {
        return ''
    }

    return dayjs(valor).format('DD/MM/YYYY HH:mm')
}

export function formatarDataHoraBRtoBD(valor) {
    return dayjs(valor, 'DD/MM/YYYY HH:mm').toISOString()
}
