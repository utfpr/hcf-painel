import React from 'react'

import {
  Card, Row, Col, Select, Button, DatePicker, Divider,
  Spin, Empty, Form
} from 'antd'
import { Moment } from 'moment'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const { Option } = Select
const { RangePicker } = DatePicker

export interface TomboData {
  periodo: string
  quantidade: number
}

export interface TombosPorIntervaloTempoProps {
  loading: boolean
  dados: TomboData[]
  dataInicio: Moment | null
  dataFim: Moment | null
  granularidade: string
  granularidadesPermitidas: string[]
  diffs: {
    dias: number
    semanas: number
    meses: number
  }
  onDateChange: (dates: [Moment | null, Moment | null] | null) => void
  onGranularidadeChange: (value: string) => void
  onSearch: () => void
}

const TombosPorIntervaloTempoComponent: React.FC<TombosPorIntervaloTempoProps> = ({
  loading,
  dados,
  dataInicio,
  dataFim,
  granularidade,
  granularidadesPermitidas,
  diffs,
  onDateChange,
  onGranularidadeChange,
  onSearch
}) => {
  const { t } = useTranslation()

  const renderFiltros = () => (
    <Card
      title={t('relatorioPorPeriodo:relatorioTombosPeriodo')}
      style={{
        marginBottom: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: 'none'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item label={t('relatorioPorPeriodo:periodo')}>
              <RangePicker
                value={dataInicio && dataFim ? [dataInicio, dataFim] : undefined}
                onChange={onDateChange}
                format="DD/MM/YYYY"
                style={{ width: '100%', borderRadius: '6px' }}
                placeholder={[t('relatorioPorPeriodo:dataInicial'), t('relatorioPorPeriodo:dataFinal')]}
              />
            </Form.Item>
            {dataInicio && dataFim && (
              <p style={{
                fontSize: '12px', color: '#8c8c8c', marginTop: '-15px', paddingLeft: '4px'
              }}
              >
                {t('relatorioPorPeriodo:subTextoPeriodo')}
                {' '}
                {diffs.dias}
                {' '}
                {t('relatorioPorPeriodo:subTextoDias')}
                {' '}
                |
                {' '}
                {diffs.semanas}
                {' '}
                {t('relatorioPorPeriodo:subTextoSemanas')}
                {' '}
                |
                {' '}
                {diffs.meses}
                {' '}
                {t('relatorioPorPeriodo:subTextoMeses')}
              </p>
            )}
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item label={t('relatorioPorPeriodo:granularidade')}>
              <Select
                value={granularidade}
                onChange={onGranularidadeChange}
                placeholder={t('relatorioPorPeriodo:selecioneGranularidade')}
                style={{ borderRadius: '6px' }}
              >
                <Option value="dia" disabled={!granularidadesPermitidas.includes('dia')}>
                  {t('relatorioPorPeriodo:granularidadeDia')}
                  {' '}
                  {!granularidadesPermitidas.includes('dia') ? t('relatorioPorPeriodo:maxGranularidadeDias') : ''}
                </Option>
                <Option value="semana" disabled={!granularidadesPermitidas.includes('semana')}>
                  {t('relatorioPorPeriodo:granularidadeSemana')}
                  {' '}
                  {!granularidadesPermitidas.includes('semana') ? t('relatorioPorPeriodo:maxGranularidadeSemanas') : ''}
                </Option>
                <Option value="mes" disabled={!granularidadesPermitidas.includes('mes')}>
                  {t('relatorioPorPeriodo:granularidadeMes')}
                  {' '}
                  {!granularidadesPermitidas.includes('mes') ? t('relatorioPorPeriodo:maxGranularidadeMeses') : ''}
                </Option>
                <Option value="ano" disabled={!granularidadesPermitidas.includes('ano')}>
                  {t('relatorioPorPeriodo:granularidadeAno')}
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} justify="end">
          <Col xs={24} sm={12} md={6} lg={4} xl={4}>
            <Button
              type="primary"
              onClick={onSearch}
              loading={loading}
              block
              style={{
                height: '40px',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.25)'
              }}
            >
              {t('relatorioPorPeriodo:buscar')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  )

  const renderGrafico = () => {
    if (loading) {
      return (
        <Card style={{
          textAlign: 'center', padding: '100px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
        >
          <Spin size="large" tip={t('relatorioPorPeriodo:carregandoDadosEstatisticos')} />
        </Card>
      )
    }

    if (!dados || dados.length === 0) {
      return (
        <Card style={{
          borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
        >
          <Empty
            description={(
              <span>
                {t('relatorioPorPeriodo:nenhumDadoDisponivel')}
                <br />
                <small style={{ color: '#8c8c8c' }}>{t('relatorioPorPeriodo:ajusteGranularidadeDatas')}</small>
              </span>
            )}
            style={{ margin: '60px 0' }}
          />
        </Card>
      )
    }

    console.log(dados)

    return (
      <Card
        title={t('relatorioPorPeriodo:analiseTombosDistribuicaoTemporal')}
        style={{
          marginTop: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: 'none'
        }}
        headStyle={{ borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}
      >
        <div style={{
          width: '100%', height: 450, padding: '10px'
        }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dados}
              margin={{
                top: 20, right: 30, left: 10, bottom: 80
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="periodo"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12, fill: '#595959' }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 12, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '12px'
                }}
                cursor={{ fill: 'rgba(0, 122, 51, 0.05)' }}
                formatter={value => [`${String(value)} ${t('relatorioPorPeriodo:tombos')}`, t('relatorioPorPeriodo:quantidade')]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="quantidade"
                fill="#007A33"
                name={t('relatorioPorPeriodo:quantidadeTombos')}
                radius={[
                  6,
                  6,
                  0,
                  0
                ]}
                barSize={40}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ padding: '4px' }}>
      <Divider dashed style={{ borderColor: '#d9d9d9' }} />
      {renderFiltros()}
      <Divider dashed style={{ borderColor: '#d9d9d9' }} />
      {renderGrafico()}
    </div>
  )
}

export default TombosPorIntervaloTempoComponent
