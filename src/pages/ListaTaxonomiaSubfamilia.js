import React, { Component } from 'react';
import {
    Divider, Icon, Modal, Card, Spin, Row, Col, Form,
    Select, Input, Button, notification,
} from 'antd';
import axios from 'axios';
import SimpleTableComponent from '../components/SimpleTableComponent';
import ModalCadastroComponent from '../components/ModalCadastroComponent';
import { isCuradorOuOperador } from '../helpers/usuarios';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;

const columns = [
    {
        title: "Subfamilia",
        type: "text",
        key: "subfamilia"
    },
    {
        title: "Ação",
        key: "acao"
    }
];

class ListaTaxonomiaSubfamilia extends Component {

    constructor(props) {
        super(props);
        this.state = {
            subfamilias: [],
            metadados: {},
            familias: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            titulo: 'Cadastrar',
            id: -1,
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/api/subfamilias/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A Subfamilia foi excluída com sucesso.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
    }


    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao,
        });
    };

    mostraMensagemDelete(id) {
        const self = this;
        confirm({
            title: 'Você tem certeza que deseja excluir esta subfamilia?',
            content: 'Ao clicar em SIM, a subfamilia será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {
                self.requisitaExclusao(id);
            },
            onCancel() {
            },
        });
    }

    componentDidMount() {
        this.requisitaListaSubfamilia({}, this.state.pagina);
        this.requisitaFamilias();
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => {
                        this.props.form.setFields({
                            nomeSubfamilia: {
                                value: item.nome,
                            },
                            nomeFamilia: {
                                value: item.familia_id
                            }
                        });
                        this.setState({
                            visibleModal: true,
                            id: item.id,
                            titulo: 'Atualizar'
                        });
                    }}>
                        <Icon type="edit" style={{ color: "#FFCC00" }} />
                    </a>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => this.mostraMensagemDelete(item.id)}>
                        <Icon type="delete" style={{ color: "#e30613" }} />
                    </a>
                </span>
            )
        }
        return undefined;
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
        });
    };

    formataDadosSubfamilia = subfamilias => subfamilias.map(item => ({
        key: item.id,
        subfamilia: item.nome,
        acao: this.gerarAcao(item),
    }));

    requisitaListaSubfamilia = (valores, pg) => {
        let params = {
            pagina: pg
        }

        if (valores !== undefined) {
            const { subfamilia } = valores;

            if (subfamilia) {
                params.subfamilia = subfamilia;
            }
        }
        axios.get('/api/subfamilias', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response;
                    this.setState({
                        subfamilias: this.formataDadosSubfamilia(data.resultado),
                        metadados: data.metadados
                    });
                } else if (response.status === 400) {
                    this.notificacao('warning', 'Buscar', 'Erro ao buscar as subfamilias.')
                } else {
                    this.notificacao('error', 'Error', 'Erro do servidor ao buscar os subfamilias.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError);
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores: valores,
                loading: true
            })
            this.requisitaListaSubfamilia(valores, this.state.pagina);
        }
    }

    onSubmit = event => {
        event.preventDefault();
        this.props.form.validateFields(this.handleSubmit);
    };

    cadastraNovaSubfamilia() {
        this.setState({
            loading: true
        })
        axios.post('/api/subfamilias/', {
            nome: this.props.form.getFieldsValue().nomeSubfamilia,
            familia_id: this.props.form.getFieldsValue().nomeFamilia,
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia();
                    this.openNotificationWithIcon("success", "Sucesso", "O cadastro foi realizado com sucesso.")
                } else if (response.status === 400) {
                    this.openNotificationWithIcon("warning", "Falha", response.data.error.message);
                } else {
                    this.openNotificationWithIcon("error", "Falha", "Houve um problema ao cadastrar a nova subfamilia, tente novamente.")
                }
                this.props.form.setFields({
                    nomeSubfamilia: {
                        value: '',
                    },
                });
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError);
    }

    atualizaSubfamilia() {
        this.setState({
            loading: true
        })
        axios.put(`/api/subfamilias/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeSubfamilia,
            familia_id: this.props.form.getFieldsValue().nomeFamilia,
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia();
                    this.openNotificationWithIcon("success", "Sucesso", "A atualização foi realizada com sucesso.")
                } else if (response.status === 400) {
                    this.openNotificationWithIcon("warning", "Falha", response.data.error.message);
                } else {
                    this.openNotificationWithIcon("error", "Falha", "Houve um problema ao atualizar a subfamilia, tente novamente.")
                }
                this.props.form.setFields({
                    nomeSubfamilia: {
                        value: '',
                    },
                });
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError);
    }

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon="plus"
                    onClick={() => {
                        this.setState({
                            visibleModal: true,
                            titulo: 'Cadastrar',
                            id: -1,
                        })
                    }}
                    style={{ backgroundColor: "#5CB85C", borderColor: "#5CB85C" }}
                >
                    Adicionar
                                </Button>

            )
        }
        return undefined;
    }

    requisitaFamilias = () => {
        axios.get('/api/familias/', {
            params: {
                limite: 9999999,
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        familias: response.data.resultado
                    });
                } else {
                    this.openNotificationWithIcon("error", "Falha", "Houve um problema ao buscar familias, tente novamente.")
                }
            })
            .catch(err => {
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError);
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar Subfamilia">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Nome da subfamilia:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('subfamilia')(
                                    <Input placeholder={"Bromeliaceae"} type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Row type="flex" justify="end" gutter={4}>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                this.props.form.resetFields();
                                                this.setState({
                                                    pagina: 1,
                                                    valores: {},
                                                    metadados: {},
                                                    usuarios: []
                                                })
                                                this.requisitaListaSubfamilia({}, 1);
                                            }}
                                            className="login-form-button"
                                        >
                                            Limpar
									</Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
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

    optionFamilia = () => this.state.familias.map(item => (
        <Option value={item.id}>{item.nome}</Option>
    ));

    renderFormulario() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Form onSubmit={this.handleSubmitForm}>
                    <ModalCadastroComponent title={this.state.titulo} visibleModal={this.state.visibleModal} loadingModal={this.state.loadingModal}
                        onCancel={
                            () => {
                                this.setState({
                                    visibleModal: false,
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeSubfamilia && this.props.form.getFieldsValue().nomeSubfamilia.trim() !== '') {
                                    this.cadastraNovaSubfamilia();
                                } else {
                                    this.openNotificationWithIcon("warning", "Falha", "Informe o nome da nova subfamilia e da familia.");
                                }
                            } else {
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeSubfamilia && this.props.form.getFieldsValue().nomeSubfamilia.trim() !== '') {
                                    this.atualizaSubfamilia();
                                } else {
                                    this.openNotificationWithIcon("warning", "Falha", "Informe o nome da nova subfamilia e da familia.");
                                }
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}>

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome da familia:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeFamilia')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione uma familia"
                                                optionFilterProp="children"

                                            >

                                                {this.optionFamilia()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome da subfamilia:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeSubfamilia')(
                                            <Input placeholder={""} type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: "20px" }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={21}>
                        <h2 style={{ fontWeight: 200 }}>Subfamilias</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={3}>
                        {this.renderAdd()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.subfamilias}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaSubfamilia(this.state.valores, pg);
                    }}
                />
                <Divider dashed />
            </div>
        );
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
        );
    }
}
export default Form.create()(ListaTaxonomiaSubfamilia);
