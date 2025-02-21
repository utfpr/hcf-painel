import React, { useState } from 'react'

import {
    Card, Button, Dropdown, Menu, Collapse, Form, Input, Space
} from 'antd'

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Panel } = Collapse

const FiltersMap = ({ onSearch, onClear }) => {
    const [selectedFilters, setSelectedFilters] = useState([])
    const [filterValues, setFilterValues] = useState({})

    const taxonomiaOptions = ['Reino', 'Família', 'SubFamília', 'Gênero', 'Espécie', 'SubEspécie', 'Variedade']

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
            key: 'nomesPopulares',
            label: 'Nome Popular',
            component: (
                <Input
                    placeholder="Digite o nome popular, ex: maracujá"
                    onChange={e => handleFilterChange('nomesPopulares', e.target.value)}
                    value={filterValues.nomesPopulares}
                />
            )
        },
        {
            key: 'nomeCientifico',
            label: 'Nome Científico',
            component: (
                <Input
                    placeholder="Digite o nome científico, ex: Hancornia speciosa"
                    onChange={e => handleFilterChange('nomeCientifico', e.target.value)}
                    value={filterValues.nomeCientifico}
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
                <div>
                    {taxonomiaOptions.map(taxonomia => (
                        <Form.Item key={taxonomia} label={taxonomia}>
                            <Input
                                placeholder={`Digite valor para ${taxonomia}`}
                                value={filterValues[`taxonomia_${taxonomia}`]}
                                onChange={e => handleFilterChange(`taxonomia_${taxonomia}`, e.target.value)}
                            />
                        </Form.Item>
                    ))}
                </div>
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

    const handleReset = () => {
        const resetValues = {}
        selectedFilters.forEach(key => {
            resetValues[key] = key === 'taxonomia' ? {} : ''
        })
        setFilterValues(resetValues)
        onClear()
    }

    return (
        <Card title="Filtros do Mapa" style={{ marginBottom: '1rem' }}>
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

            <Collapse style={{ marginTop: '1rem' }}>
                {selectedFilters.map(key => {
                    const filter = availableFilters.find(f => f.key === key)

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
                        </Panel>
                    )
                })}
            </Collapse>

            <Space style={{ marginTop: 16 }}>
                <Button onClick={handleReset}>Limpar</Button>
                <Button
                    type="primary"
                    onClick={() => {
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
