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

class NovoColetorScreen extends Component {
    constructor(props) {
        super(props)
        this.state = { loading: false }
    }

    async componentDidMount() {
        if (this.props.match.params.coletor_id !== undefined) {
            await this.buscarColetorPorId()
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
            if (this.props.match.params.coletor_id !== undefined) {
                this.requisitaEdicaoColetor(valores)
            } else {
                this.requisitaCadastroColetor(valores)
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaCadastroColetor = async valores => {
        this.setState({ loading: true })

        try {
            await axios.post('/coletores', valores)

            this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('novoColetorScreen:sucessoCadastro'))

            this.props.history.push('/coletores')
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoColetorScreen:erroCadastro'))
        } finally {
            this.setState({ loading: false })
        }
    }

    buscarColetorPorId = async () => {
        try {
            this.setState({ loading: true })

            const { data } = await axios.get(`/coletores/${this.props.match.params.coletor_id}`)

            this.props.form.setFields({ nome: { value: data.nome } })
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoColetorScreen:erroBuscarColetor'))
        } finally {
            this.setState({ loading: false })
        }
    }

    requisitaEdicaoColetor = async valores => {
        this.setState({ loading: true })

        try {
            await axios.put(`/coletores/${this.props.match.params.coletor_id}`, valores)

            this.notificacao('success', this.props.t('common:tituloSucesso'), this.props.t('novoColetorScreen:sucessoAtualizacao'))

            this.props.history.push('/coletores')
        } catch (err) {
            this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoColetorScreen:erroAtualizacao'))
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('novoColetorScreen:tituloColetor')}</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoColetorScreen:nome')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoColetorScreen:validacaoNome')
                                    }]
                                })(
                                    <Input
                                        placeholder="M.G. Caxambú"
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
                                {this.props.t('novoColetorScreen:salvar')}
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

export default withTranslation()(Form.create()(NovoColetorScreen))
