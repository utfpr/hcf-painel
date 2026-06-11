import { Component } from 'react'

import { Table } from 'antd'

import i18n from '@/i18n'
const t = i18n.t

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

    UNSAFE_componentWillReceiveProps(props) {
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
            <>
                {this.state.isLoaded && (
                    <Table
                        columns={this.columns}
                        dataSource={this.props.data}
                        onChange={this.handleChange}
                        pagination={{
                            ...this.state.paginacao,
                            locale: {
                                items_per_page: `/ ${t('simpleTableComponent:pagina')}`,
                                jump_to: t('simpleTableComponent:irPara'),
                                jump_to_confirm: t('simpleTableComponent:irParaConfirmar'),
                                page: t('simpleTableComponent:pagina'),
                                prev_page: t('simpleTableComponent:paginaAnterior'),
                                next_page: t('simpleTableComponent:proximaPagina'),
                                prev_5: t('simpleTableComponent:voltar5Paginas'),
                                next_5: t('simpleTableComponent:avancar5Paginas'),
                                prev_3: t('simpleTableComponent:voltar3Paginas'),
                                next_3: t('simpleTableComponent:avancar3Paginas')
                            },
                            showSizeChanger: true
                        }}
                        loading={this.props.loading}
                        scroll={{ x: 800 }}
                        locale={{
                            triggerDesc: t('simpleTableComponent:ordenacaoDecrescente'),
                            triggerAsc: t('simpleTableComponent:ordenacaoCrescente'),
                            cancelSort: t('simpleTableComponent:cancelarOrdenacao')
                        }}
                    />
                )}
            </>
        )
    }
}
