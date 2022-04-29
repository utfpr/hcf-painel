import React from 'react';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as yup from 'yup';

import logo from '../assets/leaf.png';
import Input from '../components/Input';
import { wrapForm, useWhenFormSubmit } from '../helpers/form-helper';
import styles from './LoginPage.module.scss';

const validationSchema = yup.object({
    email: yup.string()
        .email('Deve ser informado um e-mail válido')
        .required('E-mail é obrigatório'),
    senha: yup.string()
        .min(8, 'Deve ser informado pelo menos 8 caracteres')
        .required('Senha é obrigatório'),
}).required();

const LoginPage = () => {
    useWhenFormSubmit((values, event) => {
        console.warn({ values });
        event.preventDefault();
    });

    return (
        <div className={styles.container}>
            <div className={styles.divOpaca}>
                <div className={styles.contentForm}>
                    <div className={styles.contentLogo}>
                        <img src={logo} alt="logo" className={styles.imageLogo} />
                        <div className={styles.textHcf}>
                            <strong>HCF</strong> - Herbário da universidade tecnológica federal do Paraná, Campo Mourão
                        </div>
                    </div>
                    <Input
                        required
                        size="large"
                        name="email"
                        className={styles.icon}
                        placeholder="E-mail"
                        prefix={<UserOutlined />}
                    />
                    <Input
                        required
                        size="large"
                        name="senha"
                        className={styles.icon}
                        type="password"
                        placeholder="Senha"
                        prefix={<LockOutlined />}
                    />
                    <div className={styles.forgotPassword}>
                        <a href="/">Esqueci a senha</a>
                    </div>
                    <Button size="large" className={styles.buttonSubmit} type="primary" htmlType="submit">
                        Entrar
                    </Button>
                    <div className={styles.divVisit}>
                        <a href="/admin">Entrar como visitante</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default wrapForm(LoginPage, { validationSchema });
