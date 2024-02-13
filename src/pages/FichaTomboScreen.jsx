import { Component } from 'react'

import {
    Row, Col, Divider,
    Input, Button
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'
import { PrinterOutlined, SearchOutlined } from '@ant-design/icons'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { baseUrl } from '../config/api'

const FormItem = Form.Item

const columns = [
    {
        title: 'HCF',
        key: 'hcf'
    },
    {
        title: 'Data Coleta',
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
            tombos: []
        }
    }

    handleFormSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.validaCamposFormulario)
    }

    geraColunaAcao = tombo => (
        <a target="_blank" rel="noreferrer" href={`${baseUrl}/fichas/tombos/${tombo.hcf}`} title="Imprimir ficha">
            <PrinterOutlined style={{ color: '#277a01' }} />
        </a>
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

        axios.get('/tombos', { params })
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

    render() {
        const { getFieldDecorator } = this.props.form

        return (
            <Form onSubmit={this.handleFormSubmit}>
                <Row>
                    <Col span="24">
                        <h2 style={{ fontWeight: 200 }}>Ficha Tombo</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter="8">
                    <Col span="2">
                        <FormItem label={<span>HCF</span>}>
                            {getFieldDecorator('hcf')(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </Col>
                    <Col span="4">
                        <FormItem label={<span>Data de coleta</span>}>
                            {getFieldDecorator('data_coleta')(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </Col>
                    <Col span="6">
                        <FormItem label={<span>Nome científico</span>}>
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
                </Row>
                <Divider dashed />

                <SimpleTableComponent
                    columns={columns}
                    data={this.state.tombos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={page => {
                        console.log(`Clicou na página ${page}`)
                    }}
                />
            </Form>
        )
    }
}

export default Form.create()(FichaTomboScreen)
