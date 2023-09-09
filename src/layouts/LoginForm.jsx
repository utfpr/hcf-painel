import React, { useEffect } from 'react';
import {
	Form,
	Input,
	Button,
	Checkbox,
} from 'antd';

import { LockOutlined, MailOutlined } from '@ant-design/icons'

const FormItem = Form.Item;

const LoginForm = () => {
	const [form] = Form.useForm();
	const values = Form.useWatch([], form);

	useEffect(() => {
		form.validateFields({ validateOnly: true }).then(
			() => {
				//	setSubmittable(true);
			},
			() => {
				//	setSubmittable(false);
			},
		);
	}, [values]);


	const onSubmit = event => {
		event.preventDefault();
		//	this.props.form.validateFields(this.props.handleSubmit);
	};

	return (
		<Form
			form={form}
			name="control-hooks"
			onFinish={onSubmit}
		>
			<FormItem style={{ marginTop: '15px' }}
				rules={[
					{
						required: true,
						message: 'Insira o e-mail do usuário',
					},
				]}
			>
				<Input
					size="large"
					prefix={<MailOutlined />}
					placeholder="Email"
				/>
			</FormItem>
			<FormItem
				rules={[
					{
						required: true,
						message: 'Insira a senha do usuário',
					},
				]}
			>
				<Input
					size="large"
					type="password"
					placeholder="Senha"
					prefix={<LockOutlined />}
				/>
			</FormItem>
			<FormItem>
				<Checkbox>Lembrar me</Checkbox>
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

export default LoginForm;
