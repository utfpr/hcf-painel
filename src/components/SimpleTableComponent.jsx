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
            paginacao,
            isLoaded: false
        }

        this.columns = this.buildColumns(props, this.state)
    }

    componentWillReceiveProps(props) {
        if (props.metadados) {
            this.setState({
                paginacao: {
                    total: props.metadados.total ?? 0,
                    current: props.metadados.pagina,
                    defaultPageSize: props.metadados.limite
                }
            })
        }
    }

    componentDidMount() {
        if (this.props.metadados) {
            this.setState({
                paginacao: {
                    total: this.props.metadados.total,
                    current: this.props.metadados.pagina,
                    defaultPageSize: this.props.metadados.limite
                }
            })
        }

        setTimeout(() => {
            this.setState({ isLoaded: true })
        }, 100)
    }

    handleChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination }
        pager.current = pagination.current

        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
            paginacao: pager
        })

        const page = this.state.sortedInfo?.order !== sorter?.order || this.state.sortedInfo?.field !== sorter?.field ? 1 : pagination.current

        this.props.changePage(page, pagination.pageSize, sorter)
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
                key: item.key,
                width: item?.width,
                sorter: item.sorter
            }
        } else {
            itemColumn = {
                title: item.title,
                dataIndex: item.key,
                key: item.key,
                width: item?.width,
                sorter: item.sorter
            }
        }

        return itemColumn
    })

    render() {
        return (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
                {this.state.isLoaded && (
                    <Table
                        columns={this.columns}
                        dataSource={this.props.data}
                        onChange={this.handleChange}
                        pagination={{
                            ...this.state.paginacao,
                            locale: {
                                items_per_page: '/ página',
                                jump_to: 'Ir para',
                                jump_to_confirm: 'confirmar',
                                page: 'página',
                                prev_page: 'Página anterior',
                                next_page: 'Próxima página',
                                prev_5: 'Voltar 5 páginas',
                                next_5: 'Avançar 5 páginas',
                                prev_3: 'Voltar 3 páginas',
                                next_3: 'Avançar 3 páginas'
                            },
                            showSizeChanger: true
                        }}
                        loading={this.props.loading}
                        scroll={{ x: 800 }}
                        locale={{
                            triggerDesc: 'Clique para ordenar decrescente',
                            triggerAsc: 'Clique para ordenar crescente',
                            cancelSort: 'Cancelar ordenação'
                        }}
                    />
                )}
            </>
        )
    }
}
