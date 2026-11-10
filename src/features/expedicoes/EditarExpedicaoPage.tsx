import { useEffect, useState } from 'react'

import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Spin
} from 'antd'
import type { Moment } from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useNotification } from '@/hooks/useNotification'

import { extractApiErrorMessage } from './api/expedicaoContract'
import {
  toFormValues,
  type EditarExpedicaoFormValues
} from './api/expedicaoEdicaoContract'
import { DestinoFormField } from './components/DestinoFormField'
import { ParticipantesFormField } from './components/ParticipantesFormField'
import { RotaFormField } from './components/RotaFormField'
import { useEditarExpedicaoPage } from './hooks/useEditarExpedicaoPage'

const LISTAGEM_PATH = '/expedicoes'
const FORMATO_DATA = 'DD/MM/YYYY'

export default function EditarExpedicaoPage() {
  const { t } = useTranslation(['editarExpedicaoPage', 'common'])
  const { showNotification } = useNotification()
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
    buscarCidades,
    buscarLocaisColeta,
    buscarParticipantes,
    salvar
  } = useEditarExpedicaoPage(
    Number.isInteger(expedicaoId) && expedicaoId > 0 ? expedicaoId : undefined
  )

  useEffect(() => {
    if (!expedicao) return
    form.setFieldsValue(toFormValues(expedicao))
  }, [expedicao, form])

  useEffect(() => {
    const destino = destinoInicial[0]
    if (!destino) return
    const atual = form.getFieldValue('destino') as { value?: unknown } | number | undefined
    const atualId = atual && typeof atual === 'object' ? atual.value : atual
    if (String(atualId ?? '') === String(destino.value)) {
      form.setFieldsValue({ destino })
    }
  }, [destinoInicial, form])

  const voltar = () => {
    void navigate(detalhesPath)
  }

  const validarDataFim = (_rule: unknown, valor?: Moment | null) => {
    if (!valor) return Promise.resolve()

    const dataInicio = form.getFieldValue('dataInicio') as Moment | undefined
    if (dataInicio && valor.format('YYYY-MM-DD') < dataInicio.format('YYYY-MM-DD')) {
      return Promise.reject(new Error(t('editarExpedicaoPage:validacao.dataFimAnterior')))
    }
    return Promise.resolve()
  }

  const enviar = async (values: EditarExpedicaoFormValues) => {
    setSalvando(true)
    try {
      const ok = await salvar(values)
      if (ok) {
        showNotification({
          type: 'success',
          message: t('common:tituloSucesso'),
          description: t('editarExpedicaoPage:feedback.sucesso')
        })
        voltar()
        return
      }
      showNotification({
        type: 'error',
        message: t('common:tituloFalha'),
        description: t('editarExpedicaoPage:feedback.erro')
      })
    } catch (error) {
      showNotification({
        type: 'error',
        message: t('common:tituloFalha'),
        description: extractApiErrorMessage(error) ?? t('editarExpedicaoPage:feedback.erro')
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
        action={(
          <Button onClick={() => { void navigate(LISTAGEM_PATH) }}>
            {t('common:cancelar')}
          </Button>
        )}
      />
    )
  }

  return (
    <Spin spinning={carregando || salvando} tip={t('common:carregando')}>
      {expedicao && (
        <Form form={form} onFinish={values => { void enviar(values) }}>
          <Row>
            <Col span={12}>
              <h2 style={{ fontWeight: 200 }}>{t('editarExpedicaoPage:titulo')}</h2>
            </Col>
          </Row>
          <Divider dashed />

          <Row justify="end" gutter={8} style={{ marginBottom: 16 }}>
            <Button onClick={voltar} disabled={salvando}>
              {t('common:cancelar')}
            </Button>
          </Row>

          <Row gutter={8}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Col span={24}>
                <span>{t('editarExpedicaoPage:campos.dataInicio')}</span>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="dataInicio"
                  rules={[
                    {
                      required: true,
                      message: t('editarExpedicaoPage:validacao.dataInicioObrigatoria')
                    }
                  ]}
                >
                  <DatePicker
                    format={FORMATO_DATA}
                    style={{ width: '100%' }}
                    placeholder={t('editarExpedicaoPage:placeholders.dataInicio')}
                  />
                </Form.Item>
              </Col>
            </Col>

            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Col span={24}>
                <span>{t('editarExpedicaoPage:campos.dataFim')}</span>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="dataFim"
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
            </Col>

            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <DestinoFormField buscar={buscarCidades} />
            </Col>
          </Row>

          <Row gutter={8}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Col span={24}>
                <span>{t('editarExpedicaoPage:campos.descricao')}</span>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="descricao"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t('editarExpedicaoPage:validacao.descricaoObrigatoria')
                    }
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder={t('editarExpedicaoPage:placeholders.descricao')}
                  />
                </Form.Item>
              </Col>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <ParticipantesFormField buscar={buscarParticipantes} />
            </Col>
          </Row>

          <Row gutter={8}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <RotaFormField buscar={buscarCidades} buscarLocais={buscarLocaisColeta} />
            </Col>
          </Row>

          <Row justify="end" gutter={8}>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: '100%' }}
                >
                  {t('editarExpedicaoPage:acoes.salvar')}
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Divider dashed />
        </Form>
      )}
    </Spin>
  )
}
