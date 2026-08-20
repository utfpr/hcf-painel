import { useState } from 'react'

import {
  App, Form, Input, Select
} from 'antd6'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { EntityDrawer } from '@/components/list/EntityDrawer'

import type { CreateUsuarioPayload } from '../types'

interface AddUserFormValues {
  nome: string
  email: string
  tipo: string
  ra?: string
  telefone?: string
  password: string
}

interface AddUserDrawerProps {
  open: boolean
  onClose: () => void
  onCreate: (payload: CreateUsuarioPayload) => Promise<boolean>
}

export function AddUserDrawer({
  open, onClose, onCreate
}: AddUserDrawerProps) {
  const { t } = useTranslation()
  const { notification } = App.useApp()
  const [form] = Form.useForm<AddUserFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string>()

  const close = () => {
    if (submitting) return
    form.resetFields()
    setEmailError(undefined)
    onClose()
  }

  const submit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      setEmailError(undefined)
      const payload: CreateUsuarioPayload = {
        nome: values.nome,
        email: values.email,
        senha: values.password,
        tipo_usuario_id: Number(values.tipo),
        herbario_id: 1,
        ra: values.ra?.trim() || undefined,
        telefone: values.telefone?.trim() || undefined
      }
      const created = await onCreate(payload)
      if (created) {
        form.resetFields()
        onClose()
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        setEmailError(t('novoUsuarioScreen:erroCadastroEmailUnico'))
        return
      }
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error(error)
      notification.error({
        message: t('users:create.errorTitle'),
        description: t('users:create.error')
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <EntityDrawer
      title={t('users:create.title')}
      open={open}
      onClose={close}
      onSubmit={() => {
        void submit()
      }}
      submitLabel={t('users:create.submit')}
      cancelLabel={t('common:cancelar')}
      submitting={submitting}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={() => {
          void submit()
        }}
      >
        <Form.Item
          name="nome"
          label={t('novoUsuarioScreen:nome')}
          rules={[{ required: true, message: t('novoUsuarioScreen:validacaoNome') }]}
        >
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('novoUsuarioScreen:email')}
          validateStatus={emailError ? 'error' : undefined}
          help={emailError}
          rules={[
            { required: true, message: t('novoUsuarioScreen:validacaoEmail') },
            { type: 'email', message: t('novoUsuarioScreen:validacaoEmail') }
          ]}
        >
          <Input type="email" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="telefone"
          label={t('novoUsuarioScreen:telefone')}
        >
          <Input autoComplete="tel" />
        </Form.Item>
        <Form.Item
          name="tipo"
          label={t('users:filters.role')}
          rules={[{ required: true, message: t('novoUsuarioScreen:validacaoTipo') }]}
        >
          <Select
            options={[
              { value: '1', label: t('users:roles.curator') },
              { value: '2', label: t('users:roles.operator') },
              { value: '3', label: t('users:roles.identifier') }
            ]}
          />
        </Form.Item>
        <Form.Item name="ra" label={t('novoUsuarioScreen:ra')}>
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('novoUsuarioScreen:senha')}
          rules={[{ required: true, message: t('novoUsuarioScreen:validacaoSenha') }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </EntityDrawer>
  )
}
