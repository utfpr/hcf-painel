import React from 'react'

import {
  Card, Row, Col, Select, Button, DatePicker, Divider,
  Spin, Empty, Form
} from 'antd'
import { Moment } from 'moment'
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
  const renderFiltros = () => (
    <Card
      title="Filtros do relatório"
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
            <Form.Item label="Período">
              <RangePicker
                value={dataInicio && dataFim ? [dataInicio, dataFim] : undefined}
                onChange={onDateChange}
                format="DD/MM/YYYY"
                style={{ width: '100%', borderRadius: '6px' }}
                placeholder={['Data inicial', 'Data final']}
              />
            </Form.Item>
            {dataInicio && dataFim && (
              <p style={{
                fontSize: '12px', color: '#8c8c8c', marginTop: '-15px', paddingLeft: '4px'
              }}
              >
                Período:
                {' '}
                {diffs.dias}
                {' '}
                dias |
                {' '}
                {diffs.semanas}
                {' '}
                semanas |
                {' '}
                {diffs.meses}
                {' '}
                meses
              </p>
            )}
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item label="Granularidade">
              <Select
                value={granularidade}
                onChange={onGranularidadeChange}
                placeholder="Selecione a granularidade"
                style={{ borderRadius: '6px' }}
              >
                <Option value="dia" disabled={!granularidadesPermitidas.includes('dia')}>
                  Dia
                  {' '}
                  {!granularidadesPermitidas.includes('dia') ? '(máx. 30 dias)' : ''}
                </Option>
                <Option value="semana" disabled={!granularidadesPermitidas.includes('semana')}>
                  Semana
                  {' '}
                  {!granularidadesPermitidas.includes('semana') ? '(máx. 30 semanas)' : ''}
                </Option>
                <Option value="mes" disabled={!granularidadesPermitidas.includes('mes')}>
                  Mês
                  {' '}
                  {!granularidadesPermitidas.includes('mes') ? '(máx. 30 meses)' : ''}
                </Option>
                <Option value="ano" disabled={!granularidadesPermitidas.includes('ano')}>
                  Ano
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
              Buscar
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
          <Spin size="large" tip="Carregando dados estatísticos..." />
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
                Nenhum dado disponível para o período selecionado.
                <br />
                <small style={{ color: '#8c8c8c' }}>Tente ajustar a granularidade ou o intervalo de datas.</small>
              </span>
            )}
            style={{ margin: '60px 0' }}
          />
        </Card>
      )
    }

    return (
      <Card
        title="Análise de Tombos - Distribuição Temporal"
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
                cursor={{ fill: 'rgba(24, 144, 255, 0.05)' }}
                formatter={value => [`${String(value)} tombos`, 'Quantidade']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="quantidade"
                fill="#1890ff"
                name="Quantidade de Tombos"
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
