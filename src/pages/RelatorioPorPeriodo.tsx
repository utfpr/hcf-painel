import React from 'react'
import {Row, Col} from 'antd'
import TombosPorIntervaloTempoContainer from '../components/Relatorios/RelatoriosTombosPorPeriodo/TombosPorIntervaloTempo.container'

const RelatorioPorPeriodo: React.FC = () => {
  return (
    <>
      <Row
        gutter={24}
        style={{
          marginBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <Col xs={24} sm={14} md={18} lg={20} xl={20}>
          <h2 style={{ fontWeight: 200 }}>Relatório de Tombos por Período</h2>
        </Col>
      </Row>
      <TombosPorIntervaloTempoContainer />
    </>
  )
}

export default RelatorioPorPeriodo
