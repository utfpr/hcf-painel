import { Collapse, Skeleton, Table, Tag } from 'antd'

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

    const montaDataSource = registros => registros.map(registro => {
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
            key: registro.hcf,
            latitude: registro.latitude ? converteDecimalParaGrausMinutosSegundos(registro.latitude, false, true) : null,
            longitude: registro.longitude ? converteDecimalParaGrausMinutosSegundos(registro.longitude, false, true) : null,
            datacoleta: dataColeta,
            familia: registro?.familia?.nome || '-',
            especie: ((registro?.genero?.nome || '') + ' ' + (registro?.especy?.nome || registro?.especie?.nome || '')).trim() || '-',
            autor: registro?.especy?.autor?.nome || registro?.especie?.autor?.nome || ''
        }
    })

    // agrupa a lista plana de cidades por estado
    const estadosMap = {}
    data.forEach(item => {
        const estadoNome = item.estado || 'Desconhecido'
        if (!estadosMap[estadoNome]) {
            estadosMap[estadoNome] = {
                estado: estadoNome,
                sigla: item.estadoSigla || getSiglaEstado(estadoNome),
                cidades: []
            }
        }
        estadosMap[estadoNome].cidades.push(item)
    })

    // ordena estados em ordem alfabética e, dentro de cada estado, as cidades em ordem alfabética
    const estados = Object.values(estadosMap)
        .sort((a, b) => a.estado.localeCompare(b.estado, 'pt-BR'))
        .map(estado => ({
            ...estado,
            cidades: [...estado.cidades].sort((a, b) => (a.municipio || '').localeCompare(b.municipio || '', 'pt-BR'))
        }))

    return (
        <Collapse bordered={false}>
            {estados.map(estado => {
                const totalTombos = estado.cidades.reduce((acc, c) => acc + (c.registros?.length || 0), 0)
                return (
                    <Collapse.Panel
                        header={`${estado.estado} (${estado.sigla})`}
                        key={estado.estado}
                        extra={<Tag>{`${totalTombos} tombo(s)`}</Tag>}
                    >
                        <Collapse bordered={false}>
                            {estado.cidades.map(item => (
                                <Collapse.Panel
                                    header={item.municipio}
                                    key={`${item.municipio}-${item.estado}`}
                                    extra={<Tag>{`${item.registros?.length || 0} tombo(s)`}</Tag>}
                                >
                                    <Table
                                        dataSource={montaDataSource(item.registros)}
                                        columns={showCoordenadas ? columnsWithCoordenadas : columnsWithoutCoordenadas}
                                    />
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </Collapse.Panel>
                )
            })}
        </Collapse>
    )
}

export default TableCollapseParaCidades
