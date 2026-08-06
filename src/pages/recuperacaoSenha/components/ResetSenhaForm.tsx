import { useMemo, useState } from 'react'

import {
  Form, Input, Button, Typography, message, Progress, Space
} from 'antd'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

type Props = { onSuccess?: () => void }
type CatchError = { message: string }

function usePasswordStrength(pwd: string) {
  const { t } = useTranslation()
  return useMemo(() => {
    if (!pwd) return {
      score: 0, label: '', percent: 0
    }
    const checks = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^\w\s]/.test(pwd),
      pwd.length >= 8
    ]
    const score = checks.filter(Boolean).length
    const labels = [
      t('recuperacaoSenha:senhaMuitoFraca'),
      t('recuperacaoSenha:senhaFraca'),
      t('recuperacaoSenha:senhaOk'),
      t('recuperacaoSenha:senhaBoa'),
      t('recuperacaoSenha:senhaForte')
    ]
    return {
      score, label: labels[score - 1] || '', percent: (score / 5) * 100
    }
  }, [pwd, t])
}

export default function ResetSenhaForm({ onSuccess }: Props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const pwd = Form.useWatch('password', form) as string || ''
  const strength = usePasswordStrength(pwd)

  const handleFinish = async (values: { password: string; confirm: string }) => {
    if (values.password !== values.confirm) {
      await message.error(t('recuperacaoSenha:erroSenhasNaoCoincidem'))
      return
    }

    const query = new URLSearchParams(window.location.search)
    const token = query.get('token')

    if (!token) {
      await message.error(t('recuperacaoSenha:erroTokenInvalido'))
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
          novaSenha: values.password
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { mensagem?: string }
        throw new Error(data.mensagem || t('recuperacaoSenha:erroRedefinirSenha'))
      }
      await message.success(t('recuperacaoSenha:sucessoSenhaRedefinida'))
      window.location.href = '/inicio'
      onSuccess?.()
      form.resetFields()
    } catch (e: unknown) {
      const err = e as CatchError
      await message.error(err.message || t('recuperacaoSenha:erroFalhaRedefinirSenha'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Title level={3} style={{ marginBottom: 4, textAlign: 'center' }}>{t('recuperacaoSenha:definirNovaSenha')}</Title>
      <Paragraph type="secondary" style={{ marginTop: 0, textAlign: 'center' }}>
        {t('recuperacaoSenha:descricaoNovaSenha')}
      </Paragraph>

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="password"
          label={t('recuperacaoSenha:novaSenha')}
          rules={[
            { required: true, message: t('recuperacaoSenha:validacaoNovaSenha') },
            { min: 8, message: t('recuperacaoSenha:validacaoMinimoCaracteres') }
          ]}
          hasFeedback
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress percent={Math.round(strength.percent)} showInfo={false} />
            <Paragraph type="secondary" style={{ margin: 0 }}>
              {t('recuperacaoSenha:forca')}
              {' '}
              {strength.label || '—'}
            </Paragraph>
          </Space>
        </Form.Item>

        <Form.Item
          name="confirm"
          label={t('recuperacaoSenha:confirmarSenha')}
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: t('recuperacaoSenha:validacaoConfirmarSenha') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject(new Error(t('recuperacaoSenha:validacaoSenhasNaoCoincidem')))
              }
            })
          ]}
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('recuperacaoSenha:salvarNovaSenha')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
