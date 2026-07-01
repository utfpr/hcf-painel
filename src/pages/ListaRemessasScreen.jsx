import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Spin, Select, Button, InputNumber
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

import ExpansiveTableComponent from '../components/ExpansiveTableComponent'
import HeaderListComponent from '../components/HeaderListComponent'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

class ListaRemessasScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            remessas: [],
            metadados: [],
            herbarios: [],
            pagina: 1,
            loading: false,
            loadingPg: false
        }
    }

    getColumns() {
        return [
            { title: this.props.t('listaRemessasScreen:colunaCodigo'), dataIndex: 'codigo', key: 'codigo', with: 100 },
            { title: this.props.t('listaRemessasScreen:colunaDataEnvio'), dataIndex: 'dataEnvio', key: 'dataEnvio', width: 325 },
            { title: this.props.t('listaRemessasScreen:colunaDoador'), dataIndex: 'doador', key: 'doador', width: 325 },
            { title: this.props.t('listaRemessasScreen:colunaReceptor'), dataIndex: 'receptor', key: 'receptor', width: 325 },
            { title: this.props.t('listaRemessasScreen:colunaObservacao'), dataIndex: 'observacao', key: 'observacao', width: 325 },
            { title: this.props.t('listaRemessasScreen:colunaAcao'), key: 'acao', width: 100 }
        ]
    }

    getSubColumns() {
        return [
            { title: this.props.t('listaRemessasScreen:subColunaTombo'), dataIndex: 'tombo', key: 'tombo' },
            { title: this.props.t('listaRemessasScreen:subColunaTipo'), dataIndex: 'tipo', key: 'tipo' },
            { title: this.props.t('listaRemessasScreen:subColunaDataVencimento'), dataIndex: 'dataVencimento', key: 'dataVencimento' },
            { title: this.props.t('listaRemessasScreen:subColunaAcao'), dataIndex: 'acao', key: 'acao' }
        ]
    }

    componentDidMount() {
        this.setState({
            loading: true
        })
        this.requisitaListaRemessas({}, this.state.pagina)
        this.requisitaListaHerbarios()
    }

    requisitaListaHerbarios = () => {
        const params = {
            limite: 9999999
        }

        axios.get('/herbarios', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        herbarios: response.data.herbarios
                    })
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

    mostraMensagemDelete(id) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaRemessasScreen:confirmarExcluirRemessa'),
            content: this.props.t('listaRemessasScreen:descricaoExcluirRemessa'),
            okText: this.props.t('common:sim'),
            okType: 'danger',
            cancelText: this.props.t('common:nao'),
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    mostraMensagemDevolucao(idRemessa, idTombo) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaRemessasScreen:confirmarDevolverTombo'),
            content: this.props.t('listaRemessasScreen:descricaoDevolverTombo'),
            okText: this.props.t('common:sim'),
            okType: 'warning',
            cancelText: this.props.t('common:nao'),
            onOk() {
                self.requisitaDevolucao(idRemessa, idTombo)
            },
            onCancel() {
            }
        })
    }

    requisitaExclusao(id) {
        axios.delete(`/remessas/${id}`)
            .then(response => {
                if (response.status === 204) {
                    this.requisitaListaRemessas(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('listaRemessasScreen:tituloExcluirRemessa'), this.props.t('listaRemessasScreen:sucessoExcluirRemessa'))
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    requisitaDevolucao(idRemessa, idTombo) {
        axios.get('/remessas-devolver', {
            params: {
                tombo_id: idTombo,
                remessa_id: idRemessa
            }
        })
            .then(response => {
                if (response.status === 204) {
                    this.requisitaListaRemessas(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('listaRemessasScreen:tituloDevolverTombo'), this.props.t('listaRemessasScreen:sucessoDevolverTombo'))
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    this.notificacao('error', this.props.t('listaRemessasScreen:erroDevolverTombo'), response.data.error.message)
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    gerarAcao(id) {
        return (
            <span>
                <Link to={`/remessas/${id}`}>
                    <EditOutlined style={{ color: '#FFCC00' }} />
                </Link>
                <Divider type="vertical" />
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    gerarAcaoRetirada = (idRemessa, idTombo) => (
        <Button
            type="dashed"
            icon={<CheckOutlined />}
            onClick={() => this.mostraMensagemDevolucao(idRemessa, idTombo)}
        >
            {this.props.t('listaRemessasScreen:devolver')}
        </Button>
    )

    formataDadosRemessa = remessas => remessas.remessas.map(item => {
        const doador = remessas.herbarios.filter(herbario => herbario.id === item.herbario_id)[0]
        const receptor = remessas.herbarios.filter(herbario => herbario.id === item.entidade_destino_id)[0]

        const subdata = item.tombos.map(item => ({
            tombo: item.hcf,
            tipo: item.retirada_exsiccata_tombos.tipo,
            // eslint-disable-next-line no-constant-binary-expression
            dataVencimento: item.retirada_exsiccata_tombos.data_vencimento !== (null && undefined) ? formatarDataBDtoDataHora(item.retirada_exsiccata_tombos.data_vencimento) : '',
            acao: item.retirada_exsiccata_tombos.tipo === 'EMPRESTIMO' && item.retirada_exsiccata_tombos.devolvido === false ? this.gerarAcaoRetirada(item.retirada_exsiccata_tombos.retirada_exsiccata_id, item.hcf) : ''
        }))

        return ({
            codigo: item.id,
            // eslint-disable-next-line no-constant-binary-expression
            dataEnvio: item.data_envio !== (null && undefined) ? formatarDataBDtoDataHora(item.data_envio) : '',
            receptor: `${receptor.sigla} - ${receptor.nome}`,
            doador: `${doador.sigla} - ${doador.nome}`,
            observacao: item.observacao === null ? '' : item.observacao,
            acao: this.gerarAcao(item.id),
            subdata
        })
    })

    requisitaListaRemessas = (valores, pg, pageSize) => {
        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const { numRemessa, numTombo, herbario } = valores

            if (numRemessa) {
                params.numero_remessa = numRemessa
            }
            if (numTombo) {
                params.numero_tombo = numTombo
            }
            if (herbario) {
                params.numero_herbario = herbario
            }
        }

        axios.get('/remessas', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        remessas: this.formataDadosRemessa(data.resultado),
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', this.props.t('common:pesquisar'), response.data.error.message)
                } else {
                    this.notificacao('error', this.props.t('common:erro'), this.props.t('common:erroComunicacaoServidor'))
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
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderPainelBusca() {
        const { getFieldDecorator } = this.props.form
        return (
            <Card title={this.props.t('listaRemessasScreen:buscarRemessas')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                            <Col span={24}>
                                <span>{this.props.t('listaRemessasScreen:numeroRemessa')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('numRemessa')(
                                        <InputNumber
                                            initialValue={17}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                            <Col span={24}>
                                <span>{this.props.t('listaRemessasScreen:numeroTombo')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('numTombo')(
                                        <InputNumber
                                            initialValue={17}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <Col span={24}>
                                <span>{this.props.t('listaRemessasScreen:herbario')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('herbario')(
                                        <Select placeholder={this.props.t('listaRemessasScreen:selecioneHerbario')} allowClear>
                                            {this.optionHerbario()}
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
                                                    usuarios: []
                                                })
                                                this.requisitaListaRemessas({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            {this.props.t('common:limpar')}
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
                                            {this.props.t('common:pesquisar')}
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

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaRemessas(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderFormulario() {
        return (
            <div>
                <HeaderListComponent title={this.props.t('listaRemessasScreen:titulo')} link="/remessas/novo" />
                <Divider dashed />
                {this.renderPainelBusca()}
                <Divider dashed />
                <ExpansiveTableComponent
                    columns={this.getColumns()}
                    metadados={this.state.metadados}
                    data={this.state.remessas}
                    subColumns={this.getSubColumns()}
                    loading={this.state.loading}
                    changePage={(pg, pageSize) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaRemessas(this.state.valores, pg, pageSize)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }

    render() {
        if (this.state.loadingPg) {
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

export default withTranslation()(Form.create()(ListaRemessasScreen))
