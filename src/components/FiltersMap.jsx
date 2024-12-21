import React, { useState } from 'react'

import {
    Card, Button, Dropdown, Menu, Collapse, Form, Input, Select, Space
} from 'antd'

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Option } = Select
const { Panel } = Collapse

const FiltersMap = ({ onSearch, onClear }) => {
    const [selectedFilters, setSelectedFilters] = useState([])
    const [filterValues, setFilterValues] = useState({})

    const availableFilters = [
        {
            key: 'hcf',
            label: 'Número HCF',
            component: (
                <Input
                    placeholder="Digite o número HCF, ex: 28140"
                    onChange={e => handleFilterChange('hcf', e.target.value)}
                    value={filterValues.hcf}
                />
            )
        },
        {
            key: 'altitude',
            label: 'Altitude (min-max)',
            component: (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        placeholder="Digite o valor Mínimo, ex:1500"
                        onChange={e => handleFilterChange('altitudeMin', e.target.value)}
                        value={filterValues.altitudeMin}
                    />
                    <Input
                        placeholder="Digite o valor Máximo, ex:2000"
                        onChange={e => handleFilterChange('altitudeMax', e.target.value)}
                        value={filterValues.altitudeMax}
                    />
                </div>
            )
        },
        {
            key: 'taxonomia',
            label: 'Taxonomia',
            component: (
                <Select
                    mode="multiple"
                    placeholder="Selecione"
                    allowClear
                    onChange={value => handleTaxonomyChange(value)}
                    value={filterValues.taxonomia || []}
                >
                    <Option value="Família">Família</Option>
                    <Option value="SubFamília">Subfamília</Option>
                    <Option value="Gênero">Gênero</Option>
                    <Option value="Espécie">Espécie</Option>
                    <Option value="SubEspécie">Subespécie</Option>
                    <Option value="Variedade">Variedade</Option>
                </Select>
            )
        }
    ]

    const handleAddFilter = key => {
        if (!selectedFilters.includes(key)) {
            setSelectedFilters([...selectedFilters, key])
        }
    }

    const handleRemoveFilter = key => {
        setSelectedFilters(selectedFilters.filter(f => f !== key))
        setFilterValues({ ...filterValues, [key]: undefined })
    }

    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const handleTaxonomyChange = selectedTaxonomies => {
        const updatedFilters = { ...filterValues, taxonomia: selectedTaxonomies }

        // Remove entradas de taxonomias desmarcadas
        Object.keys(updatedFilters).forEach(key => {
            if (key.startsWith('taxonomia_') && !selectedTaxonomies.includes(key.replace('taxonomia_', ''))) {
                delete updatedFilters[key]
            }
        })

        // Adiciona entradas para taxonomias selecionadas
        selectedTaxonomies.forEach(taxonomy => {
            if (!updatedFilters[`taxonomia_${taxonomy}`]) {
                updatedFilters[`taxonomia_${taxonomy}`] = ''
            }
        })

        setFilterValues(updatedFilters)
    }

    const handleReset = () => {
        const resetValues = {}
        selectedFilters.forEach(key => {
            resetValues[key] = key === 'taxonomia' ? [] : ''
        })
        setFilterValues(resetValues)

        // Chama a função de limpar o mapa
        onClear()
    }

    return (
        <Card title="Filtros do Mapa" style={{ marginBottom: '1rem' }}>
            {/* Dropdown para adicionar filtros */}
            <Dropdown
                overlay={(
                    <Menu>
                        {availableFilters.map(filter => (
                            <Menu.Item key={filter.key} onClick={() => handleAddFilter(filter.key)}>
                                {filter.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                )}
                trigger={['click']}
            >
                <Button icon={<PlusCircleOutlined />}>Adicionar Filtro</Button>
            </Dropdown>

            {/* Filtros selecionados */}
            <Collapse style={{ marginTop: '1rem' }}>
                {selectedFilters.map(key => {
                    const filter = availableFilters.find(f => f.key === key)
                    if (key === 'taxonomia') {
                        return (
                            <Panel
                                header={filter?.label}
                                key={key}
                                extra={(
                                    <Button
                                        type="text"
                                        danger
                                        onClick={() => handleRemoveFilter(key)}
                                    >
                                        <MinusCircleOutlined style={{ marginRight: -3 }} />
                                        Remover
                                    </Button>
                                )}
                            >
                                <Form.Item>
                                    {filter?.component}
                                </Form.Item>
                                {/* Inputs individuais para cada taxonomia selecionada */}
                                {filterValues.taxonomia?.map(taxonomy => (
                                    <Form.Item
                                        key={`taxonomia_${taxonomy}`}
                                        label={`${taxonomy}`}
                                    >
                                        <Input
                                            placeholder={`Digite valor para ${taxonomy}`}
                                            value={filterValues[`taxonomia_${taxonomy}`]}
                                            onChange={e => handleFilterChange(`taxonomia_${taxonomy}`, e.target.value)}
                                        />
                                    </Form.Item>
                                ))}
                            </Panel>
                        )
                    }

                    return (
                        <Panel
                            header={filter?.label}
                            key={key}
                            extra={(
                                <Button
                                    type="text"
                                    danger
                                    onClick={() => handleRemoveFilter(key)}
                                >
                                    <MinusCircleOutlined style={{ marginRight: -3 }} />
                                    Remover
                                </Button>
                            )}
                        >
                            <Form.Item>
                                {React.cloneElement(filter?.component, {
                                    value: filterValues[key],
                                    onChange: e => handleFilterChange(key, e.target?.value || e)
                                })}
                            </Form.Item>
                        </Panel>
                    )
                })}
            </Collapse>

            <Space style={{ marginTop: 16 }}>
                <Button onClick={handleReset}>Limpar</Button>
                <Button
                    type="primary"
                    onClick={() => {
                        console.log('🔍 Enviando filtros para onSearch:', filterValues)
                        onSearch(filterValues)
                    }}
                >
                    Pesquisar
                </Button>

            </Space>
        </Card>
    )
}

export default FiltersMap
