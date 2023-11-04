import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Input, Button, notification
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'

const { confirm } = Modal
const FormItem = Form.Item

const columns = [
    {
        title: 'Familia',
        type: 'text',
        key: 'familia'
    },
    {
        title: 'Subfamilia',
        type: 'text',
        key: 'subfamilia'
    },
    {
        title: 'Gênero',
        type: 'text',
        key: 'genero'
    },
    {
        title: 'Espécie',
        type: 'text',
        key: 'especie'
    },
    {
        title: 'Subespécie',
        type: 'text',
        key: 'subspecie'
    },
    {
        title: 'Variedades',
        type: 'text',
        key: 'variedade'
    },
    {
        title: 'Ação',
        key: 'acao'
    }
]

class ListaTaxonomiaScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            taxonomias: [],
            metadados: {},
            loading: true,
            pagina: 1
        }
    }

    requisitaExclusao(id) {
        axios.delete(`/taxonomias/${id}`)
            .then(response => {
                if (response.status === 204) {
                    this.requisitaListaTaxonomias(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir tombo', 'A taxonomia foi excluída com sucesso.')
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

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir esta taxonomia?',
            content: 'Ao clicar em SIM, a taxonomia será excluída.',
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
        this.requisitaListaTaxonomias({}, this.state.pagina)
    }

    gerarAcao(id) {
        return (
            <span>
                <Divider type="vertical" />
                <Link to={`/taxonomias/${id}`}>
                    <EditOutlined style={{ color: '#FFCC00' }} />
                </Link>
                <Divider type="vertical" />
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    formataDadosTaxonomia = taxonomias => {
        let cont = 0
        return taxonomias.map(item => ({
            key: cont++,
            familia: item.familia,
            subfamilia: item.sub_familia,
            genero: item.genero,
            especie: item.especie,
            subespecie: item.sub_especie,
            variedade: item.variedade,
            acao: this.gerarAcao(item.hcf)
        }))
    }

    requisitaListaTaxonomias = (valores, pg) => {
        const params = {
            pagina: pg
        }

        if (valores !== undefined) {
            const {
                familia, subfamilia, genero, especie, subespecie, variedade
            } = valores

            if (familia) {
                params.familia = familia
            }
            if (subfamilia) {
                params.subfamilia = subfamilia
            }
            if (genero) {
                params.genero = genero
            }
            if (especie) {
                params.especie = especie
            }
            if (subespecie) {
                params.subespecie = subespecie
            }
            if (variedade) {
                params.variedade = variedade
            }
        }
        axios.get('/taxonomias', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        taxonomias: this.formataDadosTaxonomia(data.resultado),
                        metadados: data.metadados
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

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaTaxonomias(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar Tombo">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={8}>
                            <span>Familia:</span>
                        </Col>
                        <Col span={8}>
                            <span>Subfamilia:</span>
                        </Col>
                        <Col span={8}>
                            <span>Gênero:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('familia')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('subfamilia')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('genero')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={8}>
                            <span>Espécie:</span>
                        </Col>
                        <Col span={8}>
                            <span>Subespécie:</span>
                        </Col>
                        <Col span={8}>
                            <span>Variedade:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('especie')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('subespecie')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem>
                                {getFieldDecorator('variedade')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Row type="flex" justify="end">
                                <Col span={4} style={{ marginRight: '10px' }}>
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
                                                this.requisitaListaTaxonomias({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            Limpar
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col span={4}>
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

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.onSubmit}>
                <HeaderListComponent title="Taxonomias" link="/taxonomias/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.taxonomias}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={pg => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaTaxonomias(this.state.valores, pg)
                    }}
                />
                <Divider dashed />
            </Form>
        )
    }
}
export default Form.create()(ListaTaxonomiaScreen)
