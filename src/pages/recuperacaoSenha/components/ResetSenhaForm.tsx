import { useMemo, useState } from 'react'
import { Form, Input, Button, Typography, message, Progress, Space } from 'antd'

const { Title, Paragraph } = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

function usePasswordStrength(pwd: string) {
  return useMemo(() => {
    if (!pwd) return { score: 0, label: '', percent: 0 }
    const checks = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^\w\s]/.test(pwd),
      pwd.length >= 8,
    ]
    const score = checks.filter(Boolean).length
    const labels = ['Muito fraca', 'Fraca', 'Ok', 'Boa', 'Forte']
    return { score, label: labels[score - 1] || '', percent: (score / 5) * 100 }
  }, [pwd])
}

export default function ResetSenhaForm({ onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const pwd = Form.useWatch('password', form) as string || ''
  const strength = usePasswordStrength(pwd)

  const handleFinish = async (values: { password: string; confirm: string }) => {
    if (values.password !== values.confirm) {
      await message.error('As senhas não coincidem.')
      return
    }

    const query = new URLSearchParams(window.location.search)
    const token = query.get('token')

    if (!token) {
      await message.error('Token de redefinição ausente ou inválido.')
      return
    }

    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL
      const response = await fetch(`${apiUrl}/usuarios/redefinir-senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          novaSenha: values.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.mensagem || 'Erro ao redefinir senha.')
      }
      await message.success('Senha redefinida com sucesso! Faça login com a nova senha.')
      window.location.href = '/inicio'
      onSuccess?.()
      form.resetFields()
    } catch (e: unknown) {
      const err = e as CatchError
      await message.error(err.message || 'Falha ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>Definir nova senha</Title>
      <Paragraph type="secondary" style={{ marginTop: 0, textAlign: 'center' }}>
        Crie uma senha forte para sua conta.
      </Paragraph>

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="password"
          label="Nova senha"
          rules={[
            { required: true, message: 'Informe a nova senha.' },
            { min: 8, message: 'Mínimo de 8 caracteres.' },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress percent={Math.round(strength.percent)} showInfo={false} />
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Força: {strength.label || '—'}
            </Paragraph>
          </Space>
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirmar senha"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Confirme a senha.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject(new Error('As senhas não coincidem.'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Salvar nova senha
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
