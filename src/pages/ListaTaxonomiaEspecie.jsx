import { Component } from 'react'

import {
    Divider, Modal, Spin, Card, Row, Col,
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
        title: 'Espécie',
        type: 'text',
        key: 'especie',
        dataIndex: 'especie',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Família',
        key: 'familia',
        dataIndex: 'familia',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Gênero',
        key: 'genero',
        dataIndex: 'genero',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Autor',
        key: 'autor',
        dataIndex: 'autor',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

class ListaTaxonomiaEspecie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            generos: [],
            metadados: {},
            especies: [],
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
        axios.delete(`/especies/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A espécie foi excluída com sucesso.')
                } else {
                    this.notificacao('success', 'Excluir', 'Erro ao excluir a espécie com sucesso.')
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
            title: 'Você tem certeza que deseja excluir esta espécie?',
            content: 'Ao clicar em SIM, a espécie será excluída.',
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
        this.requisitaListaEspecie({}, this.state.pagina)
        this.requisitaFamilias()
        this.requisitaGeneros()
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
                                nomeEspecie: {
                                    value: item.nome
                                },
                                nomeGenero: {
                                    value: { key: item.genero.id, label: item.genero.nome }
                                },
                                nomeAutor: {
                                    value: item.autor ? { key: item.autor.id, label: item.autor.nome } : undefined
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

    formataDadosEspecie = especies => especies.map(item => ({
        key: item.id,
        especie: item.nome,
        acao: this.gerarAcao(item),
        genero: item.genero?.nome,
        familia: item.familia?.nome,
        autor: item.autor?.nome
    }))

    requisitaListaEspecie = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'especies' })
    
            const campo = sorter && sorter.field ? sorter.field : 'especie'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
    
            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                recaptchaToken: token,
                ...(valores && valores.especie ? { especie: valores.especie } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {}),
                ...(valores && valores.genero ? { genero_nome: valores.genero } : {})
            }
    
            const response = await axios.get('/especies', { params })
    
            if (response.status === 200) {
                const { data } = response
                this.setState({
                    especies: this.formataDadosEspecie(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar espécie', 'Erro ao buscar as espécies.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar as espécies.')
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

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaEspecie(valores, this.state.pagina)
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

    requisitaGeneros = async () => {
        this.setState({ loading: true })

        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))

            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })

            const params = {
                limite: 9999999,
                recaptchaToken: token
            }

            const response = await axios.get('/generos', { params })

            if (response.status === 200) {
                this.setState({
                    generos: response.data.resultado,
                    loading: false
                })
            } else {
                this.notificacao('warning', 'Buscar gêneros', 'Erro ao buscar os gêneros.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar gêneros.')
        }
    }

    requisitaFamilias = async () => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'familias' })
    
            const params = {
                limite: 9999999,
                recaptchaToken: token
            }
    
            const response = await axios.get('/familias', { params })
    
            if (response.status === 200) {
                this.setState({
                    familias: response.data.resultado,
                    loading: false
                })
            } else {
                this.notificacao('warning', 'Buscar famílias', 'Erro ao buscar as famílias.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar famílias.')
        }
    }

    cadastraNovaEspecie() {
        this.setState({
            loading: true
        })
        axios.post('/especies', {
            nome: this.props.form.getFieldsValue().nomeEspecie,
            genero_id: this.props.form.getFieldsValue().nomeGenero,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova espécie, tente novamente.')
                }
                this.props.form.setFields({
                    nomeEspecie: {
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

    atualizaEspecie() {
        this.setState({
            loading: true
        })

        const formValues = this.props.form.getFieldsValue()
    
        const extrairId = (valor) => {
            if (typeof valor === 'object' && valor.key) {
                return valor.key
            }
            return valor
        }

        const autorId = extrairId(formValues.nomeAutor)

        axios.put(`/especies/${this.state.id}`, {
            nome: formValues.nomeEspecie,
            genero_id: extrairId(formValues.nomeGenero),
            autor_id: autorId || null
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie()
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar a espécie, tente novamente.')
                }
                this.props.form.setFields({
                    nomeEspecie: {
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

    requisitaListaGenero = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })
    
        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
    
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
    
            const campo = sorter && sorter.field ? sorter.field : 'genero'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
    
            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                recaptchaToken: token,
                ...(valores && valores.genero ? { genero: valores.genero } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {})
            }
    
            const response = await axios.get('/generos', { params })
    
            if (response.status === 200) {
                const { data } = response
                this.setState({
                    generos: this.formataDadosGenero(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar gênero', 'Erro ao buscar os gêneros.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar os gêneros.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar gêneros.')
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

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar espécie">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>

                            <Col span={24}>
                                <span>Nome da espécie:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('especie')(
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
                                        <Input placeholder="Lantana" type="text" />
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
                                                    usuarios: []
                                                })
                                                this.requisitaListaEspecie({}, 1)
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

    optionGenero = () => this.state.generos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
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
                                if (this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeEspecie.trim() !== '') {
                                    this.cadastraNovaEspecie()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova espécie e do gênero.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeEspecie.trim() !== '') {
                                this.atualizaEspecie()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova espécie e do gênero.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome do gênero:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeGenero')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione um gênero"
                                                optionFilterProp="children"
                                            >

                                                {this.optionGenero()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome da espécie:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeEspecie')(
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
                        <h2 style={{ fontWeight: 200 }}>Espécies</h2>
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
                    data={this.state.especies}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaEspecie(this.state.valores, pg, pageSize, sorter)
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
export default Form.create()(ListaTaxonomiaEspecie)
