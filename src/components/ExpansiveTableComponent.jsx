import { Component } from 'react'

import { Table } from 'antd'

export default class ExpansiveTableComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            pagina: {
                total: 0,
                current: 1,
                defaultPageSize: 10
            }
        }

        this.columns = this.buildColumns(props, this.state)
    }

    componentWillReceiveProps(props) {
        if (props.metadados) {
            this.setState({
                pagina: {
                    total: props.metadados.total,
                    current: props.metadados.pagina,
                    defaultPageSize: props.metadados.limite
                }
            })
        }
    }

    buildColumns = (props, state) => {
        let { sortedInfo } = state
        sortedInfo = sortedInfo || {}

        return props.columns.map(item => {
            let itemColumn = {}
            if (itemColumn.key !== 'acao') {
                itemColumn = {
                    title: item.title,
                    dataIndex: item.key,
                    key: item.key,
                    sortOrder: sortedInfo.columnKey === item.key && sortedInfo.order
                }
                if (item.type === 'text') {
                    itemColumn.sorter = (a, b) => a.name.length - b.name.length
                } else if (item.type === 'number') {
                    itemColumn.sorter = (a, b) => a.hcf - b.hcf
                }
            } else {
                itemColumn = {
                    title: item.title,
                    dataIndex: item.key,
                    key: item.key
                }
            }
            return itemColumn
        })
    }

    handleChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination }
        pager.current = pagination.current

        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
            pagina: pager
        })

        this.props.changePage(pagination.current, pagination.pageSize)
    }

    renderSubdados = dados => dados.map(item => (
        <Table
            columns={this.props.subColumns}
            dataSource={item.subdata}
            pagination={false}
        />
    ))

    render() {
        return (
            <Table
                className="components-table-demo-nested"
                columns={this.columns}
                dataSource={this.props.data}
                onChange={this.handleChange}
                pagination={this.state.pagina}
                loading={this.props.loading}
                scroll={{ x: 800 }}
                expandedRowRender={record => {
                    return (
                        <Table
                            columns={this.props.subColumns}
                            dataSource={record.subdata}
                            pagination={false}
                        />
                    )
                }}
            />
        )
    }
}
