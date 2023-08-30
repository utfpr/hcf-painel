import React, { Component } from 'react';
import {
	Form,
	Icon,
	Input,
	Button,
	Checkbox,
} from 'antd';

const FormItem = Form.Item;

class LoginForm extends Component {

	onSubmit = event => {
		event.preventDefault();
		this.props.form.validateFields(this.props.handleSubmit);
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<Form onSubmit={this.onSubmit}>
				<FormItem style={{ marginTop: '15px' }}>
					{getFieldDecorator('email', {
						rules: [{
							required: true,
							message: 'Insira o e-mail do usuário',
						}]
					})(
						<Input
							prefix={<Icon type="mail" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
							placeholder="Email"
						/>
					)}
				</FormItem>
				<FormItem>
					{getFieldDecorator('senha', {
						rules: [{
							required: true,
							message: 'Insira a senha do usuário',
						}]
					})(
						<Input
							type="password"
							placeholder="Senha"
							prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
						/>
					)}
				</FormItem>
				<FormItem>
					{getFieldDecorator('lembrar')(
						<Checkbox>Lembrar me</Checkbox>
					)}
					<a href="/recuperar-senha" className="login-form-forgot">Esqueci a senha</a>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
					>
						Entrar
					</Button>
				</FormItem>
			</Form>
		);
	}
}

export default Form.create()(LoginForm);
