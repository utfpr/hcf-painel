import { Component } from 'react'

import { Table } from 'antd'

export default class SimpleTableComponent extends Component {
    constructor(props) {
        super(props)
        let paginacao = {}
        if (props.semPaginacao) {
            paginacao = false
        } else {
            paginacao = {
                total: 0,
                current: 1,
                defaultPageSize: props.pageSize || 20
            }
        }

        this.state = {
            filteredInfo: null,
            sortedInfo: null,
            paginacao
        }

        this.columns = this.buildColumns(props, this.state)
    }

    componentWillReceiveProps(props) {
        if (props.metadados) {
            this.setState({
                paginacao: {
                    total: props.metadados.total,
                    current: props.metadados.pagina,
                    defaultPageSize: props.metadados.limite
                }
            })
        }
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

    clearFilters = () => {
        this.setState({ filteredInfo: null })
    }

    buildColumns = props => props.columns.map(item => {
        let itemColumn = {}
        if (itemColumn.key !== 'acao') {
            itemColumn = {
                title: item.title,
                dataIndex: item.key,
                key: item.key
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

    render() {
        return (
            <Table
                columns={this.columns}
                dataSource={this.props.data}
                onChange={this.handleChange}
                pagination={this.state.paginacao}
                loading={this.props.loading}
                scroll={{ x: 800 }}
            />
        )
    }
}
