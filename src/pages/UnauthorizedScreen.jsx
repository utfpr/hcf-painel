import React from 'react'

import { Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function UnauthorizedScreen() {
    const { t } = useTranslation()

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                padding: '24px'
            }}
        >
            <Result
                status="403"
                title={t('unauthorized:acessoNegado')}
                subTitle={t('unauthorized:mensagemAcessoNegado')}
                extra={<Link to="/">{t('unauthorized:voltarAoInicio')}</Link>}
            />
        </div>
    )
}
