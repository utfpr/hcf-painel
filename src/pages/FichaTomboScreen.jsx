import { Component } from 'react'

import {
    Row, Col, Divider,
    Input, Button, Modal, InputNumber
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { PrinterOutlined, SearchOutlined } from '@ant-design/icons'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { fichaTomboUrl } from '../config/api'

const FormItem = Form.Item

const columns = [
    {
        title: 'HCF',
        key: 'hcf',
        width: 100
    },
    {
        title: 'Data coleta',
        key: 'data_coleta',
        width: 500
    },
    {
        title: 'Nome científico',
        key: 'nome_cientifico',
        width: 500
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

class FichaTomboScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tombos: [],
            metadados: {},
            modalVisible: false,
            copiaComCodigo: true,
            tomboSelecionado: null,
            quantidadeCopias: 1
        }
    }

    componentDidMount() {
        axios.get('/tombos', {})
            .then(response => {
                const { data } = response
                const { metadados, tombos } = data

                this.setState({
                    loading: false,
                    metadados,
                    tombos: tombos.map(this.formataTomboItem)
                })
            })
            .catch(err => {
                console.error(err)
            })

        this.setState({
            loading: true
        })
    }

    handleFormSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.validaCamposFormulario)
    }

    abrirModalImpressao = (tombo, comCodigo) => {
        this.setState({
            modalVisible: true,
            tomboSelecionado: tombo,
            copiaComCodigo: comCodigo,
            quantidadeCopias: 1
        })
    }

    confirmarImpressao = () => {
        const { tomboSelecionado, copiaComCodigo, quantidadeCopias } = this.state
        const url = `${fichaTomboUrl}/fichas/tombos/${tomboSelecionado.hcf}/${copiaComCodigo ? 1 : 0}?qtd=${quantidadeCopias}`
        window.open(url, '_blank')
        this.setState({ modalVisible: false })
    }

    geraColunaAcao = tombo => (
        <div>
            <Button
                type="link"
                icon={<PrinterOutlined style={{ color: '#277a01' }} />}
                onClick={() => this.abrirModalImpressao(tombo, true)}
                title="Imprimir ficha com código de barras"
            />
            <Divider type="vertical" />
            <Button
                type="link"
                icon={<PrinterOutlined style={{ color: '#0066ff' }} />}
                onClick={() => this.abrirModalImpressao(tombo, false)}
                title="Imprimir ficha sem código de barras"
            />
        </div>
    )

    geraColunaDataColeta = (...args) => {
        const saida = args.reduce((saida, arg) => {
            if (arg) {
                saida.push(arg)
            }

            return saida
        }, [])

        return saida.join('/')
    }

    formataTomboItem = tombo => ({
        ...tombo,
        acao: this.geraColunaAcao(tombo),
        data_coleta: this.geraColunaDataColeta(tombo.data_coleta_dia, tombo.data_coleta_mes, tombo.data_coleta_ano)
    })

    obtemTombos = (params, meta = this.metadados) => {
        axios.get('/tombos', { params: { ...params, ...meta } })
            .then(response => {
                const { data } = response
                const { metadados, tombos } = data

                this.setState({
                    loading: false,
                    metadados,
                    tombos: tombos.map(this.formataTomboItem)
                })
            })
            .catch(err => {
                console.error(err)
            })
    }

    validaCamposFormulario = (err, values) => {
        const params = Object.entries(values)
            .filter(entrada => {
                const [, valor] = entrada
                return !!valor
            })
            .reduce((saida, entrada) => {
                const [chave, valor] = entrada
                return {
                    ...saida,
                    [chave]: valor
                }
            }, {})

        this.setState({ loading: true })

        this.obtemTombos(params)
    }

    render() {
        const { getFieldDecorator } = this.props.form

        return (
            <Form onSubmit={this.handleFormSubmit}>
                <Row>
                    <Col span="24">
                        <h2 style={{ fontWeight: 200 }}>Ficha tombo</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter="8">
                    <Col span="2">
                        <FormItem label={<span>HCF:</span>}>
                            {getFieldDecorator('hcf')(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </Col>
                    <Col span="4">
                        <FormItem label={<span>Data de coleta:</span>}>
                            {getFieldDecorator('data_coleta')(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </Col>
                    <Col span="6">
                        <FormItem label={<span>Nome científico:</span>}>
                            {getFieldDecorator('nome_cientifico')(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter="8" style={{ marginTop: 32 }}>
                    <Col span="24">
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            Pesquisar
                        </Button>
                    </Col>

                    <Col xs={24} sm={8} md={12} lg={16} xl={16} style={{ marginTop: 16 }}>
                        <TotalRecordFound
                            total={this.state.metadados?.total}
                        />
                    </Col>
                </Row>
                <Divider dashed />

                <SimpleTableComponent
                    columns={columns}
                    data={this.state.tombos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(page, pageSize) => {
                        this.obtemTombos(null, { pagina: page, limite: pageSize })
                    }}
                />

                <Modal
                    title="Impressão de ficha"
                    visible={this.state.modalVisible}
                    onOk={this.confirmarImpressao}
                    onCancel={() => this.setState({ modalVisible: false })}
                    okText="Imprimir"
                    cancelText="Cancelar"
                >
                    <p>Informe o número de cópias:</p>
                    <InputNumber
                        min={1}
                        max={50}
                        value={this.state.quantidadeCopias}
                        onChange={value => this.setState({ quantidadeCopias: value })}
                    />
                </Modal>
            </Form>
        )
    }
}

export default Form.create()(FichaTomboScreen)
