import { Collapse, Skeleton, Table } from 'antd'
import { useTranslation } from 'react-i18next'

const TableCollapse = ({ data, loading }) => {
    const { t } = useTranslation()

    const columns = [
        {
            title: t('relatorioInventarioEspecies:especie'),
            dataIndex: 'especie',
            key: 'especie'
        },
        {
            title: t('relatorioInventarioEspecies:tombosRelacionados'),
            dataIndex: 'tombos',
            key: 'tombos'
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
                <Collapse.Panel header={item.familia} key={item.familia}>
                    <Table dataSource={item.especies} columns={columns} />
                </Collapse.Panel>
            ))}
        </Collapse>
    )
}

export default TableCollapse
