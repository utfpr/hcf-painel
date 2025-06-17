import { Collapse, Skeleton, Table } from 'antd'

const columns = [
    {
        title: 'Gênero',
        dataIndex: 'genero',
        key: 'genero'
    },
    {
        title: 'Espécie',
        dataIndex: 'especie',
        key: 'especie'
    },
    {
        title: 'Quantidade',
        dataIndex: 'quantidade',
        key: 'quantidade'
    }
]

const TableCollapseParaGeneros = ({ data, loading }) => {
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
                <Collapse.Panel header={`${item.familia} (${item.total})`} key={item.familia}>
                    <Table dataSource={item.especies} columns={columns} />
                </Collapse.Panel>
            ))}
        </Collapse>
    )
}

export default TableCollapseParaGeneros
