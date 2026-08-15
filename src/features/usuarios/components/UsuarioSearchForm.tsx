import {
  Button, Card, Col, Form, Input, Row
} from 'antd6'
import { useTranslation } from 'react-i18next'

import { Select } from '@/components/forms/Select'
import TotalRecordFound from '@/components/TotalRecordsFound'

import type { UsuarioListFilters } from '../types'

export interface UsuarioSearchFormProps {
  total?: number
  onSearch: (filters: UsuarioListFilters) => void
  onClear: () => void
}

export function UsuarioSearchForm({
  total, onSearch, onClear
}: UsuarioSearchFormProps) {
  const { t } = useTranslation('listaUsuariosScreen')
  const [form] = Form.useForm<UsuarioListFilters>()

  const tipoOptions = [
    { value: '1', label: t('tipoCurador') },
    { value: '2', label: t('tipoOperador') },
    { value: '3', label: t('tipoIdentificador') }
  ]

  const handleClear = () => {
    form.resetFields()
    onClear()
  }

  return (
    <Card title={t('buscarUsuario')}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSearch}
      >
        <Row gutter={8}>
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={8}
          >
            <Form.Item name="nome" label={t('buscarNome')}>
              <Input placeholder="Marcelo Caxambu" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={8}
          >
            <Form.Item name="email" label={t('buscarEmail')}>
              <Input placeholder="marcelo@gmail.com" type="email" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={8}
          >
            <Form.Item name="tipo" label={t('buscarTipo')}>
              <Select
                allowClear
                placeholder={t('selecioneTipo')}
                options={tipoOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={8}
          >
            <Form.Item name="telefone" label={t('buscarTelefone')}>
              <Input placeholder="+5544999682514" />
            </Form.Item>
          </Col>
        </Row>
        <Row align="middle" justify="end" gutter={16}>
          <Col
            xs={24}
            sm={8}
            md={12}
            lg={16}
            xl={16}
          >
            <TotalRecordFound total={total} />
          </Col>
          <Col
            xs={24}
            sm={8}
            md={6}
            lg={4}
            xl={4}
          >
            <Button
              onClick={handleClear}
              className="login-form-button"
              block
            >
              {t('common:limpar')}
            </Button>
          </Col>
          <Col
            xs={24}
            sm={8}
            md={6}
            lg={4}
            xl={4}
          >
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button ant-btn-pesquisar"
              block
            >
              {t('common:pesquisar')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}
