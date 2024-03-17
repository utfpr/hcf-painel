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

            this.notificacao('success', 'Sucesso', 'Identificador cadastrado com sucesso.')

            this.props.history.goBack()
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o identificador, tente novamente.')
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
            this.notificacao('error', 'Falha', 'Houve um problema ao buscar os dados do identificador, tente novamente.')
        } finally {
            this.setState({ loading: false })
        }
    }

    requisitaEdicaoIdentificador = async valores => {
        this.setState({ loading: true })

        try {
            await axios.put(`/identificadores/${this.props.match.params.identificador_id}`, valores)
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o identificador, tente novamente.')
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
                        <h2 style={{ fontWeight: 200 }}>Identificador</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Nome:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o nome do identificador'
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
                                Salvar
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

export default Form.create()(NovoIdentificadorScreen)
