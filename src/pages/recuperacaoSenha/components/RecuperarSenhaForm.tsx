import { useState } from 'react'
import { Form, Input, Button, Typography, message } from 'antd'

const { Title, Paragraph, Text } = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

export default function RecuperarSenhaForm({ onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleFinish = async (values: { email: string }) => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL
      const response = await fetch(`${apiUrl}/usuarios/solicitar-reset-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.mensagem || 'Erro ao solicitar recuperação de senha.')
      }

      await message.success('Se existir uma conta com este e-mail, enviaremos instruções de recuperação.')
      onSuccess?.()
      form.resetFields()
    } catch (e: unknown) {
      const err = e as CatchError
      await message.error(err.message || 'Falha ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>Recuperar senha</Title>
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
          *Por segurança, a resposta é genérica (não revela se o e-mail existe).
        </Text>
      </Form>
    </div>
  )
}
