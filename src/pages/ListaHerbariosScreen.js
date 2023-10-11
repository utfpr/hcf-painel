import React, { Component } from 'react';
import {
	Divider, Icon, Modal, Card, Row, Col, Form,
	Input, Button, notification,
} from 'antd';
import axios from 'axios';
import SimpleTableComponent from '../components/SimpleTableComponent';
import { Link } from 'react-router-dom';
import HeaderListComponent from '../components/HeaderListComponent';
import { isCuradorOuOperador } from '../helpers/usuarios';

const confirm = Modal.confirm;
const FormItem = Form.Item;


class ListaHerbariosScreen extends Component {

	columns = [
		{
			title: "Sigla",
			type: "text",
			key: "sigla"
		},
		{
			title: "Nome",
			type: "text",
			key: "nome"
		},
		{
			title: "Endereço",
			type: "text",
			key: "endereco"
		},
		{
			title: "Email",
			type: "text",
			key: "email"
		},
	];

	constructor(props) {
		super(props);
		this.state = {
			herbarios: [],
			metadados: {},
			loading: true,
			pagina: 1
		}

		if (isCuradorOuOperador()) {
			this.columns.push({
				title: "Ação",
				key: "acao"
			});
		}
	}

	componentDidMount() {
		this.requisitaListaHerbarios({}, this.state.pagina);
	}

	gerarAcao = id => {
		if (isCuradorOuOperador()) {
			return (
				<span>
					<Link to={`/herbarios/${id}`}>
						<Icon type="edit" style={{ color: "#FFCC00" }} />
					</Link>
					<Divider type="vertical" />
					<a href="#" onClick={() => this.mostraMensagemDelete(id)}>
						<Icon type="delete" style={{ color: "#e30613" }} />
					</a>
				</span>
			)
		}
	}

	notificacao = (type, titulo, descricao) => {
		notification[type]({
			message: titulo,
			description: descricao,
		});
	};

	requisitaExclusao(id) {
		axios.delete(`/api/herbarios/${id}`)
			.then(response => {
				if (response.status === 204) {
					this.requisitaListaHerbarios(this.state.valores, this.state.pagina)
					this.notificacao('success', 'Excluir herbário', 'O herbário foi excluído com sucesso.')
				}
			})
			.catch(err => {
				const { response } = err;
				if (response && response.data) {
					if (response.status === 400 || response.status === 422) {
						this.notificacao("warning", "Falha", response.data.error.message);
					} else {
						this.notificacao("error", "Falha", "Houve um problema ao excluir o herbários, tente novamente.")
					}
					const { error } = response.data;
					console.error(error.message)
				}
			})
			.catch(() => {
				this.notificacao("error", "Falha", "Houve um problema ao excluir o herbário, tente novamente.")
			});
	}

	retornaEndereco(endereco) {
		var retorno = ""
		if (endereco !== null && endereco !== "") {
			if (endereco.logradouro != null) {
				retorno += endereco.logradouro
			}
			if (endereco.numero != null) {
				retorno += ` ${endereco.numero},`
			}
			if (endereco.cidade != null) {
				retorno += ` ${endereco.cidade.nome} -`
			}
			if (endereco.cidade != null && endereco.cidade.estado != null) {
				retorno += ` ${endereco.cidade.estado.nome}, `
			}
			if (endereco.cidade != null && endereco.cidade.estado != null) {
				retorno += ` ${endereco.cidade.estado.paise.nome} `
			}
			return retorno
		}
		return ""
	}

	formataDadosHerbarios = herbarios => herbarios.map(item => ({
		key: item.id,
		nome: item.nome,
		email: item.email === null ? "" : item.email,
		sigla: item.sigla,
		endereco: this.retornaEndereco(item.endereco),
		acao: this.gerarAcao(item.id),
	}));

	mostraMensagemDelete(id) {
		const self = this;
		confirm({
			title: 'Você tem certeza que deseja excluir este herbário?',
			content: 'Ao clicar em SIM, o herbário será excluído.',
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

	requisitaListaHerbarios = (valores, pg) => {
		let params = {
			pagina: pg
		}

		if (valores !== undefined) {
			const { nome, email, sigla } = valores;

			if (nome) {
				params.nome = nome;
			}
			if (email) {
				params.email = email;
			}
			if (sigla) {
				params.sigla = sigla;
			}
		}

		axios.get('/api/herbarios', { params })
			.then(response => {
				this.setState({
					loading: false
				})
				if (response.status === 200) {
					const { data } = response;
					this.setState({
						herbarios: this.formataDadosHerbarios(data.herbarios),
						metadados: data.metadados,
					});
				}
			})
			.catch(err => {
				this.setState({
					loading: false
				})
				const { response } = err;
				if (response && response.data) {
					if (response.status === 400 || response.status === 422) {
						this.notificacao("warning", "Falha", response.data.error.message);
					} else {
						this.notificacao("error", "Falha", "Houve um problema ao buscar os herbários, tente novamente.")
					}
					const { error } = response.data;
					console.error(error.message)
				}
			})
	}

	handleSubmit = (err, valores) => {
		if (!err) {
			if (valores.nome || valores.sigla || valores.email) {
				this.setState({
					valores: valores,
					loading: true
				})
				this.requisitaListaHerbarios(valores, this.state.pagina);
			} else {
				this.notificacao('warning', 'Buscar', 'Informe ao menos um campo para realizar a busca.');
			}
		}
	}

	onSubmit = event => {
		event.preventDefault();
		this.props.form.validateFields(this.handleSubmit);
	};

	renderPainelBusca(getFieldDecorator) {
		return (
			<Card title="Buscar Herbário">
				<Form onSubmit={this.onSubmit}>
					<Row gutter={8}>
						<Col xs={24} sm={12} md={8} lg={8} xl={8}>
							<Col span={24}>
								<span>Nome:</span>
							</Col>
							<Col span={24}>
								<FormItem>
									{getFieldDecorator('nome')(
										<Input placeholder={"Herbario do Centro Federal"} type="text" />
									)}
								</FormItem>
							</Col>
						</Col>
						<Col xs={24} sm={12} md={8} lg={8} xl={8}>
							<Col span={24}>
								<span>Email:</span>
							</Col>
							<Col span={24}>
								<FormItem>
									{getFieldDecorator('email')(
										<Input placeholder={"herbariofederal@gmail.com"} type="text" />
									)}
								</FormItem>
							</Col>
						</Col>
						<Col xs={24} sm={12} md={8} lg={8} xl={8}>
							<Col span={24}>
								<span>Sigla:</span>
							</Col>
							<Col span={24}>
								<FormItem>
									{getFieldDecorator('sigla')(
										<Input placeholder={"HCF"} type="text" />
									)}
								</FormItem>
							</Col>
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
													herbarios: []
												})
												this.requisitaListaHerbarios({}, 1);
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

	render() {
		const { getFieldDecorator } = this.props.form;

		return (
			<div>
				<HeaderListComponent title={"Listagem de Herbários"} link={"/herbarios/novo"} />
				<Divider dashed />
				{this.renderPainelBusca(getFieldDecorator)}
				<Divider dashed />
				<SimpleTableComponent
					columns={this.columns}
					data={this.state.herbarios}
					metadados={this.state.metadados}
					loading={this.state.loading}
					changePage={(pg) => {
						this.setState({
							pagina: pg,
							loading: true
						})
						this.requisitaListaHerbarios(this.state.valores, pg);
					}}
				/>
				<Divider dashed />
			</div>
		);
	}
}

export default Form.create()(ListaHerbariosScreen);
