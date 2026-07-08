import { Skeleton, Table } from 'antd'
import { withTranslation } from 'react-i18next'

const TableColetaPorLocalData = ({ data, loading, t }) => {
    const columns = [
        {
            title: t('tableColetaPorLocalData:colData'),
            dataIndex: 'data',
            key: 'data'
        },
        {
            title: t('tableColetaPorLocalData:colFamilia'),
            dataIndex: 'familia',
            key: 'familia'
        },
        {
            title: t('tableColetaPorLocalData:colEspecie'),
            dataIndex: 'especie',
            key: 'especie'
        },
        {
            title: t('tableColetaPorLocalData:colAutor'),
            dataIndex: 'autor',
            key: 'autor'
        },
        {
            title: t('tableColetaPorLocalData:colTombo'),
            dataIndex: 'tombo',
            key: 'tombo'
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
        <Table dataSource={data} columns={columns} />
    )
}

export default withTranslation()(TableColetaPorLocalData)
