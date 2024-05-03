import masker from 'vanilla-masker'

const padraoComVirgula = str => masker.toPattern(str, '99°99\'99,999"A')
const padraoSemVirgula = str => masker.toPattern(str, '999°99\'99"A')

export default value => {
    const sanitizedValue = value.replace(/[^0-9NSWO]+/g, '')

    if (/[0-9]/.test(sanitizedValue[6])) {
        return padraoComVirgula(value)
    }

    return padraoSemVirgula(sanitizedValue)
}
