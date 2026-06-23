import { Collapse, Skeleton, Table } from 'antd'
import { useTranslation } from 'react-i18next'

const TableCollapseParaGeneros = ({ data, loading, modelo = 1 }) => {
    const { t } = useTranslation()

    const columns = [
        {
            title: t('relatorioFamiliasGenero:colunaGenero'),
            dataIndex: 'genero',
            key: 'genero'
        },
        {
            title: t('relatorioFamiliasGenero:colunaEspecie'),
            dataIndex: 'especie',
            key: 'especie'
        },
        {
            title: t('relatorioFamiliasGenero:colunaQuantidade'),
            dataIndex: 'quantidade',
            key: 'quantidade'
        }
    ]

    const columns2 = [
        {
            title: t('relatorioFamiliasGenero:colunaNome'),
            dataIndex: 'nome',
            key: 'nome'
        },
        {
            title: t('relatorioFamiliasGenero:colunaQuantidade'),
            dataIndex: 'quantidade',
            key: 'quantidade'
        }
    ]

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

    return (
        <Collapse bordered={false}>
            {data.map(item => (
                <Collapse.Panel header={`${item.familia} (${modelo === 1 ? item.total : item.generos.reduce((acc, curr) => acc + curr.quantidade, 0)})`} key={item.familia}>
                    { modelo === 1
                        ? <Table dataSource={item.especies} columns={columns} />
                        : <Table dataSource={item.generos} columns={columns2} />}
                </Collapse.Panel>
            ))}
        </Collapse>
    )
}

export default TableCollapseParaGeneros
