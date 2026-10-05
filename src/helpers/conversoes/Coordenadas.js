export default function converteDecimalParaGrausMinutosSegundos(gDec, x, formatada) {
    const sinal = gDec < 0 ? -1 : 1
    const abs = Math.abs(gDec)

    let graus = Math.floor(abs)
    const minutosDecimal = (abs - graus) * 60
    let minutos = Math.floor(minutosDecimal)
    const segundosRaw = (minutosDecimal - minutos) * 60

    // Arredonda para 2 casas decimais e propaga carry se segundos >= 60
    // (evita exibição de "60.00" causada por erro de ponto flutuante)
    let segundos = Math.round(segundosRaw * 100) / 100
    if (segundos >= 60) {
        segundos = 0
        minutos += 1
    }
    if (minutos >= 60) {
        minutos = 0
        graus += 1
    }

    let direcao
    if (x) {
        // Eixo X (longitude)
        direcao = sinal < 0 ? 'W' : 'E'
    } else {
        // Eixo Y (latitude)
        direcao = sinal < 0 ? 'S' : 'N'
    }

    const segundosStr = segundos.toFixed(2).replace('.', ',')

    if (formatada) {
        return `${graus}°${minutos}'${segundosStr}"${direcao}`
    }

    return {
        graus,
        minutos,
        segundos: segundosStr,
        direcao
    }
}
