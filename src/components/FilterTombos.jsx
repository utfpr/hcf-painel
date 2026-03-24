import React, { useState } from 'react'

import {
    Card,
    Button,
    Dropdown,
    Menu,
    Collapse,
    Form,
    Select,
    Spin
} from 'antd'
import axios from 'axios'

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Panel } = Collapse
const { Option } = Select

const FilterTombos = ({ onChange }) => {
    const [selectedFilters, setSelectedFilters] = useState([])
    const [filterValues, setFilterValues] = useState({})

    const [identificadores, setIdentificadores] = useState([])
    const [loadingIdentificador, setLoadingIdentificador] = useState(false)

    const [coletores, setColetores] = useState([])
    const [loadingColetor, setLoadingColetor] = useState(false)

    const [numerosColeta, setNumerosColeta] = useState([])
    const [loadingNumeroColeta, setLoadingNumeroColeta] = useState(false)

    const handleFilterChange = (key, value) => {
        setFilterValues(prev => {
            const next = { ...prev, [key]: value }
            onChange?.(next)
            return next
        })
    }

    const buscarIdentificadorPorNome = async nome => {
        if (!nome) {
            setIdentificadores([])
            return
        }

        setLoadingIdentificador(true)

        try {
            const response = await axios.get('/identificadores', {
                params: { nome }
            })

            setIdentificadores(response.data.identificadores || [])
        } catch (error) {
            console.error('Erro ao buscar identificadores', error)
        } finally {
            setLoadingIdentificador(false)
        }
    }

    const selecionarIdentificadorPorNome = async nomeSelecionado => {
        if (!nomeSelecionado) {
            handleFilterChange('identificador_id', undefined)
            return
        }

        try {
            const response = await axios.get('/identificadores', {
                params: { nome: nomeSelecionado }
            })

            const identificador = response.data.identificadores?.[0]

            if (identificador) {
                handleFilterChange('identificador_id', identificador.id)
            }
        } catch (error) {
            console.error('Erro ao obter identificador pelo nome', error)
        }
    }

    const buscarColetorPorNome = async nome => {
        if (!nome) {
            setColetores([])
            return
        }

        setLoadingColetor(true)

        try {
            const response = await axios.get('/coletores', {
                params: { nome }
            })

            setColetores(response.data.coletores || [])
        } catch (error) {
            console.error('Erro ao buscar coletores', error)
        } finally {
            setLoadingColetor(false)
        }
    }

    const selecionarColetorPorNome = async nomeSelecionado => {
        if (!nomeSelecionado) {
            handleFilterChange('coletor_id', undefined)
            setNumerosColeta([])
            handleFilterChange('numero_coleta', undefined)
            return
        }

        try {
            const response = await axios.get('/coletores', {
                params: { nome: nomeSelecionado }
            })

            const coletor = response.data.coletores?.[0]

            if (coletor) {
                handleFilterChange('coletor_id', coletor.id)
                buscarNumerosColetaPorColetor(coletor.id)
            }
        } catch (error) {
            console.error('Erro ao obter coletor pelo nome', error)
        }
    }

    const buscarNumerosColetaPorColetor = async coletorId => {
        if (!coletorId) {
            setNumerosColeta([])
            return
        }

        setLoadingNumeroColeta(true)

        try {
            const response = await axios.get(`/coletores/${coletorId}/numeros-coleta`)

            setNumerosColeta(response.data.numerosColeta || [])
        } catch (error) {
            console.error('Erro ao buscar números de coleta', error)
            setNumerosColeta([])
        } finally {
            setLoadingNumeroColeta(false)
        }
    }

    const availableFilters = [
        {
            key: 'identificador_id',
            label: 'Identificador',
            component: (
                <Select
                    showSearch
                    placeholder="Digite o nome do identificador"
                    filterOption={false}
                    onSearch={buscarIdentificadorPorNome}
                    onSelect={selecionarIdentificadorPorNome}
                    allowClear
                    loading={loadingIdentificador}
                    onClear={() =>
                        handleFilterChange('identificador_id', undefined)}
                    notFoundContent={
                        loadingIdentificador
                            ? <Spin size="small" />
                            : 'Nenhum resultado'
                    }
                    style={{ width: '100%' }}
                >
                    {identificadores.map(item => (
                        <Option key={item.id} value={item.nome}>
                            {item.nome}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            key: 'coletor_id',
            label: 'Coletor',
            component: (
                <Select
                    showSearch
                    placeholder="Digite o nome do coletor"
                    filterOption={false}
                    onSearch={buscarColetorPorNome}
                    onSelect={selecionarColetorPorNome}
                    allowClear
                    loading={loadingColetor}
                    onClear={() =>
                        handleFilterChange('coletor_id', undefined)}
                    notFoundContent={
                        loadingColetor
                            ? <Spin size="small" />
                            : 'Nenhum resultado'
                    }
                    style={{ width: '100%' }}
                >
                    {coletores.map(item => (
                        <Option key={item.id} value={item.nome}>
                            {item.nome}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            key: 'numero_coleta',
            label: 'Número de Coleta',
            component: (
                <Select
                    placeholder="Selecione um coletor primeiro"
                    disabled={!filterValues.coletor_id}
                    onChange={value => handleFilterChange('numero_coleta', value || undefined)}
                    allowClear
                    loading={loadingNumeroColeta}
                    notFoundContent={
                        loadingNumeroColeta
                            ? <Spin size="small" />
                            : 'Nenhum número de coleta disponível'
                    }
                    style={{ width: '100%' }}
                >
                    {numerosColeta.map(numero => (
                        <Option key={numero.id} value={numero.numero}>
                            {numero.numero}
                        </Option>
                    ))}
                </Select>
            )
        }
    ]

    const handleAddFilter = key => {
        if (!selectedFilters.includes(key)) {
            setSelectedFilters(prev => [...prev, key])
            onChange?.({ ...filterValues })
        }
    }

    const handleRemoveFilter = key => {
        setSelectedFilters(prev => prev.filter(f => f !== key))

        setFilterValues(prev => {
            const next = { ...prev }
            delete next[key]
            onChange?.(next)
            return next
        })
    }

    return (
        <Card>
            <Dropdown
                overlay={(
                    <Menu>
                        {availableFilters.map(filter => (
                            <Menu.Item
                                key={filter.key}
                                onClick={() => handleAddFilter(filter.key)}
                            >
                                {filter.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                )}
                trigger={['click']}
            >
                <Button icon={<PlusCircleOutlined />}>
                    Adicionar Filtro
                </Button>
            </Dropdown>

            <Collapse style={{ marginTop: '1rem' }}>
                {selectedFilters.map(key => {
                    const filter = availableFilters.find(f => f.key === key)

                    return (
                        <Panel
                            key={key}
                            header={filter?.label}
                            extra={(
                                <Button
                                    type="text"
                                    danger
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleRemoveFilter(key)
                                    }}
                                >
                                    <MinusCircleOutlined style={{ marginRight: -3 }} />
                                    Remover
                                </Button>
                            )}
                        >
                            <Form.Item>
                                {filter?.component}
                            </Form.Item>
                        </Panel>
                    )
                })}
            </Collapse>
        </Card>
    )
}

export default FilterTombos
