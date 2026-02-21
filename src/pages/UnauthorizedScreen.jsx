import React from 'react'

import { Result } from 'antd'
import { Link } from 'react-router-dom'

export default function UnauthorizedScreen() {
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
                title="Acesso negado"
                subTitle="Entre em contato com o administrador do sistema se acredita que isso é um erro."
                extra={<Link to="/">Voltar ao início</Link>}
            />
        </div>
    )
}
