import { useEffect, useState } from 'react'

import {
  Alert,
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Spin
} from 'antd6'
import type { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import {
  toFormValues,
  type EditarExpedicaoFormValues
} from './api/expedicaoEdicaoContract'
import { DestinoEdicaoFormField } from './components/DestinoEdicaoFormField'
import { ParticipantesEdicaoFormField } from './components/ParticipantesEdicaoFormField'
import { useEditarExpedicaoPage } from './hooks/useEditarExpedicaoPage'

const LISTAGEM_PATH = '/expedicoes'
const FORMATO_DATA = 'DD/MM/YYYY'

export default function EditarExpedicaoPage() {
  const { t } = useTranslation(['editarExpedicaoPage', 'common'])
  const { notification } = App.useApp()
  const navigate = useNavigate()
  const { expedicao_id: expedicaoIdParam } = useParams()
  const expedicaoId = Number(expedicaoIdParam)
  const detalhesPath = Number.isInteger(expedicaoId) && expedicaoId > 0
  ? `/expedicoes/detalhes/${expedicaoId}`
  : LISTAGEM_PATH
  const [form] = Form.useForm<EditarExpedicaoFormValues>()
  const [salvando, setSalvando] = useState(false)

  const {
    expedicao,
    erroCarregamento,
    carregando,
    destinoInicial,
    participantesIniciais,
    buscarCidades,
    buscarParticipantes,
    salvar
  } = useEditarExpedicaoPage(
    Number.isInteger(expedicaoId) && expedicaoId > 0 ? expedicaoId : undefined
  )

  // Pré-preenche o formulário quando a expedição chega.
  useEffect(() => {
    if (expedicao) form.setFieldsValue(toFormValues(expedicao))
  }, [expedicao, form])

  const voltar = () => { navigate(detalhesPath) }

  const validarDataFim = (_rule: unknown, valor: Dayjs | undefined) => {
    const dataInicio = form.getFieldValue('dataInicio') as Dayjs | undefined
    if (!valor || !dataInicio) return Promise.resolve()
    if (valor.isBefore(dataInicio, 'day')) {
      return Promise.reject(new Error(t('editarExpedicaoPage:validacao.dataFimAnterior')))
    }
    return Promise.resolve()
  }

  const enviar = async () => {
    let values: EditarExpedicaoFormValues
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    setSalvando(true)
    try {
      const ok = await salvar(values)
      if (ok) {
        notification.success({
          message: t('common:tituloSucesso'),
          description: t('editarExpedicaoPage:feedback.sucesso')
        })
        voltar()
        return
      }
      notification.error({
        message: t('common:tituloFalha'),
        description: t('editarExpedicaoPage:feedback.erro')
      })
    } catch (error) {
      // Permanece na tela, com os dados preenchidos.
      console.error(error)
      notification.error({
        message: t('common:tituloFalha'),
        description: t('editarExpedicaoPage:feedback.erro')
      })
    } finally {
      setSalvando(false)
    }
  }

  if (erroCarregamento && !expedicao) {
    return (
      <Alert
        type="error"
        showIcon
        message={t('common:tituloFalha')}
        description={t('editarExpedicaoPage:feedback.erroCarregar')}
        action={<Button onClick={() => navigate(LISTAGEM_PATH)}>{t('common:cancelar')}</Button>}
      />
    )
  }

  return (
    <Spin spinning={carregando || salvando} tip={t('common:carregando')}>
      <Row>
        <Col span={24}>
          <h2 style={{ fontWeight: 200 }}>{t('editarExpedicaoPage:titulo')}</h2>
        </Col>
      </Row>
      <Divider dashed />

      {/* Só renderiza o formulário com a expedição carregada, para que os
          selects já nasçam com os rótulos (destino e participantes). */}
      {expedicao && (
        <Form
          form={form}
          layout="vertical"
          requiredMark
          initialValues={toFormValues(expedicao)}
          onFinish={() => { void enviar() }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <Form.Item
                name="dataInicio"
                label={t('editarExpedicaoPage:campos.dataInicio')}
                rules={[{
                  required: true,
                  message: t('editarExpedicaoPage:validacao.dataInicioObrigatoria')
                }]}
              >
                <DatePicker
                  format={FORMATO_DATA}
                  style={{ width: '100%' }}
                  placeholder={t('editarExpedicaoPage:placeholders.dataInicio')}
                  onChange={() => {
                    if (form.getFieldValue('dataFim')) {
                      void form.validateFields(['dataFim'])
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <Form.Item
                name="dataFim"
                label={t('editarExpedicaoPage:campos.dataFim')}
                dependencies={['dataInicio']}
                rules={[
                  {
                    required: true,
                    message: t('editarExpedicaoPage:validacao.dataFimObrigatoria')
                  },
                  { validator: validarDataFim }
                ]}
              >
                <DatePicker
                  format={FORMATO_DATA}
                  style={{ width: '100%' }}
                  placeholder={t('editarExpedicaoPage:placeholders.dataFim')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <DestinoEdicaoFormField
                buscar={buscarCidades}
                iniciais={destinoInicial}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <ParticipantesEdicaoFormField
                buscar={buscarParticipantes}
                iniciais={participantesIniciais}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="descricao"
                label={t('editarExpedicaoPage:campos.descricao')}
                rules={[{
                  required: true,
                  message: t('editarExpedicaoPage:validacao.descricaoObrigatoria')
                }]}
              >
                <Input.TextArea
                 rows={4}
                maxLength={500}
                showCount
                placeholder={t('editarExpedicaoPage:placeholders.descricao')}
              />
              </Form.Item>
            </Col>
          </Row>

          <Divider dashed />

          <Flex justify="flex-end" gap={8}>
            <Button onClick={voltar} disabled={salvando}>
              {t('common:cancelar')}
            </Button>
            <Button type="primary" htmlType="submit" loading={salvando}>
              {t('editarExpedicaoPage:acoes.salvar')}
            </Button>
          </Flex>
        </Form>
      )}
    </Spin>
  )
}
