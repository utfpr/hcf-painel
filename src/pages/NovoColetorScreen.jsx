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

            this.notificacao('success', 'Sucesso', 'Coletor cadastrado com sucesso.')

            this.props.history.goBack()
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o coletor, tente novamente.')
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
            this.notificacao('error', 'Falha', 'Houve um problema ao buscar os dados do coletor, tente novamente.')
        } finally {
            this.setState({ loading: false })
        }
    }

    requisitaEdicaoColetor = async valores => {
        this.setState({ loading: true })

        try {
            await axios.put(`/coletores/${this.props.match.params.coletor_id}`, valores)

            this.notificacao('success', 'Sucesso', 'Coletor atualizado com sucesso.')

            this.props.history.goBack()
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o coletor, tente novamente.')
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
                        <h2 style={{ fontWeight: 200 }}>Coletor</h2>
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
                                        message: 'Insira o nome do coletor'
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

export default Form.create()(NovoColetorScreen)
