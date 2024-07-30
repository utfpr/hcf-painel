import { formatDecimal } from '@/helpers/mascaras/numeros'

function TotalRecordsFound({
    total
}) {
    const totalSanitized = Number.isNaN(Number(total)) ? 0 : total
    const labelPrefix = totalSanitized === 1
        ? 'Foi encontrado'
        : 'Foram encontrados'
    const labelSufix = totalSanitized === 1
        ? 'registro.'
        : 'registros.'
    return (
        <span>
            {`${labelPrefix} ${formatDecimal(totalSanitized)} ${labelSufix}`}
        </span>
    )
}

export default TotalRecordsFound
