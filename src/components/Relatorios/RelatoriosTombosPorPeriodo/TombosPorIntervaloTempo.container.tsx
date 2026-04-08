import React, {
  useState, useEffect, useCallback
} from 'react'

import { notification } from 'antd'
import axios from 'axios'
import moment, { Moment } from 'moment'

import { baseUrl } from '../../../config/api'
import TombosPorIntervaloTempoComponent, { TomboData } from './TombosPorIntervaloTempo.component'

const TombosPorIntervaloTempoContainer: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [dataInicio, setDataInicio] = useState<Moment | null>(moment().subtract(30, 'days'))
  const [dataFim, setDataFim] = useState<Moment | null>(moment())
  const [granularidade, setGranularidade] = useState<string>('dia')
  const [dados, setDados] = useState<TomboData[]>([])

  // Notificação auxiliar
  const openNotification = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    notification[type]({ message, description })
  }

  // Cálculo de granularidades permitidas
  const getGranularidadesPermitidas = useCallback(() => {
    if (!dataInicio || !dataFim) {
      return [
        'dia',
        'semana',
        'mes',
        'ano'
      ]
    }

    const diffDays = Math.ceil(dataFim.diff(dataInicio, 'days', true))
    const diffWeeks = Math.ceil(dataFim.diff(dataInicio, 'weeks', true))
    const diffMonths = Math.ceil(dataFim.diff(dataInicio, 'months', true))

    const granularidades = []
    if (diffDays <= 30) granularidades.push('dia')
    if (diffWeeks <= 30) granularidades.push('semana')
    if (diffMonths <= 30) granularidades.push('mes')
    granularidades.push('ano')

    return granularidades
  }, [dataInicio, dataFim])

  // Cálculo de diferenças para exibição
  const getDiffs = () => {
    if (!dataInicio || !dataFim) return {
      dias: 0, semanas: 0, meses: 0
    }

    return {
      dias: Math.ceil(dataFim.diff(dataInicio, 'days', true)),
      semanas: Math.ceil(dataFim.diff(dataInicio, 'weeks', true)),
      meses: Math.ceil(dataFim.diff(dataInicio, 'months', true))
    }
  }

  // Requisição de dados
  const requisitaDados = useCallback(async () => {
    if (!dataInicio || !dataFim) {
      openNotification('warning', 'Alerta', 'Selecione um período válido')
      return
    }

    if (dataInicio.isAfter(dataFim)) {
      openNotification('warning', 'Alerta', 'A data de início deve ser anterior à data de fim')
      return
    }

    setLoading(true)

    try {
      const params = {
        data_inicio: dataInicio.format('YYYY-MM-DD'),
        data_fim: dataFim.format('YYYY-MM-DD'),
        granularidade
      }

      const response = await axios.get<TomboData[]>(`${baseUrl}/tombos/relatorio-periodo`, { params })

      if (response.status === 200) {
        const novosDados: TomboData[] = response.data.map(item => ({
          periodo: item.periodo,
          quantidade: item.quantidade
        }))
        setDados(novosDados)
      } else {
        openNotification('error', 'Erro', 'Falha ao buscar dados do relatório')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      const mensagemErro = error.response?.data?.error?.message || 'Falha ao buscar dados do relatório'
      openNotification('error', 'Erro', mensagemErro)
    } finally {
      setLoading(false)
    }
  }, [
    dataInicio,
    dataFim,
    granularidade
  ])

  // Efeito inicial
  useEffect(() => {
    void requisitaDados()
  }, [requisitaDados])

  // Handlers
  const handleDateChange = (dates: [Moment | null, Moment | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const novoInicio = dates[0]
      const novoFim = dates[1]

      setDataInicio(novoInicio)
      setDataFim(novoFim)

      // Verificar granularidade
      const diffDays = Math.ceil(novoFim.diff(novoInicio, 'days', true))
      const diffWeeks = Math.ceil(novoFim.diff(novoInicio, 'weeks', true))
      const diffMonths = Math.ceil(novoFim.diff(novoInicio, 'months', true))

      const permitidas = []
      if (diffDays <= 30) permitidas.push('dia')
      if (diffWeeks <= 30) permitidas.push('semana')
      if (diffMonths <= 30) permitidas.push('mes')
      permitidas.push('ano')

      if (!permitidas.includes(granularidade)) {
        setGranularidade(permitidas[0] || 'dia')
      }
    } else {
      setDataInicio(null)
      setDataFim(null)
    }
  }

  const handleGranularidadeChange = (value: string) => {
    setGranularidade(value)
  }

  return (
    <TombosPorIntervaloTempoComponent
      loading={loading}
      dados={dados}
      dataInicio={dataInicio}
      dataFim={dataFim}
      granularidade={granularidade}
      granularidadesPermitidas={getGranularidadesPermitidas()}
      diffs={getDiffs()}
      onDateChange={handleDateChange}
      onGranularidadeChange={handleGranularidadeChange}
      onSearch={requisitaDados}
    />
  )
}

export default TombosPorIntervaloTempoContainer
