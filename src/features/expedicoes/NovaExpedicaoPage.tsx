import { useState } from 'react'

import {
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
import { useNavigate } from 'react-router'

import type { NovaExpedicaoFormValues } from './api/expedicaoContract'
import { DestinoFormField } from './components/DestinoFormField'
import { ParticipantesFormField } from './components/ParticipantesFormField'
import {
  ContratoNaoAlinhadoError,
  useNovaExpedicaoPage
} from './hooks/useNovaExpedicaoPage'

const LISTAGEM_PATH = '/expedicoes'
const FORMATO_DATA_HORA = 'DD/MM/YYYY HH:mm'

export default function NovaExpedicaoPage() {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const { notification } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<NovaExpedicaoFormValues>()
  const [salvando, setSalvando] = useState(false)

  const {
    buscarCidades,
    buscarParticipantes,
    criarExpedicao
  } = useNovaExpedicaoPage()

  const voltarParaListagem = () => {
    navigate(LISTAGEM_PATH)
  }

  /**
   * A data de fim não pode ser anterior à data de início.
   * O erro é exibido no próprio campo `dataFim`.
   */
  const validarDataFim = (_rule: unknown, valor: Dayjs | undefined) => {
    if (!valor) return Promise.resolve()

    const dataInicio = form.getFieldValue('dataInicio') as Dayjs | undefined
    if (!dataInicio) return Promise.resolve()

    if (valor.isBefore(dataInicio)) {
      return Promise.reject(new Error(t('novaExpedicaoPage:validacao.dataFimAnterior')))
    }
    return Promise.resolve()
  }

  const salvar = async () => {
    let values: NovaExpedicaoFormValues
    try {
      values = await form.validateFields()
    } catch {
      // Erros de validação já aparecem nos respectivos campos.
      return
    }

    setSalvando(true)
    try {
      const criada = await criarExpedicao(values)
      if (criada) {
        notification.success({
          message: t('common:tituloSucesso'),
          description: t('novaExpedicaoPage:feedback.sucesso')
        })
        voltarParaListagem()
        return
      }
      notification.error({
        message: t('common:tituloFalha'),
        description: t('novaExpedicaoPage:feedback.erro')
      })
    } catch (error) {
      // Em qualquer erro permanecemos na tela, com os dados preenchidos.
      if (error instanceof ContratoNaoAlinhadoError) {
        notification.warning({
          message: t('novaExpedicaoPage:feedback.contratoPendenteTitulo'),
          description: t('novaExpedicaoPage:feedback.contratoPendente')
        })
        return
      }
      console.error(error)
      notification.error({
        message: t('common:tituloFalha'),
        description: t('novaExpedicaoPage:feedback.erro')
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Spin spinning={salvando} tip={t('common:carregando')}>
      <Row>
        <Col span={24}>
          <h2 style={{ fontWeight: 200 }}>{t('novaExpedicaoPage:titulo')}</h2>
        </Col>
      </Row>
      <Divider dashed />

      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={() => { void salvar() }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Form.Item
              name="dataInicio"
              label={t('novaExpedicaoPage:campos.dataInicio')}
              rules={[{
                required: true,
                message: t('novaExpedicaoPage:validacao.dataInicioObrigatoria')
              }]}
            >
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format={FORMATO_DATA_HORA}
                style={{ width: '100%' }}
                placeholder={t('novaExpedicaoPage:placeholders.dataInicio')}
                onChange={() => {
                  // Revalida a data de fim quando o início muda.
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
              label={t('novaExpedicaoPage:campos.dataFim')}
              dependencies={['dataInicio']}
              rules={[{ validator: validarDataFim }]}
            >
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format={FORMATO_DATA_HORA}
                style={{ width: '100%' }}
                placeholder={t('novaExpedicaoPage:placeholders.dataFim')}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <DestinoFormField buscar={buscarCidades} />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <ParticipantesFormField buscar={buscarParticipantes} />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="descricao"
              label={t('novaExpedicaoPage:campos.descricao')}
              rules={[{
                required: true,
                message: t('novaExpedicaoPage:validacao.descricaoObrigatoria')
              }]}
            >
              <Input.TextArea
                rows={4}
                maxLength={500}
                showCount
                placeholder={t('novaExpedicaoPage:placeholders.descricao')}
              />
            </Form.Item>
          </Col>
        </Row>

        {/*
          Campo "Rota" fica de fora desta task: o comportamento ainda será
          definido pelo time. Ver seção "Fora de escopo" da issue.
        */}

        <Divider dashed />

        <Flex justify="flex-end" gap={8}>
          <Button onClick={voltarParaListagem} disabled={salvando}>
            {t('common:cancelar')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={salvando}
          >
            {t('novaExpedicaoPage:acoes.salvar')}
          </Button>
        </Flex>
      </Form>
    </Spin>
  )
}
