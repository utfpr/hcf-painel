import React, {
  useCallback, useEffect, useMemo, useState
} from 'react'

import {
  Button, Col, Form, Input, notification, Row, Select
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

import { FiltrosRfids } from './types'

const { Option } = Select

interface TaxonomiaOption {
  id: number
  nome: string
  familia_id?: number
  genero_id?: number
  familia?: TaxonomiaOption
  genero?: TaxonomiaOption
  familias?: TaxonomiaOption
  generos?: TaxonomiaOption
  Familia?: TaxonomiaOption
  Genero?: TaxonomiaOption
}

interface TaxonomiaResponse {
  resultado: TaxonomiaOption[]
}

interface Props {
  loading: boolean
  onSearch: (filtros: FiltrosRfids) => void
  onDraftChange: () => void
  acoes?: React.ReactNode
}

const familiaDoGenero = (genero: TaxonomiaOption) => (
  genero.familia_id || genero.familia?.id || genero.familias?.id || genero.Familia?.id
)

const generoDaEspecie = (especie: TaxonomiaOption) => (
  especie.genero_id || especie.genero?.id || especie.generos?.id || especie.Genero?.id
)

const familiaDaEspecie = (especie: TaxonomiaOption) => (
  especie.familia_id
  || especie.familia?.id
  || especie.familias?.id
  || especie.Familia?.id
  || (especie.genero || especie.generos || especie.Genero)?.familia_id
  || (especie.genero || especie.generos || especie.Genero)?.familias?.id
)

const RfidListaConferenciaFiltros: React.FC<Props> = ({
  loading, onSearch, onDraftChange, acoes
}) => {
  const [form] = Form.useForm<FiltrosRfids>()
  const { t } = useTranslation('rfid')
  const [familias, setFamilias] = useState<TaxonomiaOption[]>([])
  const [generos, setGeneros] = useState<TaxonomiaOption[]>([])
  const [especies, setEspecies] = useState<TaxonomiaOption[]>([])
  const familiasSelecionadas = Form.useWatch<number[]>('familia_id', form) || []
  const generosSelecionados = Form.useWatch<number[]>('genero_id', form) || []
  const especiesSelecionadas = Form.useWatch<number[]>('especie_id', form) || []

  const carregarOpcoesTaxonomia = useCallback(async () => {
    try {
      const params = { pagina: 1, limite: 9999999 }
      const [
        familiasResponse,
        generosResponse,
        especiesResponse
      ] = await Promise.all([
        axios.get<TaxonomiaResponse>('/familias', { params }),
        axios.get<TaxonomiaResponse>('/generos', { params }),
        axios.get<TaxonomiaResponse>('/especies', { params })
      ])

      setFamilias(familiasResponse.data.resultado)
      setGeneros(generosResponse.data.resultado)
      setEspecies(especiesResponse.data.resultado)
    } catch (error) {
      notification.error({
        message: t('common.error'),
        description: t('conferenceLists.taxonomyFetchFailure'),
        placement: 'topRight'
      })
    }
  }, [t])

  useEffect(() => {
    void carregarOpcoesTaxonomia()
  }, [carregarOpcoesTaxonomia])

  const generosFiltrados = useMemo(() => {
    if (familiasSelecionadas.length === 0) return generos

    return generos.filter(genero => {
      const familiaId = familiaDoGenero(genero)
      return familiaId !== undefined && familiasSelecionadas.includes(familiaId)
    })
  }, [familiasSelecionadas, generos])

  const especiesFiltradas = useMemo(() => especies.filter(especie => {
    const generoId = generoDaEspecie(especie)
    const familiaId = familiaDaEspecie(especie)
    const pertenceAosGeneros = generosSelecionados.length === 0
        || (generoId !== undefined && generosSelecionados.includes(generoId))
    const pertenceAsFamilias = familiasSelecionadas.length === 0
        || (familiaId !== undefined && familiasSelecionadas.includes(familiaId))

    return pertenceAosGeneros && pertenceAsFamilias
  }), [
    especies,
    familiasSelecionadas,
    generosSelecionados
  ])

  useEffect(() => {
    const generosValidos = generosSelecionados.filter(idGenero => (
      generosFiltrados.some(genero => genero.id === idGenero)
    ))
    const especiesValidas = especiesSelecionadas.filter(idEspecie => (
      especiesFiltradas.some(especie => especie.id === idEspecie)
    ))

    if (generosValidos.length !== generosSelecionados.length) {
      form.setFieldValue('genero_id', generosValidos)
    }

    if (especiesValidas.length !== especiesSelecionadas.length) {
      form.setFieldValue('especie_id', especiesValidas)
    }
  }, [
    especiesFiltradas,
    especiesSelecionadas,
    form,
    generosFiltrados,
    generosSelecionados
  ])

  const limparFiltros = () => {
    form.resetFields()
    onDraftChange()
    onSearch({})
  }

  return (
    <Form form={form} layout="vertical" onFinish={onSearch} onValuesChange={onDraftChange}>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="tombo_hcf" label={t('conference.tombo')}>
            <Input placeholder={t('conference.searchTombo')} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="familia_id" label={t('conference.family')}>
            <Select mode="multiple" maxTagCount="responsive" placeholder={t('conference.searchFamily')} allowClear showSearch optionFilterProp="children">
              {familias.map(familia => (
                <Option key={familia.id} value={familia.id}>{familia.nome}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="genero_id" label={t('conference.genus')}>
            <Select mode="multiple" maxTagCount="responsive" placeholder={t('conference.searchGenus')} allowClear showSearch optionFilterProp="children">
              {generosFiltrados.map(genero => (
                <Option key={genero.id} value={genero.id}>{genero.nome}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="especie_id" label={t('conference.species')}>
            <Select mode="multiple" maxTagCount="responsive" placeholder={t('conference.searchSpecies')} allowClear showSearch optionFilterProp="children">
              {especiesFiltradas.map(especie => (
                <Option key={especie.id} value={especie.id}>{especie.nome}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Button icon={<ClearOutlined />} onClick={limparFiltros}>
            {t('common.clear')}
          </Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
            {t('common.search')}
          </Button>
        </Col>
        {acoes}
      </Row>
    </Form>
  )
}

export default RfidListaConferenciaFiltros
