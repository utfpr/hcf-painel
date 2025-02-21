export function telefoneToFrontEnd(valor) {
    try {
        if (valor) {
            const aux = valor.match(/([0-9+]{3})(\d{2})(\d{4,5})(\d{4})$/)
            // eslint-disable-next-line no-param-reassign
            valor = ` ${aux[1]} ${aux[2]} ${aux[3]}-${aux[4]}`
        }
        return valor
    } catch (e) {
        console.error(e)
        return valor
    }
}

export function telefoneToBackEnd(valor) {
    if (valor) {
        // eslint-disable-next-line no-param-reassign
        valor = valor.replace(/[^\d+]+/g, '')
    }
    return valor
}
