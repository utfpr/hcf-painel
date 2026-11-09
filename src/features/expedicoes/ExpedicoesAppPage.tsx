import {
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

        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          href={disponivel ? appDownloadUrl : undefined}
          target={disponivel ? '_blank' : undefined}
          rel={disponivel ? 'noopener noreferrer' : undefined}
          disabled={!disponivel}
        >
          {disponivel ? t('baixar') : t('emBreve')}
        </Button>
      </Card>
    </div>
  )
}
