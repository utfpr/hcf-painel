export function telefoneToFrontEnd(valor) {
    try {
        if (valor) {
            var aux = valor.match(/([0-9+]{3})(\d{2})(\d{4,5})(\d{4})$/);
            valor = " " + aux[1] + " " + aux[2] + " " + aux[3] + "-" + aux[4];
        }
        return valor;
    } catch (e) {
        console.error(e)
        return valor;
    }

}

export function telefoneToBackEnd(valor) {
    if (valor) {
        valor = valor.replace(/[^\d+]+/g, "")
    }
    return valor;
}
