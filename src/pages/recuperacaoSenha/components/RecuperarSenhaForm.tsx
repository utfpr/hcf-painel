import { useState } from 'react'

import {
  Form, Input, Button, Typography, message
} from 'antd'
import { useTranslation } from 'react-i18next'

const {
  Title, Paragraph, Text
} = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

export default function RecuperarSenhaForm({ onSuccess }: Props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleFinish = async (values: { email: string }) => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL
      const response = await fetch(`${apiUrl}/usuarios/solicitar-reset-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { mensagem?: string }
        throw new Error(data.mensagem || t('recuperacaoSenha:mensagemErroRecuperacao'))
      }

      await message.success(t('recuperacaoSenha:mensagemSucessoRecuperacao'))
      onSuccess?.()
      form.resetFields()
    } catch (e: unknown) {
      const err = e as CatchError
      await message.error(err.message || t('recuperacaoSenha:mensagemErroRecuperacao'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>{t('recuperacaoSenha:recuperarSenha')}</Title>
      <Paragraph type="secondary" style={{ marginTop: 0, textAlign: 'center' }}>
        {t('recuperacaoSenha:descricaoRecuperarSenha')}
      </Paragraph>

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { required: true, message: t('recuperacaoSenha:validacaoInformeEmail') },
            { type: 'email', message: t('recuperacaoSenha:validacaoEmailInvalido') }
          ]}
        >
          <Input placeholder={t('recuperacaoSenha:placeholderEmail')} autoComplete="email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('recuperacaoSenha:enviarLinkRecuperacao')}
          </Button>
        </Form.Item>

        <Text type="secondary" style={{ fontSize: 12 }}>
          {t('recuperacaoSenha:mensagemSeguranca')}
        </Text>
      </Form>
    </div>
  )
}
