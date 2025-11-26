import { useState } from 'react'
import { Form, Input, Button, Typography, message } from 'antd'
import axios from 'axios'

const { Title, Paragraph, Text } = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

export default function RecuperarSenhaForm({ onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleFinish = async (values: { email: string }) => {
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      await axios.post(`${apiUrl}/usuarios/solicitar-redefinicao-senha`, values, {
        headers: { 'Content-Type': 'application/json' },
      })

      message.success('Se existir uma conta com este e-mail, enviaremos instruções de recuperação.')
      onSuccess?.()
      form.resetFields()
    } catch (error: unknown) {
      const err = error as CatchError
      const errorMessage =
        axios.isAxiosError(error)
          ? error.response?.data?.mensagem ||
            'Erro ao solicitar recuperação de senha.'
          : err.message || 'Falha ao enviar solicitação. Tente novamente.'

      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>
        Recuperar senha
      </Title>
      <Paragraph type="secondary" style={{ marginTop: 0, textAlign: 'center' }}>
        Informe seu e-mail para receber um link de redefinição.
      </Paragraph>

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { required: true, message: 'Informe o e-mail.' },
            { type: 'email', message: 'E-mail inválido.' },
          ]}
        >
          <Input placeholder="seuemail@exemplo.com" autoComplete="email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Enviar link de recuperação
          </Button>
        </Form.Item>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Se seu endereço de email existir em nossa base de dados, você receberá um email com um link
          para redefinir sua senha.
        </Text>
      </Form>
    </div>
  )
}
