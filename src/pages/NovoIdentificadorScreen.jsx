import { Component } from 'react'

import {

    Row,
    Col,
    Divider,
    Input,
    Button,
    notification,
    Spin
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

class NovoIdentificadorScreen extends Component {
    constructor(props) {
        super(props)
        this.state = { loading: false }
    }

    async componentDidMount() {
        if (this.props.match.params.identificador_id !== undefined) {
            await this.buscarIdentificadorPorId()
        }
    }

    notificacao = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            if (this.props.match.params.identificador_id !== undefined) {
                this.requisitaEdicaoIdentificador(valores)
            } else {
                this.requisitaCadastroIdentificador(valores)
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaCadastroIdentificador = async valores => {
        this.setState({ loading: true })

        try {
            await axios.post('/identificadores', valores)

            this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('novoIdentificadorScreen:sucessoCadastro'))

            this.props.history.push('/identificadores')
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoIdentificadorScreen:erroCadastro'))
        } finally {
            this.setState({ loading: false })
        }
    }

    buscarIdentificadorPorId = async () => {
        try {
            this.setState({ loading: true })

            const { data } = await axios.get(`/identificadores/${this.props.match.params.identificador_id}`)

            this.props.form.setFields({ nome: { value: data.nome } })
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoIdentificadorScreen:erroBuscarIdentificador'))
        } finally {
            this.setState({ loading: false })
        }
    }

    requisitaEdicaoIdentificador = async valores => {
        this.setState({ loading: true })

        try {
            await axios.put(`/identificadores/${this.props.match.params.identificador_id}`, valores)

            this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('novoIdentificadorScreen:sucessoAtualizacao'))

            this.props.history.push('/identificadores')
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoIdentificadorScreen:erroAtualizacao'))
        } finally {
            this.setState({ loading: false })
        }
    }

    renderFormulario() {
        const { getFieldDecorator, getFieldError } = this.props.form
        return (
            <Form onSubmit={this.onSubmit}>
                <Row>
                    <Col span={12}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('novoIdentificadorScreen:titulo')}</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoIdentificadorScreen:nome')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoIdentificadorScreen:validacaoNome')
                                    }]
                                })(
                                    <Input
                                        placeholder="D. Zappi"
                                        type="text"
                                        status={getFieldError('nome') ? 'error' : ''}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>

                <Row type="flex" justify="end">
                    <Col xs={24} sm={8} md={8} lg={4} xl={4}>
                        {' '}
                        <FormItem>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="login-form-button"
                            >
                                {this.props.t('novoIdentificadorScreen:salvar')}
                            </Button>
                        </FormItem>
                    </Col>
                </Row>
                <Divider dashed />
            </Form>
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

export default withTranslation()(Form.create()(NovoIdentificadorScreen))
