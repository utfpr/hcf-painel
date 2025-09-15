import { Component } from 'react'

import {
    Divider, Modal, Card, Spin, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'
import { recaptchaKey } from '@/config/api'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Variedade',
        type: 'text',
        key: 'variedade',
        dataIndex: 'variedade',
        width: '15.5%',
        sorter: true
    },
    {
        title: 'Família',
        key: 'familia',
        dataIndex: 'familia',
        width: '15.5%',
        sorter: true
    },
    {
        title: 'Gênero',
        key: 'genero',
        dataIndex: 'genero',
        width: '15.5%',
        sorter: true
    },
    {
        title: 'Espécie',
        key: 'especie',
        dataIndex: 'especie',
        width: '15.5%',
        sorter: true
    },
    {
        title: 'Autor',
        key: 'autor',
        dataIndex: 'autor',
        width: '15.5%',
        sorter: true
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

class ListaTaxonomiaVariedade extends Component {
    constructor(props) {
        super(props)
        this.state = {
            especies: [],
            metadados: {},
            variedades: [],
            autores: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/variedades/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A Variedade foi excluída com sucesso.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir esta variedade?',
            content: 'Ao clicar em SIM, a variedade será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    componentDidMount() {
        this.requisitaListaVariedade({}, this.state.pagina)
        this.requisitaEspecies()
        this.requisitaAutores()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a
                        href="#"
                        onClick={() => {
                            this.props.form.setFields({
                                nomeVariedade: {
                                    value: item.nome
                                },
                                nomeEspecie: {
                                    value: { key: item.especie.id, label: item.especie.nome }
                                },
                                nomeAutor: {
                                    value: { key: item.autor.id, label: item.autor.nome }
                                }
                            })
                            this.setState({
                                visibleModal: true,
                                id: item.id,
                                titulo: 'Atualizar'
                            })
                        }}
                    >
                        <EditOutlined style={{ color: '#FFCC00' }} />
                    </a>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => this.mostraMensagemDelete(item.id)}>
                        <DeleteOutlined style={{ color: '#e30613' }} />
                    </a>
                </span>
            )
        }
        return undefined
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    formataDadosVariedade = variedades => variedades.map(item => ({
        key: item.id,
        variedade: item.nome,
        acao: this.gerarAcao(item),
        familia: item.familia?.nome,
        genero: item.genero?.nome,
        especie: item.especie?.nome,
        autor: item.autor?.nome
    }))

    requisitaListaVariedade = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'variedades' })
    
            const campo = sorter && sorter.field ? sorter.field : 'variedade'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
    
            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                recaptchaToken: token,
                ...(valores && valores.variedade ? { variedade: valores.variedade } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {}),
                ...(valores && valores.genero ? { genero_nome: valores.genero } : {}),
                ...(valores && valores.especie ? { especie_nome: valores.especie } : {})
            }
    
            const response = await axios.get('/variedades', { params })
    
            if (response.status === 200) {
                const { data } = response
                this.setState({
                    variedades: this.formataDadosVariedade(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar variedade', 'Erro ao buscar as variedades.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar as variedades.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar variedades.')
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaVariedade(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaAutores = async () => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'autores' })
    
            const params = {
                limite: 9999999,
                recaptchaToken: token
            }
    
            const response = await axios.get('/autores', { params })
    
            if (response.status === 200) {
                this.setState({
                    autores: response.data.resultado,
                    loading: false
                })
            } else {
                this.notificacao('warning', 'Buscar autores', 'Erro ao buscar os autores.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar autores.')
        }
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
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    Adicionar
                </Button>
            )
        }
        return undefined
    }

    cadastraNovaVariedade() {
        this.setState({
            loading: true
        })
        axios.post('/variedades', {
            nome: this.props.form.getFieldsValue().nomeVariedade,
            especie_id: this.props.form.getFieldsValue().nomeEspecie,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova variedade, tente novamente.')
                }
                this.props.form.setFields({
                    nomeVariedade: {
                        value: ''
                    }
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    atualizaVariedade() {
        this.setState({
            loading: true
        })
        axios.put(`/variedades/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeVariedade,
            especie_id: this.props.form.getFieldsValue().nomeEspecie,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade()
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar a variedade, tente novamente.')
                }
                this.props.form.setFields({
                    nomeVariedade: {
                        value: ''
                    }
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaEspecies = async () => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'especies' })
    
            const params = {
                limite: 9999999,
                recaptchaToken: token
            }
    
            const response = await axios.get('/especies', { params })
    
            if (response.status === 200) {
                this.setState({
                    especies: response.data.resultado,
                    loading: false
                })
            } else {
                this.notificacao('warning', 'Buscar espécies', 'Erro ao buscar as espécies.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar espécies.')
        }
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar variedade">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome da variedade:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('variedade')(
                                        <Input placeholder="A. comosus" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome da família:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('familia')(
                                        <Input placeholder="Fabaceae" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome do gênero:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('genero')(
                                        <Input placeholder="Chamaecrista" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome da espécie:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('especie')(
                                        <Input placeholder="guianensis" type="text" />
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
                                                    metadados: {}
                                                })
                                                this.requisitaListaVariedade({}, 1)
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

    optionEspecie = () => this.state.especies.map(item => (
        <Option value={item.id}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
        <Option value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Form onSubmit={this.handleSubmitForm}>
                    <ModalCadastroComponent
                        title={this.state.titulo}
                        visibleModal={this.state.visibleModal}
                        loadingModal={this.state.loadingModal}
                        onCancel={
                            () => {
                                this.setState({
                                    visibleModal: false
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeVariedade && this.props.form.getFieldsValue().nomeVariedade.trim() !== '') {
                                    this.cadastraNovaVariedade()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova variedade e da espécie.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeVariedade && this.props.form.getFieldsValue().nomeVariedade.trim() !== '') {
                                this.atualizaVariedade()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova variedade e da espécie.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome da espécie:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeEspecie')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione uma espécie"
                                                optionFilterProp="children"
                                            >

                                                {this.optionEspecie()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome da variedade:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeVariedade')(
                                            <Input placeholder="" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome do autor:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeAutor')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione um autor"
                                                optionFilterProp="children"
                                                allowClear
                                            >

                                                {this.optionAutores()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>Variedades</h2>
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
                    data={this.state.variedades}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaVariedade(this.state.valores, pg, pageSize, sorter)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }

    render() {
        return (
            this.renderFormulario()
        )
    }
}
export default Form.create()(ListaTaxonomiaVariedade)
