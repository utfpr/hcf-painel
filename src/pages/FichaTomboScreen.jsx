import { Component } from 'react'

import {
    Row, Col, Divider,
    Input, Button
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { PrinterOutlined, SearchOutlined } from '@ant-design/icons'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { baseUrl, fichaTomboUrl } from '../config/api'

const FormItem = Form.Item

const columns = [
    {
        title: 'HCF',
        key: 'hcf'
    },
    {
        title: 'Data coleta',
        key: 'data_coleta'
    },
    {
        title: 'Nome científico',
        key: 'nome_cientifico'
    },
    {
        title: 'Ação',
        key: 'acao'
    }
]

class FichaTomboScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tombos: [],
            metadados: {}
        }
    }

    componentDidMount() {
        axios.get('/tombos', { })
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

    geraColunaAcao = tombo => (
        <div>
            <a target="_blank" rel="noreferrer" href={`${fichaTomboUrl}/fichas/tombos/${tombo.hcf}/1`} title="Imprimir ficha com código de barras">
                <PrinterOutlined style={{ color: '#277a01' }} />
            </a>
            <Divider type="vertical" />
            <a target="_blank" rel="noreferrer" href={`${fichaTomboUrl}/fichas/tombos/${tombo.hcf}/0`} title="Imprimir ficha sem código de barras">
                <PrinterOutlined style={{ color: '#0066ff' }} />
            </a>
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
            </Form>
        )
    }
}

export default Form.create()(FichaTomboScreen)
