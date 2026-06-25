import React, { useState } from 'react'

import {
    Card, Button, Dropdown, Menu, Collapse, Form, Input, Space
} from 'antd'
import { useTranslation } from 'react-i18next'

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Panel } = Collapse

const FiltersMap = ({ onSearch, onClear }) => {
    const { t } = useTranslation()
    const [selectedFilters, setSelectedFilters] = useState([])
    const [filterValues, setFilterValues] = useState({})

    const taxonomiaOptions = [t('filtersMap:reino'), t('filtersMap:familia'), t('filtersMap:subFamilia'), t('filtersMap:genero'), t('filtersMap:especie'), t('filtersMap:subEspecie'), t('filtersMap:variedade')]

    const availableFilters = [
        {
            key: 'hcf',
            label: t('filtersMap:numeroHcf'),
            component: (
                <Input
                    placeholder={t('filtersMap:placeholderNumeroHcf')}
                    onChange={e => handleFilterChange('hcf', e.target.value)}
                    value={filterValues.hcf}
                />
            )
        },
        {
            key: 'nomesPopulares',
            label: t('filtersMap:nomePopular'),
            component: (
                <Input
                    placeholder={t('filtersMap:placeholderNomePopular')}
                    onChange={e => handleFilterChange('nomesPopulares', e.target.value)}
                    value={filterValues.nomesPopulares}
                />
            )
        },
        {
            key: 'nomeCientifico',
            label: t('filtersMap:nomeCientifico'),
            component: (
                <Input
                    placeholder={t('filtersMap:placeholderNomeCientifico')}
                    onChange={e => handleFilterChange('nomeCientifico', e.target.value)}
                    value={filterValues.nomeCientifico}
                />
            )
        },
        {
            key: 'altitude',
            label: t('filtersMap:altitudeMinMax'),
            component: (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        placeholder={t('filtersMap:placeholderAltitudeMinima')}
                        onChange={e => handleFilterChange('altitudeMin', e.target.value)}
                        value={filterValues.altitudeMin}
                    />
                    <Input
                        placeholder={t('filtersMap:placeholderAltitudeMaxima')}
                        onChange={e => handleFilterChange('altitudeMax', e.target.value)}
                        value={filterValues.altitudeMax}
                    />
                </div>
            )
        },
        {
            key: 'taxonomia',
            label: t('filtersMap:taxonomia'),
            component: (
                <div>
                    {taxonomiaOptions.map(taxonomia => (
                        <Form.Item key={taxonomia} label={taxonomia}>
                            <Input
                                placeholder={t('filtersMap:placeholderTaxonomia', { taxonomia: taxonomia })}
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
        <Card title={t('filtersMap:filtrosMapa')} style={{ marginBottom: '1rem' }}>
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
                <Button icon={<PlusCircleOutlined />}>{t('filtersMap:adicionarFiltro')}</Button>
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
                                    {t('filtersMap:remover')}
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
                <Button onClick={handleReset}>{t('filtersMap:limpar')}</Button>
                <Button
                    type="primary"
                    onClick={() => {
                        onSearch(filterValues)
                    }}
                >
                    {t('filtersMap:pesquisar')}
                </Button>
            </Space>
        </Card>
    )
}

export default FiltersMap
