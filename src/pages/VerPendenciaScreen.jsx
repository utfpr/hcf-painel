import { Component } from 'react'

import {
    Divider, Col, Row, Input, Button, Spin, notification
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'
import { CloseOutlined } from '@ant-design/icons'

import GalleryComponent from '../components/GalleryComponent'
import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import fotosTomboMap from '../helpers/fotos-tombo-map'

const { TextArea } = Input
const FormItem = Form.Item

const columns = [
    {
        title: 'Campo',
        type: 'text',
        key: 'campo'
    },
    {
        title: 'Valor antigo',
        type: 'text',
        key: 'antigo'
    },
    {
        title: 'Valor novo',
        type: 'text',
        key: 'novo'
    }
]

class VerPendenciaScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            data: [],
            aprovar: false,
            fotos: {
                novas: [],
                antigas: []
            },
            status: ''
        }
    }

    componentDidMount() {
        if (this.props.match.params.pendencia_id !== undefined) {
            this.requisitaPendencia()
        }
    }

    requisitaPendencia = () => {
        this.setState({
            loading: true
        })
        axios.get(`/api/pendencias/${this.props.match.params.pendencia_id}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        data: response.data.tabela,
                        fotos: response.data.fotos,
                        status: response.data.status
                    })
                }
                this.setState({
                    loading: false
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar as pendências, tente novamente.')
                    }
                    const { error } = response.data
                    console.error(error.message)
                } else {
                    throw err
                }
            })
    }

    notificacao = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    handleSubmit = () => {
        const { observacao } = this.props.form.getFieldsValue()
        this.setState({
            loading: true
        })
        axios.post(`/api/pendencias/${this.props.match.params.pendencia_id}`, { observacao, status: this.state.aprovar })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status == 204) {
                    this.notificacao('success', 'Atualização', 'A pendência foi atualizada com sucesso.')
                    this.props.history.goBack()
                } else {
                    this.notificacao('warning', 'Atualização', 'Houve um problema em atualizar a pendência.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                this.notificacao('warning', 'Atualização', 'Houve um problema em atualizar a pendência.')
                const { response } = err
                if (response && response.data) {
                    const value = {
                        mensagem: response.data.error.message,
                        codigo: response.status
                    }
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    renderFotos() {
        if (this.state.fotos.novas.length > 0 && this.state.fotos.antigas.length > 0) {
            const fotosNovas = this.state.fotos.novas.map(fotosTomboMap)
            const fotosAntigas = this.state.fotos.novas.map(fotosTomboMap)

            return (
                <div>
                    <Divider dashed />
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>Fotos antigas:</span>
                            </Col>
                            <Col span={24}>
                                <GalleryComponent fotos={fotosAntigas} />
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>Novas fotos:</span>
                            </Col>
                            <Col span={24}>
                                <GalleryComponent fotos={fotosNovas} />
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        } if (this.state.fotos.novas.length > 0) {
            const fotos = this.state.fotos.novas.map(fotosTomboMap)
            return (
                <div>
                    <Divider dashed />
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>Fotos:</span>
                            </Col>
                            <Col span={24}>
                                <GalleryComponent fotos={fotos} />
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderBotoesAprovar(getFieldDecorator) {
        if (this.state.status != 'APROVADO') {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '10px' }}>
                        <Col span={24}>
                            <Col span={24}>
                                <span>Observação:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('observacao')(
                                        <TextArea rows={8} />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Divider dashed />
                    <Row type="flex" justify="end">
                        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                            <FormItem>
                                <Button
                                    type="primary"
                                    icon="check"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: '#5cb85c',
                                        borderColor: '#4cae4c'
                                    }}
                                    onClick={() => this.setState({
                                        aprovar: 'APROVADO'
                                    })}
                                >
                                    Aprovar
                                </Button>
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                            <FormItem>
                                <Button
                                    type="primary"
                                    icon={<CloseOutlined />}
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: '#d9534f',
                                        borderColor: '#d43f3a'
                                    }}
                                    onClick={() => this.setState({
                                        aprovar: 'REPROVADO'
                                    })}
                                >
                                    Reprovar
                                </Button>
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.handleSubmit}>
                <HeaderListComponent title="Modificações" add={false} />
                {this.renderFotos()}
                <Divider dashed />
                <Row gutter={8} style={{ marginBottom: '20px' }}>
                    <SimpleTableComponent pageSize={30} columns={columns} data={this.state.data} noAction pagination={false} />
                </Row>
                <Divider dashed />

                {this.renderBotoesAprovar(getFieldDecorator)}
            </Form>
        )
    }

    render() {
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

export default Form.create()(VerPendenciaScreen)
