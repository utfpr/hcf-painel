import { Collapse, Skeleton, Table } from 'antd'

const columns = [
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
        key: 'especie'
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

const TableCollapseParaLocais = ({ data, loading }) => {
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
            Tocantins: 'TO'
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
                    header={`${item.local} (${item.municipio}/${getSiglaEstado(item.estado)})`}
                    key={`${item.local}-${item.municipio}-${item.estado}`}
                >
                    <Table
                        dataSource={item.registros.map(registro => {
                            const [latitude, longitude] = registro?.coordenadasFormatadas?.split(',') || []
                            const dataColeta = `${registro.data_coleta_dia}/${mesesRomanos[registro.data_coleta_mes - 1]}/${registro.data_coleta_ano}`
                            return {
                                ...registro,
                                latitude: latitude ? latitude.trim() : null,
                                longitude: longitude ? longitude.trim() : null,
                                datacoleta: dataColeta,
                                familia: registro?.familia?.nome || '-',
                                especie: registro?.especy?.nome || '-'
                            }
                        })}
                        columns={columns}
                    />
                </Collapse.Panel>
            ))}
        </Collapse>
    )
}

export default TableCollapseParaLocais
