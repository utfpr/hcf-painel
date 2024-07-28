const decimalFormatter = new Intl.NumberFormat('pt-BR', { style: 'decimal' })

export function formatDecimal(value) {
    return decimalFormatter.format(value)
}

export default {}
