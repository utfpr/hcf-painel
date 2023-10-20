export default function converteDecimalParaGrausMinutosSegundos(gDec, x) {
    let graus
    let minutos
    let aux
    let segundos
    let milisegundos
    let direcao

    // Separa os graus
    graus = parseInt(gDec)

    // Pega a fração dos graus e converte em minutos
    aux = (graus - gDec) * 60
    minutos = parseInt(aux)

    // Pega a fração dos minutos e converte em segundos
    aux = (aux - minutos) * 60
    segundos = parseInt(aux)

    // Pega a fração dos segundos e converte em milisegundos
    milisegundos = parseInt((aux - segundos) * 60)

    // Essa parte eu verifico se é o eixo X ou Y para substituir o simbolo de negativo  pelas iniciais de norte ou sul para o eixo Y, leste ou oeste para o eixo X
    if (x) {
        // Eixo X
        if (graus < 0) direcao = 'W'
        else direcao = 'E'
    } else {
        // Eixo Y
        // eslint-disable-next-line no-lonely-if
        if (graus < 0) direcao = 'N'
        else direcao = 'S'
    }
    // Devolvo a string formatada, a função Math.abs é para retornar o valor absoluto // (retirar o valor negativo) já que estou usando a notação norte, sul, leste ou oeste
    // return Math.abs(graus) + "° " + minutos + "' " + segundos + "." + milisegundos + "'' " + direcao;
    // return `${}°${minutos}'${segundos},${milisegundos}"${direcao}`;
    return {
        graus: Math.abs(graus),
        minutos,
        segundos,
        direcao
    }
}
