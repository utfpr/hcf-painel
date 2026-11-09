import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Typography
} from 'antd'
import { useTranslation } from 'react-i18next'

import { appDownloadUrl } from '@/config/app'
import { DownloadOutlined } from '@ant-design/icons'

const PASSOS = [
  'passo1',
  'passo2',
  'passo3'
] as const

export default function ExpedicoesAppPage() {
  const { t } = useTranslation('expedicoesAppPage')
  const disponivel = appDownloadUrl !== ''

  // Sem link ainda: um aviso legível no lugar de um botão desabilitado, que fica sem contraste.
  const acaoDownload = disponivel
    ? (
      <Button
        type="primary"
        size="large"
        icon={<DownloadOutlined />}
        href={appDownloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('baixar')}
      </Button>
    )
    : <Alert type="info" showIcon message={t('emBreve')} description={t('indisponivel')} />

  return (
    <div>
      <Row>
        <Col span={24}>
          <h2 style={{ fontWeight: 200 }}>{t('titulo')}</h2>
        </Col>
      </Row>
      <Divider dashed />

      <Card>
        <Typography.Paragraph>{t('descricao')}</Typography.Paragraph>

        <Typography.Title level={5}>{t('instrucoesTitulo')}</Typography.Title>
        <ol>
          {PASSOS.map(passo => (
            <li key={passo}>
              <Typography.Text>{t(`instrucoes.${passo}`)}</Typography.Text>
            </li>
          ))}
        </ol>

        {acaoDownload}
      </Card>
    </div>
  )
}
