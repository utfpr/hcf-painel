import { Collapse, Skeleton, Table } from 'antd'

const columns = [
    {
        title: 'Data',
        dataIndex: 'data',
        key: 'data'
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
        title: 'Tombo',
        dataIndex: 'tombo',
        key: 'tombo'
    }
]

const TableColetaPorLocalData = ({ data, loading }) => {
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
        <Table dataSource={data} columns={columns} />
    )
}

export default TableColetaPorLocalData
