import React from 'react';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/leaf.png';
import Input from '../components/Input';
import { wrapForm } from '../helpers/form-helper';
import useAsync from '../hooks/use-async';
import useDidMount from '../hooks/use-did-mount';
import usuariosService from '../services/usuarios';
import useAuth from '../stores/usuarios';
import styles from './LoginPage.module.scss';

// const validationSchema = yup.object({
//   email: yup.string()
//     .email('Deve ser informado um e-mail válido')
//     .required('E-mail é obrigatório'),
//   senha: yup.string()
//     .min(8, 'Deve ser informado pelo menos 8 caracteres')
//     .required('Senha é obrigatório'),
// }).required();

interface IFormValues {
  email: string;
  senha: string;
}

interface ILoginPageProps {
  // form: UseFormReturn<IFormValues>;
  handleSubmit: (onValid: SubmitHandler<IFormValues>, event?: React.BaseSyntheticEvent) => void;
}

const LoginPage: React.FunctionComponent<ILoginPageProps> = ({ handleSubmit }) => {
  const navigate = useNavigate();
  const { isAutenticado, login } = useAuth();

  const [loading, requestLogin] = useAsync(usuariosService.login);

  handleSubmit(async (values, event) => {
    event?.preventDefault();
    const response = await requestLogin(values.email, values.senha);
    login(response.token, response.usuario);
    navigate('/admin');
  });

  useDidMount(() => {
    if (isAutenticado) {
      navigate('/admin');
    }
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
          <Button
            size="large"
            className={styles.buttonSubmit}
            type="primary"
            htmlType="submit"
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </Button>
          <div className={styles.divVisit}>
            <a href="/admin">Entrar como visitante</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default wrapForm(LoginPage);
