import { useTranslation } from 'react-i18next'

import { formatDecimal } from '@/helpers/mascaras/numeros'

function TotalRecordsFound({
    total
}) {
    const { t } = useTranslation()
    const totalSanitized = Number.isNaN(Number(total)) ? 0 : total
    return (
        <span>
            {t('totalRecordsFound:found', { count: totalSanitized })}
        </span>
    )
}

export default TotalRecordsFound
