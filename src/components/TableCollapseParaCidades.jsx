import { Collapse, Skeleton, Table } from 'antd'

import converteDecimalParaGrausMinutosSegundos from '@/helpers/conversoes/Coordenadas'

const columnsWithCoordenadas = [
    {
        title: 'Data Coleta',
        dataIndex: 'datacoleta',
        key: 'datacoleta'
    },
    {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia'
    },
    {
        title: 'Espécie',
        dataIndex: 'especie',
        key: 'especie',
        render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <p style={{ fontStyle: 'italic', margin: 0 }}>{record?.especie}</p>
                <p style={{ margin: 0 }}>{record?.autor}</p>
            </div>
        ) || '-'
    },
    {
        title: 'Latitude',
        dataIndex: 'latitude',
        key: 'latitude'
    },
    {
        title: 'Longitude',
        dataIndex: 'longitude',
        key: 'longitude'
    },
    {
        title: 'Nº Tombo',
        dataIndex: 'hcf',
        key: 'hcf'
    }
]

const columnsWithoutCoordenadas = [
    {
        title: 'Data Coleta',
        dataIndex: 'datacoleta',
        key: 'datacoleta'
    },
    {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia'
    },
    {
        title: 'Espécie',
        dataIndex: 'especie',
        key: 'especie',
        render: (text, record) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <p style={{ fontStyle: 'italic', margin: 0 }}>{record?.especie}</p>
                <p style={{ margin: 0 }}>{record?.autor}</p>
            </div>
        ) || '-'
    },
    {
        title: 'Nº Tombo',
        dataIndex: 'hcf',
        key: 'hcf'
    }
]

const TableCollapseParaCidades = ({ data, loading, showCoordenadas }) => {
    if (!data) return <div />
    if (data.length === 0) return <div />
    if (loading) {
        return (
            [...Array(5).keys()].map(i => (
                <div key={i}>
                    <Skeleton.Button active size="small" />
                    <div style={{ marginTop: 10, marginLeft: 10, display: 'flex' }}>
                        <Skeleton.Button active size="small" />
                        <Skeleton active size="small" style={{ marginLeft: 10 }} />
                    </div>
                </div>
            ))
        )
    }

    const getSiglaEstado = estado => {
        const estados = {
            Acre: 'AC',
            Alagoas: 'AL',
            Amapá: 'AP',
            Amazonas: 'AM',
            Bahia: 'BA',
            Ceará: 'CE',
            'Distrito Federal': 'DF',
            'Espírito Santo': 'ES',
            Goiás: 'GO',
            Maranhão: 'MA',
            'Mato Grosso': 'MT',
            'Mato Grosso do Sul': 'MS',
            'Minas Gerais': 'MG',
            Pará: 'PA',
            Paraíba: 'PB',
            Paraná: 'PR',
            Pernambuco: 'PE',
            Piauí: 'PI',
            'Rio de Janeiro': 'RJ',
            'Rio Grande do Norte': 'RN',
            'Rio Grande do Sul': 'RS',
            Rondônia: 'RO',
            Roraima: 'RR',
            'Santa Catarina': 'SC',
            'São Paulo': 'SP',
            Sergipe: 'SE',
            Tocantins: 'TO',
            desconhecido: 'desconhecido'
        }
        return estados[estado] || estado
    }

    const mesesRomanos = [
        'I', 'II', 'III', 'IV', 'V', 'VI',
        'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
    ]

    return (
        <Collapse bordered={false}>
            {data.map(item => (
                <Collapse.Panel
                    header={`${item.municipio}/${getSiglaEstado(item.estado)}`}
                    key={`${item.municipio}-${item.estado}`}
                >
                    <Table
                        dataSource={item.registros.map(registro => {
                            let dataColeta = ''
                            if (registro.data_coleta_dia !== null && registro.data_coleta_dia !== undefined) {
                                dataColeta = String(registro.data_coleta_dia).padStart(2, '0')
                            }
                            if (registro.data_coleta_mes !== null && registro.data_coleta_mes !== undefined) {
                                if (dataColeta) dataColeta += '/'
                                dataColeta += mesesRomanos[registro.data_coleta_mes - 1]
                            }
                            if (registro.data_coleta_ano !== null && registro.data_coleta_ano !== undefined) {
                                if (dataColeta) dataColeta += '/'
                                dataColeta += registro.data_coleta_ano
                            }
                            return {
                                ...registro,
                                latitude: registro.latitude ? converteDecimalParaGrausMinutosSegundos(registro.latitude, false, true) : null,
                                longitude: registro.longitude ? converteDecimalParaGrausMinutosSegundos(registro.longitude, false, true) : null,
                                datacoleta: dataColeta,
                                familia: registro?.familia?.nome || '-',
                                especie: registro?.especy?.nome || '-'
                            }
                        })}
                        columns={showCoordenadas ? columnsWithCoordenadas : columnsWithoutCoordenadas}
                    />
                </Collapse.Panel>
            ))}
        </Collapse>
    )
}

export default TableCollapseParaCidades
