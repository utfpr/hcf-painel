import { useState } from 'react'

import {
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
import { useNavigate } from 'react-router'

import { useNotification } from '@/hooks/useNotification'

import {
  extractApiErrorMessage,
  type NovaExpedicaoFormValues
} from './api/expedicaoContract'
import { DestinoFormField } from './components/DestinoFormField'
import { ParticipantesFormField } from './components/ParticipantesFormField'
import { RotaFormField } from './components/RotaFormField'
import { useNovaExpedicaoPage } from './hooks/useNovaExpedicaoPage'

const LISTAGEM_PATH = '/expedicoes'
const FORMATO_DATA = 'DD/MM/YYYY'


export default function NovaExpedicaoPage() {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const [form] = Form.useForm<NovaExpedicaoFormValues>()
  const [salvando, setSalvando] = useState(false)

  const {
    buscarCidades,
    buscarLocaisColeta,
    buscarParticipantes,
    criarExpedicao
  } = useNovaExpedicaoPage()

  const voltarParaListagem = () => {
    void navigate(LISTAGEM_PATH)
  }

  /** A data de fim não pode ser anterior à de início (erro no campo dataFim). */
  const validarDataFim = (_rule: unknown, valor?: Moment | null) => {
    if (!valor) return Promise.resolve()

    const dataInicio = form.getFieldValue('dataInicio') as Moment | undefined
    if (dataInicio && valor.format('YYYY-MM-DD') < dataInicio.format('YYYY-MM-DD')) {
      return Promise.reject(new Error(t('novaExpedicaoPage:validacao.dataFimAnterior')))
    }
    return Promise.resolve()
  }

  const salvar = async (values: NovaExpedicaoFormValues) => {
    setSalvando(true)
    try {
      const criada = await criarExpedicao(values)
      if (criada) {
        showNotification({
          type: 'success',
          message: t('common:tituloSucesso'),
          description: t('novaExpedicaoPage:feedback.sucesso')
        })
        voltarParaListagem()
        return
      }
      showNotification({
        type: 'error',
        message: t('common:tituloFalha'),
        description: t('novaExpedicaoPage:feedback.erro')
      })
    } catch (error) {
      showNotification({
        type: 'error',
        message: t('common:tituloFalha'),
        description: extractApiErrorMessage(error) ?? t('novaExpedicaoPage:feedback.erro')
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Spin spinning={salvando} tip={t('common:carregando')}>
      <Form form={form} onFinish={values => { void salvar(values) }}>
        <Row>
          <Col span={12}>
            <h2 style={{ fontWeight: 200 }}>{t('novaExpedicaoPage:titulo')}</h2>
          </Col>
        </Row>
        <Divider dashed />

        <Row justify="end" gutter={8} style={{ marginBottom: 16 }}>
          <Button onClick={voltarParaListagem} disabled={salvando}>
            {t('common:cancelar')}
          </Button>
        </Row>

        <Row gutter={8}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Col span={24}>
              <span>{t('novaExpedicaoPage:campos.dataInicio')}</span>
            </Col>
            <Col span={24}>
              <Form.Item
                name="dataInicio"
                rules={[
                  {
                    required: true,
                    message: t('novaExpedicaoPage:validacao.dataInicioObrigatoria')
                  }
                ]}
              >
                <DatePicker
                  format={FORMATO_DATA}
                  style={{ width: '100%' }}
                  placeholder={t('novaExpedicaoPage:placeholders.dataInicio')}
                />
              </Form.Item>
            </Col>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Col span={24}>
              <span>{t('novaExpedicaoPage:campos.dataFim')}</span>
            </Col>
            <Col span={24}>
              <Form.Item
                name="dataFim"
                dependencies={['dataInicio']}
                rules={[
                  {
                    required: true,
                    message: t('novaExpedicaoPage:validacao.dataFimObrigatoria')
                  },
                  { validator: validarDataFim }
                ]}
              >
                <DatePicker
                  format={FORMATO_DATA}
                  style={{ width: '100%' }}
                  placeholder={t('novaExpedicaoPage:placeholders.dataFim')}
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
              <span>{t('novaExpedicaoPage:campos.descricao')}</span>
            </Col>
            <Col span={24}>
              <Form.Item
                name="descricao"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: t('novaExpedicaoPage:validacao.descricaoObrigatoria')
                  }
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t('novaExpedicaoPage:placeholders.descricao')}
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
                {t('novaExpedicaoPage:acoes.salvar')}
              </Button>
            </Form.Item>
          </Col>
        </Row>

        <Divider dashed />
      </Form>
    </Spin>
  )
}
