import 'moment/locale/pt-br'
import { Component } from 'react'

import {

    Button,
    Select,
    Input,
    InputNumber,
    notification,
    Spin,
    Modal,
    Row,
    Col,
    DatePicker,
    Divider
} from 'antd'
import axios from 'axios'
import moment from 'moment'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import ButtonComponent from '../components/ButtonComponent'
import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { formatarDataENtoBR, formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'

const FormItem = Form.Item
const { Option } = Select
const { confirm } = Modal
const { TextArea } = Input

const columns = [
    {
        title: 'Tombo',
        type: 'text',
        key: 'hcf'
    },
    {
        title: 'Tipo',
        type: 'text',
        key: 'tipo'
    },
    {
        title: 'Data Vencimento',
        type: 'text',
        key: 'data_vencimento'
    },
    {
        title: 'Ação',
        key: 'acao'
    }

]

class NovaRemessaScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            herbarios: [],
            data: [],
            visibleModal: false
        }
    }

    componentDidMount() {
        this.requisitaHerbarios()
        if (this.props.match.params.remessa_id !== undefined) {
            this.buscaRemessa()
        }
    }

    buscaRemessa() {
        this.setState({
            loading: true
        })
        axios.get(`/remessas/${this.props.match.params.remessa_id}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        loading: false
                    })
                }
                const { remessa } = response.data
                this.props.form.setFields({
                    doador: {
                        value: remessa.herbario_id
                    },
                    receptor: {
                        value: remessa.entidade_destino_id
                    },
                    dataEnvio: {
                        value: moment(remessa.data_envio)
                    },
                    observacoes: {
                        value: remessa.observacao
                    }
                })
                this.setState({
                    data: this.formataTombos(remessa.tombos)
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    this.notificacao('error', 'Falha', 'Houve um problema ao buscar os dados da remessa, tente novamente.')
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    formataTombos = tombos => tombos.map(item => ({
        hcf: item.hcf,
        tipo: item.retirada_exsiccata_tombos.tipo,
        data_vencimento: item.retirada_exsiccata_tombos.data_vencimento !== (null && undefined) ? formatarDataBDtoDataHora(item.retirada_exsiccata_tombos.data_vencimento) : ''
    }))

    requisitaHerbarios() {
        this.setState({
            loading: true
        })

        axios.get('/herbarios', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status !== 200) {
                    this.notificacao('error', 'Buscar', 'Erro ao buscar a lista de herbários.')
                }
                this.setState({
                    loading: false,
                    herbarios: response.data.herbarios
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmit = (err, valores) => {
        console.log('REMESSASSS')
        console.log(this.state.data)
        console.log(this.props.match.params.remessa_id)
        if (!err) {
            if (this.state.data.length > 0) {
                if (this.props.match.params.remessa_id !== undefined) {
                    this.requisitaEdicaoRemessa(valores)
                } else {
                    this.cadastroRemessa(valores)
                }
            } else {
                this.notificacao('warning', 'Cadastro/Alteração', 'É necessário adicionar um tombo para a lista de remessa.')
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastroRemessa(valores) {
        this.setState({
            loading: true
        })

        const {
            observacoes,
            dataEnvio,
            receptor,
            doador
        } = valores

        axios.post('/remessas', {
            remessa: {
                observacao: observacoes,
                data_envio: dataEnvio,
                entidade_destino_id: receptor,
                herbario_id: doador
            },
            tombos: this.state.data
        })
            .then(response => {
                if (response.status === 204) {
                    this.setState({
                        loading: false
                    })
                    this.notificacao('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    this.props.history.goBack()
                }
                this.props.form.setFields({
                    campo: {
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
                    if (response.status === 400) {
                        this.notificacao('warning', 'Falha', error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar a novo genero, tente novamente.')
                    }
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaEdicaoRemessa = valores => {
        this.setState({
            loading: true
        })

        const {
            observacoes,
            dataEnvio,
            receptor,
            doador
        } = valores
        axios.put(`/remessas/${this.props.match.params.remessa_id}`, {
            remessa: {
                observacao: observacoes,
                data_envio: dataEnvio,
                entidade_destino_id: receptor,
                herbario_id: doador
            },
            tombos: this.state.data
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status == 204) {
                    this.props.form.resetFields()
                    this.notificacao('success', 'Edição', 'A remessa foi alterada com sucesso.')
                    this.props.history.goBack()
                } else {
                    this.notificacao('error', 'Edição', 'Houve um problema ao realizar a edição, verifique os dados e tente novamente.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    optionHerbario = () => this.state.herbarios.map(item => (
        <Option value={item.id}>
            {item.sigla}
            {' '}
            -
            {' '}
            {item.nome}
        </Option>
    ))

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao,
            duration: 15
        })
    }

    gerarAcao(item) {
        return (
            <span>
                <a href="#" onClick={() => this.mostraMensagemDelete(item.hcf)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir da lista esse tombo?',
            content: 'Ao clicar em SIM, o tombo será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {
                for (let i = 0; i < self.state.data.length; i++) {
                    if (self.state.data[i].hcf == id) {
                        const vetor = self.state.data
                        vetor.splice(i, 1)
                        self.setState({
                            data: vetor
                        })
                    }
                }
            },
            onCancel() {
            }
        })
    }

    formataDados = dados => dados.map(item => (
        {
            hcf: item.hcf,
            tipo: item.tipo,
            data_vencimento: item.data_vencimento ? formatarDataENtoBR(item.data_vencimento) : '',
            acao: this.gerarAcao(item)
        }
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Form onSubmit={this.onSubmit}>
                    <ModalCadastroComponent
                        title="Adicionar tombo a remessa"
                        visibleModal={this.state.visibleModal}
                        onCancel={
                            () => {
                                this.setState({
                                    visibleModal: false
                                })
                            }
                        }
                        onOk={() => {
                            const vetor = this.state.data
                            vetor.push({
                                hcf: this.props.form.getFieldsValue().hcf,
                                tipo: this.props.form.getFieldsValue().tipo,
                                data_vencimento: this.props.form.getFieldsValue().dataVencimento ? this.props.form.getFieldsValue().dataVencimento.format('YYYY-MM-DD') : ''
                            })

                            this.setState({
                                visibleModal: false,
                                data: vetor
                            })

                            this.props.form.setFields({
                                hcf: {
                                    value: ''
                                },
                                tipo: {
                                    value: ''
                                },
                                dataVencimento: {
                                    value: ''
                                }
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <span>Nº tombo:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <FormItem>
                                        {getFieldDecorator('hcf')(
                                            <InputNumber
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <span>Tipo:</span>
                                </Col>
                                <Col span={12}>
                                    <span>Data de vencimento:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <FormItem>
                                        {getFieldDecorator('tipo')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione um tipo"
                                                optionFilterProp="children"
                                            >
                                                <Option value="EMPRESTIMO">Emprestimo</Option>
                                                <Option value="DOACAO">Doação</Option>
                                                <Option value="PERMUTA">Permuta</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem>
                                        {getFieldDecorator('dataVencimento')(
                                            <DatePicker />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                    <Row>
                        <Col span={12}>
                            <h2 style={{ fontWeight: 200 }}>Remessa</h2>
                        </Col>
                    </Row>
                    <Divider dashed />

                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Doador:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('doador', {
                                    rules: [{
                                        required: true,
                                        message: 'Selecione um doador'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um doador"
                                        optionFilterProp="children"
                                    >
                                        {this.optionHerbario()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <span>Receptor:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('receptor', {
                                    rules: [{
                                        required: true,
                                        message: 'Selecione um receptor'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um receptor"
                                        optionFilterProp="children"
                                    >
                                        {this.optionHerbario()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Data de envio:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('dataEnvio')(
                                        <DatePicker format="DD-MM-YYYY" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Observação:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('observacoes')(
                                        <TextArea rows={4} />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Divider dashed />

                    <Row type="flex" justify="end" style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    this.setState({
                                        visibleModal: true
                                    })
                                }}
                            >
                                Adicionar tombo
                            </Button>
                        </Col>
                    </Row>

                    <SimpleTableComponent
                        columns={columns}
                        data={this.formataDados(this.state.data)}
                    />

                    <Divider dashed />

                    <Row type="flex" justify="end">
                        <Col xs={24} sm={8} md={8} lg={4} xl={4}>
                            <ButtonComponent titleButton="Salvar" style={{ backgroundColor: '#28a745' }} />
                        </Col>
                    </Row>

                </Form>
            </div>
        )
    }

    render() {
        console.log(this.state)
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

export default Form.create()(NovaRemessaScreen)
