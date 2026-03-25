import React, { Component } from 'react'

import {
    Card, Col, Row, Input, Button, Divider, notification, Modal, Spin, Select
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router'

import TotalRecordsFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next'

import HeaderListComponent from '../components/HeaderListComponent'
import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'
import SelectedFormField from './tombos/components/SelectedFormFiled'

const { confirm } = Modal
const { Option } = Select
const FormItem = Form.Item

class ListaLocaisColeta extends Component {
    constructor(props) {
        super(props)
        this.state = {
            locais: [],
            metadados: {},
            loading: true,
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            titulo: props.t('common:cadastrar'),
            id: -1,
            valores: {},
            paises: [],
            estados: [],
            cidades: [],
            paisSelecionado: null,
            estadoSelecionado: null,
            cidadeSelecionada: null,
            nomeLocal: '',
            fetchingPaises: false,
            fetchingEstados: false,
            fetchingCidades: false
        }
    }

    async componentDidMount() {
        this.requisitaListaLocais({}, this.state.pagina)
        await this.requisitaPaises()
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaPaises = async (searchText = '') => {
        this.setState({ fetchingPaises: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/paises', { params })

            if (response.status === 200) {
                this.setState({
                    paises: response.data,
                    fetchingPaises: false
                })
            }
        } catch (err) {
            this.setState({ fetchingPaises: false })
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroBuscarPaises'))
        }
    }

    requisitaEstados = async (searchText = '', paisId = null) => {
        this.setState({ fetchingEstados: true })

        try {
            const params = {
                ...(paisId ? { pais_id: paisId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/estados', { params })

            if (response.status === 200) {
                this.setState({
                    estados: response.data,
                    fetchingEstados: false
                })
            }
        } catch (err) {
            this.setState({ fetchingEstados: false })
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroBuscarEstados'))
        }
    }

    requisitaCidades = async (searchText = '', estadoId = null) => {
        this.setState({ fetchingCidades: true })

        try {
            const params = {
                ...(estadoId ? { estado_id: estadoId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/cidades', { params })

            if (response.status === 200) {
                this.setState({
                    cidades: response.data,
                    fetchingCidades: false
                })
            }
        } catch (err) {
            this.setState({ fetchingCidades: false })
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroBuscarCidades'))
        }
    }

    formataDadosLocais = locais => locais.map(item => ({
        key: item.id,
        nome: item.descricao,
        pais: item.cidade?.estado?.paise?.nome || '',
        estado: item.cidade?.estado?.nome || '',
        cidade: item.cidade?.nome || '',
        acao: this.gerarAcao(item.id)
    }))

    gerarAcao = id => {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <a href="#" onClick={() => this.editarLocal(id)}>
                        <EditOutlined style={{ color: '#FFCC00' }} />
                    </a>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                        <DeleteOutlined style={{ color: '#e30613' }} />
                    </a>
                </span>
            )
        }
        return null
    }

    editarLocal = async id => {
        try {
            const response = await axios.get(`/locais-coleta/${id}`)

            if (response.status === 200) {
                const local = response.data
                const paisId = local.cidade.estado.paise.id
                const estadoId = local.cidade.estado.id

                await this.requisitaEstados('', paisId)
                await this.requisitaCidades('', estadoId)

                this.setState({
                    visibleModal: true,
                    titulo: this.props.t('common:atualizar'),
                    id: local.id,
                    nomeLocal: local.descricao,
                    paisSelecionado: paisId,
                    estadoSelecionado: estadoId,
                    cidadeSelecionada: local.cidade.id
                })

                this.props.form.setFieldsValue({
                    nomeLocalModal: local.descricao,
                    paisModal: paisId,
                    estadoModal: estadoId,
                    cidadeModal: local.cidade.id
                })
            }
        } catch (err) {
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroBuscarDadosLocal'))
        }
    }

    requisitaListaLocais = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const { pais, estado, cidade, descricao } = valores

            if (descricao) {
                params.descricao = descricao
            }
            if (cidade) {
                params.cidade_id = cidade
            } else if (estado) {
                params.estado_id = estado
            } else if (pais) {
                params.pais_id = pais
            }
        }

        const campo = sorter && sorter.field ? sorter.field : 'descricao'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
        params.order = `${campo}:${ordem}`

        try {
            const response = await axios.get('/locais-coleta', { params })

            if (response.status === 200) {
                this.setState({
                    locais: this.formataDadosLocais(response.data.resultado),
                    metadados: response.data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaLocalColetaScreen:notifBuscarLocais'), this.props.t('listaLocalColetaScreen:erroBuscarLocais'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroServidorBuscarLocais'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaLocalColetaScreen:erroBuscarLocaisFalha'))
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaLocais(valores, 1)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastraNovoLocal = async () => {
        this.setState({ loadingModal: true })

        const { nomeLocal, cidadeSelecionada } = this.state

        try {
            const response = await axios.post('/locais-coleta', {
                descricao: nomeLocal,
                cidade_id: cidadeSelecionada
            })

            if (response.status === 204) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('listaLocalColetaScreen:localCadastrado'))
            }
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('listaLocalColetaScreen:erroCadastrarLocal'))
        } finally {
            this.setState({ loadingModal: false })
            this.limparCamposModal()
        }
    }

    atualizaLocal = async () => {
        this.setState({ loadingModal: true })

        const { id, nomeLocal, cidadeSelecionada } = this.state

        try {
            const response = await axios.put(`/locais-coleta/${id}`, {
                descricao: nomeLocal,
                cidade_id: cidadeSelecionada
            })

            if (response.status === 200) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('listaLocalColetaScreen:localAtualizado'))
            }
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('listaLocalColetaScreen:erroAtualizarLocal'))
        } finally {
            this.setState({ loadingModal: false })
            this.limparCamposModal()
        }
    }

    requisitaExclusao = async id => {
        try {
            const response = await axios.delete(`/locais-coleta/${id}`)

            if (response.status === 204) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', this.props.t('listaLocalColetaScreen:notifExcluirLocal'), this.props.t('listaLocalColetaScreen:localExcluido'))
            }
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('listaLocalColetaScreen:erroExcluirLocal'))
        }
    }

    mostraMensagemDelete = id => {
        confirm({
            title: this.props.t('listaLocalColetaScreen:confirmExcluirTitulo'),
            content: this.props.t('listaLocalColetaScreen:confirmExcluirConteudo'),
            okText: this.props.t('common:sim'),
            okType: 'danger',
            cancelText: this.props.t('common:nao'),
            onOk: () => {
                this.requisitaExclusao(id)
            }
        })
    }

    limparCamposModal = () => {
        this.setState({
            nomeLocal: '',
            paisSelecionado: null,
            estadoSelecionado: null,
            cidadeSelecionada: null,
            estados: [],
            cidades: []
        })
        this.props.form.setFieldsValue({
            nomeLocalModal: undefined,
            paisModal: undefined,
            estadoModal: undefined,
            cidadeModal: undefined
        })
    }

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={async () => {
                        await this.requisitaPaises()
                        this.setState({
                            visibleModal: true,
                            titulo: this.props.t('common:cadastrar'),
                            id: -1
                        })
                        this.limparCamposModal()
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    {this.props.t('common:adicionar')}
                </Button>
            )
        }
        return null
    }

    renderPainelBusca = getFieldDecorator => {
        const { t } = this.props
        const { paises, estados, cidades, fetchingPaises, fetchingEstados, fetchingCidades } = this.state
        const paisSelecionadoBusca = this.props.form.getFieldValue('pais')
        const estadoSelecionadoBusca = this.props.form.getFieldValue('estado')

        return (
            <Card title={t('listaLocalColetaScreen:buscarLocal')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={[8, 20]}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <FormItem label={t('listaLocalColetaScreen:labelNomeLocal')}>
                                {getFieldDecorator('descricao')(
                                    <Input
                                        placeholder={t('listaLocalColetaScreen:placeholderNomeLocal')}
                                        allowClear
                                    />
                                )}
                            </FormItem>
                        </Col>

                        <SelectedFormField
                            title={t('listaLocalColetaScreen:labelPais')}
                            placeholder={t('listaLocalColetaScreen:placeholderPais')}
                            fieldName="pais"
                            getFieldDecorator={getFieldDecorator}
                            onSearch={searchText => {
                                this.requisitaPaises(searchText || '')
                            }}
                            onChange={value => {
                                this.props.form.setFieldsValue({
                                    estado: undefined,
                                    cidade: undefined
                                })
                                this.setState({
                                    estados: [],
                                    cidades: []
                                })
                                if (value) {
                                    this.requisitaEstados('', value)
                                }
                            }}
                            others={{
                                loading: fetchingPaises,
                                notFoundContent: fetchingPaises ? <Spin size="small" /> : t('common:nenhumResultadoEncontrado'),
                                allowClear: true
                            }}
                            debounceDelay={200}
                            xs={24}
                            sm={24}
                            md={8}
                            lg={8}
                            xl={8}
                        >
                            {paises.map(item => (
                                <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                            ))}
                        </SelectedFormField>

                        <SelectedFormField
                            title={t('listaLocalColetaScreen:labelEstado')}
                            placeholder={paisSelecionadoBusca ? t('listaLocalColetaScreen:placeholderEstado') : t('listaLocalColetaScreen:placeholderEstadoAntes')}
                            fieldName="estado"
                            getFieldDecorator={getFieldDecorator}
                            disabled={false}
                            onSearch={searchText => {
                                const paisId = this.props.form.getFieldValue('pais')
                                this.requisitaEstados(searchText || '', paisId)
                            }}
                            onFocus={() => {
                                const paisId = this.props.form.getFieldValue('pais')
                                if (paisId) {
                                    this.requisitaEstados('', paisId)
                                }
                            }}
                            onChange={value => {
                                this.props.form.setFieldsValue({
                                    cidade: undefined
                                })
                                this.setState({ cidades: [] })
                                if (value) {
                                    this.requisitaCidades('', value)
                                }
                            }}
                            others={{
                                loading: fetchingEstados,
                                notFoundContent: fetchingEstados ? <Spin size="small" /> : t('common:nenhumResultadoEncontrado'),
                                allowClear: true
                            }}
                            debounceDelay={200}
                            xs={24}
                            sm={24}
                            md={8}
                            lg={8}
                            xl={8}
                        >
                            {estados.map(item => (
                                <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                            ))}
                        </SelectedFormField>

                        <SelectedFormField
                            title={t('listaLocalColetaScreen:labelCidade')}
                            placeholder={estadoSelecionadoBusca ? t('listaLocalColetaScreen:placeholderCidade') : t('listaLocalColetaScreen:placeholderCidadeAntes')}
                            fieldName="cidade"
                            getFieldDecorator={getFieldDecorator}
                            disabled={false}
                            onSearch={searchText => {
                                const estadoId = this.props.form.getFieldValue('estado')
                                this.requisitaCidades(searchText || '', estadoId)
                            }}
                            onFocus={() => {
                                const estadoId = this.props.form.getFieldValue('estado')
                                if (estadoId) {
                                    this.requisitaCidades('', estadoId)
                                }
                            }}
                            others={{
                                loading: fetchingCidades,
                                notFoundContent: fetchingCidades ? <Spin size="small" /> : t('common:nenhumResultadoEncontrado'),
                                allowClear: true
                            }}
                            debounceDelay={200}
                            xs={24}
                            sm={24}
                            md={8}
                            lg={8}
                            xl={8}
                        >
                            {cidades.map(item => (
                                <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                            ))}
                        </SelectedFormField>
                    </Row>

                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    <TotalRecordsFound
                                        total={this.state.metadados?.total}
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                this.props.form.resetFields()
                                                this.setState({
                                                    pagina: 1,
                                                    valores: {},
                                                    metadados: {},
                                                    estados: [],
                                                    cidades: []
                                                })
                                                this.requisitaListaLocais({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            {t('common:limpar')}
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button ant-btn-pesquisar"
                                        >
                                            {t('common:pesquisar')}
                                        </Button>
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Card>
        )
    }

    renderFormulario = () => {
        const { getFieldDecorator } = this.props.form
        const { t } = this.props

        const columns = [
            {
                title: t('listaLocalColetaScreen:colNome'),
                type: 'text',
                key: 'nome'
            },
            {
                title: t('listaLocalColetaScreen:colPais'),
                type: 'text',
                key: 'pais'
            },
            {
                title: t('listaLocalColetaScreen:colEstado'),
                type: 'text',
                key: 'estado'
            },
            {
                title: t('listaLocalColetaScreen:colCidade'),
                type: 'text',
                key: 'cidade'
            },
            {
                title: t('listaLocalColetaScreen:colAcao'),
                key: 'acao'
            }
        ]

        return (
            <div>
                <ModalCadastroComponent
                    title={this.state.titulo}
                    visibleModal={this.state.visibleModal}
                    loadingModal={this.state.loadingModal}
                    onCancel={() => {
                        this.setState({
                            visibleModal: false
                        })
                        this.limparCamposModal()
                    }}
                    onOk={() => {
                        if (this.state.id === -1) {
                            if (this.state.nomeLocal && this.state.nomeLocal.trim() !== '' && this.state.cidadeSelecionada) {
                                this.cadastraNovoLocal()
                            } else {
                                this.notificacao('warning', this.props.t('common:tituloFalha'), this.props.t('listaLocalColetaScreen:informeNomeLocal'))
                            }
                        } else if (this.state.nomeLocal && this.state.nomeLocal.trim() !== '' && this.state.cidadeSelecionada) {
                            this.atualizaLocal()
                        } else {
                            this.notificacao('warning', 'Falha', 'Informe o nome do local de coleta e selecione país, estado e cidade.')
                        }
                        this.setState({
                            visibleModal: false
                        })
                    }}
                >
                    {this.renderModalConteudo()}
                </ModalCadastroComponent>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>{t('listaLocalColetaScreen:titulo')}</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4}>
                        {this.renderAdd()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={isCuradorOuOperador() ? columns : columns.filter(column => column.key !== 'acao')}
                    data={this.state.locais}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaLocais(this.state.valores, pg, pageSize, sorter)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }

    renderModalConteudo = () => {
        const { getFieldDecorator } = this.props.form
        const { t } = this.props
        const { paises, estados, cidades, fetchingPaises, fetchingEstados, fetchingCidades, paisSelecionado, estadoSelecionado } = this.state

        return (
            <div>
                <Row gutter={8}>
                    <Col span={24}>
                        <span>{t('listaLocalColetaScreen:labelNomeLocalModal')}</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('nomeLocalModal')(
                                <Input
                                    placeholder={t('listaLocalColetaScreen:placeholderNomeLocalModal')}
                                    onChange={e => this.setState({ nomeLocal: e.target.value })}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={8} style={{ marginTop: 16 }}>
                    <SelectedFormField
                        title={t('listaLocalColetaScreen:labelPais')}
                        placeholder={t('listaLocalColetaScreen:placeholderPais')}
                        fieldName="paisModal"
                        getFieldDecorator={getFieldDecorator}
                        onSearch={searchText => {
                            this.requisitaPaises(searchText || '')
                        }}
                        onChange={async value => {
                            this.setState({
                                paisSelecionado: value,
                                estadoSelecionado: null,
                                cidadeSelecionada: null,
                                estados: [],
                                cidades: []
                            })
                            this.props.form.setFieldsValue({
                                estadoModal: undefined,
                                cidadeModal: undefined
                            })
                            if (value) {
                                await this.requisitaEstados('', value)
                            }
                        }}
                        others={{
                            loading: fetchingPaises,
                            notFoundContent: fetchingPaises ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={24}
                        md={24}
                        lg={24}
                        xl={24}
                    >
                        {paises.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>
                </Row>

                <Row gutter={8} style={{ marginTop: 16 }}>
                    <SelectedFormField
                        title={t('listaLocalColetaScreen:labelEstado')}
                        placeholder={paisSelecionado ? t('listaLocalColetaScreen:placeholderEstado') : t('listaLocalColetaScreen:placeholderEstadoAntes')}
                        fieldName="estadoModal"
                        getFieldDecorator={getFieldDecorator}
                        disabled={!paisSelecionado}
                        onSearch={searchText => {
                            if (paisSelecionado) {
                                this.requisitaEstados(searchText || '', paisSelecionado)
                            }
                        }}
                        onChange={async value => {
                            this.setState({
                                estadoSelecionado: value,
                                cidadeSelecionada: null,
                                cidades: []
                            })
                            this.props.form.setFieldsValue({
                                cidadeModal: undefined
                            })
                            if (value) {
                                await this.requisitaCidades('', value)
                            }
                        }}
                        others={{
                            loading: fetchingEstados,
                            notFoundContent: fetchingEstados ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={24}
                        md={24}
                        lg={24}
                        xl={24}
                    >
                        {estados.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>
                </Row>

                <Row gutter={8} style={{ marginTop: 16 }}>
                    <SelectedFormField
                        title={t('listaLocalColetaScreen:labelCidade')}
                        placeholder={estadoSelecionado ? t('listaLocalColetaScreen:placeholderCidade') : t('listaLocalColetaScreen:placeholderCidadeAntes')}
                        fieldName="cidadeModal"
                        getFieldDecorator={getFieldDecorator}
                        disabled={!estadoSelecionado}
                        onSearch={searchText => {
                            if (estadoSelecionado) {
                                this.requisitaCidades(searchText || '', estadoSelecionado)
                            }
                        }}
                        onChange={value => {
                            this.setState({ cidadeSelecionada: value })
                        }}
                        others={{
                            loading: fetchingCidades,
                            notFoundContent: fetchingCidades ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={24}
                        md={24}
                        lg={24}
                        xl={24}
                    >
                        {cidades.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>
                </Row>
            </div>
        )
    }

    render() {
        const { getFieldDecorator } = this.props.form

        return this.renderFormulario()
    }
}

const ListaLocaisColetaWithForm = Form.create()(ListaLocaisColeta)

export default withTranslation()(ListaLocaisColetaWithForm)
