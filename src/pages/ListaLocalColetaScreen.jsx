import React, { Component } from 'react'
import {
    Card, Col, Row, Form, Input, Button, Divider, notification, Modal, Select
} from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import axios from 'axios'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'
import HeaderListComponent from '../components/HeaderListComponent'
import ModalCadastroComponent from '../components/ModalCadastroComponent'
import TotalRecordFound from '../components/TotalRecordFound'

const { confirm } = Modal
const { Option } = Select
const FormItem = Form.Item

const columns = [
    {
        title: 'Nome do Local',
        type: 'text',
        key: 'nome'
    },
    {
        title: 'País',
        type: 'text',
        key: 'pais'
    },
    {
        title: 'Estado',
        type: 'text',
        key: 'estado'
    },
    {
        title: 'Cidade',
        type: 'text',
        key: 'cidade'
    },
    {
        title: 'Ação',
        key: 'acao'
    }
]

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
            titulo: 'Cadastrar',
            id: -1,
            valores: {},
            paises: [],
            estados: [],
            cidades: [],
            paisSelecionado: null,
            estadoSelecionado: null,
            cidadeSelecionada: null,
            nomeLocal: ''
        }
    }

    componentDidMount() {
        this.requisitaListaLocais({}, this.state.pagina)
        this.requisitaPaises()
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaPaises = async () => {
        try {
            const response = await axios.get('/paises')
            
            if (response.status === 200) {
                this.setState({
                    paises: response.data
                })
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar países.')
        }
    }

    requisitaEstados = async (paisId) => {
        try {
            const response = await axios.get('/estados', {
                params: { id: paisId }
            })
            
            if (response.status === 200) {
                this.setState({
                    estados: response.data,
                    cidades: [],
                    estadoSelecionado: null,
                    cidadeSelecionada: null
                })
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar estados.')
        }
    }

    requisitaCidades = async (estadoId) => {
        try {
            const response = await axios.get('/cidades', {
                params: { id: estadoId }
            })
            
            if (response.status === 200) {
                this.setState({
                    cidades: response.data,
                    cidadeSelecionada: null
                })
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar cidades.')
        }
    }

    formataDadosPaises = () => this.state.paises.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    formataDadosEstados = () => this.state.estados.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    formataDadosCidades = () => this.state.cidades.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    formataDadosLocais = locais => locais.map(item => ({
        key: item.id,
        nome: item.nome,
        pais: item.cidade?.estado?.pais?.nome || '',
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

    editarLocal = async (id) => {
        try {
            const response = await axios.get(`/locais-coleta/${id}`)
            
            if (response.status === 200) {
                const local = response.data
                
                await this.requisitaEstados(local.cidade.estado.pais.id)
                await this.requisitaCidades(local.cidade.estado.id)
                
                this.setState({
                    visibleModal: true,
                    titulo: 'Atualizar',
                    id: local.id,
                    nomeLocal: local.nome,
                    paisSelecionado: local.cidade.estado.pais.id,
                    estadoSelecionado: local.cidade.estado.id,
                    cidadeSelecionada: local.cidade.id
                })
                
                this.props.form.setFields({
                    nomeLocal: { value: local.nome },
                    pais: { value: local.cidade.estado.pais.id },
                    estado: { value: local.cidade.estado.id },
                    cidade: { value: local.cidade.id }
                })
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar dados do local.')
        }
    }

    requisitaListaLocais = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const { pais, estado, cidade } = valores

            if (pais && estado && cidade) {
                params.cidade_id = cidade
            }
        }

        const campo = sorter && sorter.field ? sorter.field : 'nome'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
        params.order = `${campo}:${ordem}`

        try {
            const response = await axios.get('/locais-coleta', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    locais: this.formataDadosLocais(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar locais', 'Erro ao buscar os locais de coleta.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar os locais de coleta.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            this.notificacao('error', 'Erro', 'Falha ao buscar locais de coleta.')
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            if (valores.pais && valores.estado && valores.cidade) {
                this.setState({
                    valores,
                    loading: true
                })
                this.requisitaListaLocais(valores, this.state.pagina)
            } else {
                this.notificacao('warning', 'Filtros', 'É necessário preencher País, Estado e Cidade para filtrar.')
            }
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
                nome: nomeLocal,
                cidade_id: cidadeSelecionada
            })

            if (response.status === 204) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', 'Sucesso', 'Local de coleta cadastrado com sucesso.')
            }
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o local de coleta.')
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
                nome: nomeLocal,
                cidade_id: cidadeSelecionada
            })

            if (response.status === 200) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', 'Sucesso', 'Local de coleta atualizado com sucesso.')
            }
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o local de coleta.')
        } finally {
            this.setState({ loadingModal: false })
            this.limparCamposModal()
        }
    }

    requisitaExclusao = async (id) => {
        try {
            const response = await axios.delete(`/locais-coleta/${id}`)

            if (response.status === 204) {
                this.requisitaListaLocais(this.state.valores, this.state.pagina)
                this.notificacao('success', 'Excluir local', 'O local de coleta foi excluído com sucesso.')
            }
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao excluir o local de coleta.')
        }
    }

    mostraMensagemDelete = (id) => {
        confirm({
            title: 'Você tem certeza que deseja excluir este local de coleta?',
            content: 'Ao clicar em SIM, o local será excluído.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
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
        this.props.form.setFields({
            nomeLocalModal: { value: '' },
            paisModal: { value: undefined },
            estadoModal: { value: undefined },
            cidadeModal: { value: undefined }
        })
    }

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        this.setState({
                            visibleModal: true,
                            titulo: 'Cadastrar',
                            id: -1
                        })
                        this.limparCamposModal()
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    Adicionar
                </Button>
            )
        }
        return null
    }

    renderPainelBusca = (getFieldDecorator) => {
        return (
            <Card title="Buscar local de coleta">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>País:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('pais')(
                                        <Select 
                                            placeholder="Selecione um país"
                                            allowClear
                                            onChange={value => {
                                                if (value) {
                                                    this.requisitaEstados(value)
                                                } else {
                                                    this.setState({
                                                        estados: [],
                                                        cidades: []
                                                    })
                                                    this.props.form.setFields({
                                                        estado: { value: undefined },
                                                        cidade: { value: undefined }
                                                    })
                                                }
                                            }}
                                        >
                                            {this.formataDadosPaises()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Estado:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('estado')(
                                        <Select 
                                            placeholder="Selecione um estado"
                                            allowClear
                                            onChange={value => {
                                                if (value) {
                                                    this.requisitaCidades(value)
                                                } else {
                                                    this.setState({ cidades: [] })
                                                    this.props.form.setFields({
                                                        cidade: { value: undefined }
                                                    })
                                                }
                                            }}
                                        >
                                            {this.formataDadosEstados()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Cidade:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('cidade')(
                                        <Select 
                                            placeholder="Selecione uma cidade"
                                            allowClear
                                        >
                                            {this.formataDadosCidades()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    <TotalRecordFound
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
                                            Limpar
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button"
                                        >
                                            Pesquisar
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

    renderModalConteudo = () => {
        const { getFieldDecorator } = this.props.form
        
        return (
            <div>
                <Row gutter={8}>
                    <Col span={24}>
                        <span>Nome do Local de Coleta:</span>
                    </Col>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('nomeLocalModal', {
                                initialValue: this.state.nomeLocal,
                                rules: [{
                                    required: true,
                                    message: 'Informe o nome do local de coleta'
                                }]
                            })(
                                <Input 
                                    placeholder="RPPN Moreira Sales" 
                                    onChange={e => this.setState({ nomeLocal: e.target.value })}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={8}>
                    <Col span={24}>
                        <span>País:</span>
                    </Col>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('paisModal', {
                                initialValue: this.state.paisSelecionado,
                                rules: [{
                                    required: true,
                                    message: 'Selecione um país'
                                }]
                            })(
                                <Select 
                                    placeholder="Selecione um país"
                                    onChange={async value => {
                                        this.setState({ paisSelecionado: value })
                                        await this.requisitaEstados(value)
                                        this.props.form.setFields({
                                            estadoModal: { value: undefined },
                                            cidadeModal: { value: undefined }
                                        })
                                    }}
                                >
                                    {this.formataDadosPaises()}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={8}>
                    <Col span={24}>
                        <span>Estado:</span>
                    </Col>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('estadoModal', {
                                initialValue: this.state.estadoSelecionado,
                                rules: [{
                                    required: true,
                                    message: 'Selecione um estado'
                                }]
                            })(
                                <Select 
                                    placeholder="Selecione um estado"
                                    onChange={async value => {
                                        this.setState({ estadoSelecionado: value })
                                        await this.requisitaCidades(value)
                                        this.props.form.setFields({
                                            cidadeModal: { value: undefined }
                                        })
                                    }}
                                >
                                    {this.formataDadosEstados()}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={8}>
                    <Col span={24}>
                        <span>Cidade:</span>
                    </Col>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('cidadeModal', {
                                initialValue: this.state.cidadeSelecionada,
                                rules: [{
                                    required: true,
                                    message: 'Selecione uma cidade'
                                }]
                            })(
                                <Select 
                                    placeholder="Selecione uma cidade"
                                    onChange={value => {
                                        this.setState({ cidadeSelecionada: value })
                                    }}
                                >
                                    {this.formataDadosCidades()}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </div>
        )
    }

    renderFormulario = () => {
        const { getFieldDecorator } = this.props.form
        
        return (
            <div>
                <ModalCadastroComponent
                    title={this.state.titulo}
                    visibleModal={this.state.visibleModal}
                    loadingModal={this.state.loadingModal}
                    onCancel={() => {
                        this.setState({ visibleModal: false })
                        this.limparCamposModal()
                    }}
                    onOk={() => {
                        this.props.form.validateFields(['nomeLocalModal', 'paisModal', 'estadoModal', 'cidadeModal'], (err) => {
                            if (!err) {
                                if (this.state.id === -1) {
                                    this.cadastraNovoLocal()
                                } else {
                                    this.atualizaLocal()
                                }
                                this.setState({ visibleModal: false })
                            }
                        })
                    }}
                >
                    {this.renderModalConteudo()}
                </ModalCadastroComponent>

                <HeaderListComponent title="Listagem de locais de coleta" />
                <Divider dashed />
                {this.renderAdd()}
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

    render() {
        const { getFieldDecorator } = this.props.form
        
        return this.renderFormulario()
    }
}

export default Form.create()(ListaLocaisColeta)
