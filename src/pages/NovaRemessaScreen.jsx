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
import { withTranslation } from 'react-i18next'

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

    getColumns() {
        return [
            { title: this.props.t('novaRemessaScreen:colunaTombo'), type: 'text', key: 'hcf' },
            { title: this.props.t('novaRemessaScreen:colunaTipo'), type: 'text', key: 'tipo' },
            { title: this.props.t('novaRemessaScreen:colunaDataVencimento'), type: 'text', key: 'data_vencimento' },
            { title: this.props.t('novaRemessaScreen:colunaAcao'), key: 'acao' }
        ]
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
                    this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novaRemessaScreen:erroBuscarRemessa'))
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    formataTombos = tombos => tombos.map(item => ({
        hcf: item.hcf,
        tipo: item.retirada_exsiccata_tombos.tipo,
        // eslint-disable-next-line no-constant-binary-expression
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
                    this.notificacao('error', this.props.t('common:pesquisar'), this.props.t('novaRemessaScreen:erroBuscarHerbarios'))
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
        if (!err) {
            if (this.state.data.length > 0) {
                if (this.props.match.params.remessa_id !== undefined) {
                    this.requisitaEdicaoRemessa(valores)
                } else {
                    this.cadastroRemessa(valores)
                }
            } else {
                this.notificacao('warning', this.props.t('novaRemessaScreen:tituloCadastroAlteracao'), this.props.t('novaRemessaScreen:validacaoAdicionarTombo'))
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
                    this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('novaRemessaScreen:sucessoCadastro'))
                    this.props.history.push('/remessas')
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
                        this.notificacao('warning', this.props.t('common:tituloFalha'), error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novaRemessaScreen:erroCadastro'))
                    }
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaEdicaoRemessa = valores => {
        this.setState({ loading: true })

        const {
            observacoes,
            dataEnvio,
            receptor,
            doador
        } = valores

        const tombosNormalizados = this.state.data.map(tombo => ({
            ...tombo,
            data_vencimento: tombo.data_vencimento
                ? moment(
                        tombo.data_vencimento,
                        ['DD/MM/YYYY', 'DD/MM/YYYY HH:mm', 'YYYY-MM-DD']
                    ).format('YYYY-MM-DD HH:mm:ss')
                : null
        }))

        const payload = {
            remessa: {
                observacao: observacoes,
                data_envio: dataEnvio,
                entidade_destino_id: receptor,
                herbario_id: doador
            },
            tombos: tombosNormalizados
        }

        axios.put(`/remessas/${this.props.match.params.remessa_id}`, payload)
            .then(response => {
                this.setState({ loading: false })
                if (response.status == 204) {
                    this.props.form.resetFields()
                    this.notificacao('success', this.props.t('novaRemessaScreen:tituloEdicao'), this.props.t('novaRemessaScreen:sucessoEdicao'))
                    this.props.history.push('/remessas')
                } else {
                    this.notificacao('error', this.props.t('novaRemessaScreen:tituloEdicao'), this.props.t('novaRemessaScreen:erroEdicao'))
                }
            })
            .catch(err => {
                this.setState({ loading: false })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    optionHerbario = () => this.state.herbarios.map(item => (
        <Option key={item.id} value={item.id}>
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
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('novaRemessaScreen:confirmarExcluirTombo'),
            content: this.props.t('novaRemessaScreen:descricaoExcluirTombo'),
            okText: this.props.t('common:sim'),
            okType: 'danger',
            cancelText: this.props.t('common:nao'),
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
                        title={this.props.t('novaRemessaScreen:modalTitulo')}
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
                                    <span>{this.props.t('novaRemessaScreen:numeroTombo')}</span>
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
                                    <span>{this.props.t('novaRemessaScreen:tipo')}</span>
                                </Col>
                                <Col span={12}>
                                    <span>{this.props.t('novaRemessaScreen:dataVencimento')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <FormItem>
                                        {getFieldDecorator('tipo')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder={this.props.t('novaRemessaScreen:selecioneTipo')}
                                                optionFilterProp="children"
                                            >
                                                <Option value="EMPRESTIMO">{this.props.t('novaRemessaScreen:tipoEmprestimo')}</Option>
                                                <Option value="DOACAO">{this.props.t('novaRemessaScreen:tipoDoacao')}</Option>
                                                <Option value="PERMUTA">{this.props.t('novaRemessaScreen:tipoPermuta')}</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem>
                                        {getFieldDecorator('dataVencimento')(
                                            <DatePicker format="DD-MM-YYYY" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                    <Row>
                        <Col span={12}>
                            <h2 style={{ fontWeight: 200 }}>{this.props.t('novaRemessaScreen:titulo')}</h2>
                        </Col>
                    </Row>
                    <Divider dashed />

                    <Row gutter={8}>
                        <Col span={24}>
                            <span>{this.props.t('novaRemessaScreen:doador')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('doador', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novaRemessaScreen:validacaoDoador')
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder={this.props.t('novaRemessaScreen:selecioneDoador')}
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
                            <span>{this.props.t('novaRemessaScreen:receptor')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('receptor', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novaRemessaScreen:validacaoReceptor')
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder={this.props.t('novaRemessaScreen:selecioneReceptor')}
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
                                <span>{this.props.t('novaRemessaScreen:dataEnvio')}</span>
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
                                <span>{this.props.t('novaRemessaScreen:observacao')}</span>
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
                                {this.props.t('novaRemessaScreen:adicionarTombo')}
                            </Button>
                        </Col>
                    </Row>

                    <SimpleTableComponent
                        columns={this.getColumns()}
                        data={this.formataDados(this.state.data)}
                    />

                    <Divider dashed />

                    <Row type="flex" justify="end">
                        <Col xs={24} sm={8} md={8} lg={4} xl={4}>
                            <ButtonComponent titleButton={this.props.t('novaRemessaScreen:salvar')} style={{ backgroundColor: '#28a745' }} />
                        </Col>
                    </Row>

                </Form>
            </div>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip={this.props.t('common:carregando')}>
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

export default withTranslation()(Form.create()(NovaRemessaScreen))
