import { Component } from 'react'

import {
    Divider, Col, Row, Input, Button, Spin, notification
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'
import { CloseOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next'
import GalleryComponent from '../components/GalleryComponent'
import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import fotosTomboMap from '../helpers/fotos-tombo-map'

const { TextArea } = Input
const FormItem = Form.Item



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
        axios.get(`/pendencias/${this.props.match.params.pendencia_id}`)
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
                        this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('verPendencia:erroBuscarPendenciasGenerico'))
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
        axios.post(`/pendencias/${this.props.match.params.pendencia_id}`, { observacao, status: this.state.aprovar })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status == 204 || response.status == 200) {
                    this.notificacao('success', this.props.t('verPendencia:atualizacaoTitulo'), this.props.t('verPendencia:sucessoAtualizacaoMensagem'))
                    this.props.history.goBack()
                } else {
                    this.notificacao('warning', this.props.t('verPendencia:atualizacaoTitulo'), this.props.t('verPendencia:erroAtualizacaoMensagem'))
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                this.notificacao('warning', this.props.t('verPendencia:atualizacaoTitulo'), this.props.t('verPendencia:erroAtualizacaoMensagem'))
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
                                <span>{this.props.t('verPendencia:fotosAntigas')}</span>
                            </Col>
                            <Col span={24}>
                                <GalleryComponent fotos={fotosAntigas} />
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>{this.props.t('verPendencia:fotosNovas')}</span>
                            </Col>
                            <Col span={24}>
                                <GalleryComponent fotos={fotosNovas} />
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
        if (this.state.fotos.novas.length > 0) {
            const fotos = this.state.fotos.novas.map(fotosTomboMap)
            return (
                <div>
                    <Divider dashed />
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>{this.props.t('verPendencia:fotos')}</span>
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
                                <span>{this.props.t('verPendencia:observacao')}</span>
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
                                    {this.props.t('verPendencia:botaoAprovado')}
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
                                    {this.props.t('verPendencia:botaoReprovado')}
                                </Button>
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            )
        }
    }


    renderFormulario() {
            const columns = [
        {
            title: this.props.t('verPendencia:colunaCampo'),
            type: 'text',
            key: 'campo'
        },
        {
            title: this.props.t('verPendencia:colunaValorAntigo'),
            type: 'text',
            key: 'antigo'
        },
        {
            title: this.props.t('verPendencia:colunaValorNovo'),
            type: 'text',
            key: 'novo'
        }
        ]

        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.handleSubmit}>
                <HeaderListComponent title={this.props.t('verPendencia:tituloModificacoes')} add={false} />
                {this.renderFotos()}
                <Divider dashed />
                <Row gutter={8} style={{ marginBottom: '20px' }}>
                    <SimpleTableComponent
                        pageSize={30}
                        columns={columns}
                        data={this.state.data}
                        noAction
                        pagination={false}
                        total={0}
                    />
                </Row>
                <Divider dashed />

                {this.renderBotoesAprovar(getFieldDecorator)}
            </Form>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip={this.props.t('verPendencia:carregando')}>
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

const VerPendenciaScreenWithForm =
    Form.create()(VerPendenciaScreen)

export default withTranslation()(VerPendenciaScreenWithForm)
