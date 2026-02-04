// src/components/FilterTombos.js
import React, { useState } from 'react'

import {
  Card, Button, Dropdown, Menu, Collapse, Form, Input
} from 'antd'

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Panel } = Collapse

/**
 * Props:
 * - onChange: (values) => void  // dispara sempre que o filtro muda
 */
const FilterTombos = ({ onChange }) => {
  const [selectedFilters, setSelectedFilters] = useState([])
  const [filterValues, setFilterValues] = useState({})

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => {
      const next = { ...prev, [key]: value }
      onChange?.(next) // ✅ manda pro pai imediatamente
      return next
    })
  }

  const availableFilters = [
    {
      key: 'identificador',
      label: 'Identificador',
      component: (
        <Input
          placeholder="Digite o identificador, ex: 12345"
          onChange={(e) => handleFilterChange('identificador', e.target.value)}
          value={filterValues.identificador}
        />
      )
    }
  ]

  const handleAddFilter = (key) => {
    if (!selectedFilters.includes(key)) {
      const nextSelected = [...selectedFilters, key]
      setSelectedFilters(nextSelected)

      // opcional: já dispara pro pai que o filtro existe (mesmo vazio)
      onChange?.({ ...filterValues })
    }
  }

  const handleRemoveFilter = (key) => {
    const nextSelected = selectedFilters.filter(f => f !== key)
    setSelectedFilters(nextSelected)

    setFilterValues(prev => {
      const next = { ...prev }
      delete next[key]
      onChange?.(next) // ✅ avisa o pai que removeu
      return next
    })
  }

  return (
    <Card>
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
        {selectedFilters.map((key) => {
          const filter = availableFilters.find(f => f.key === key)

          return (
            <Panel
              header={filter?.label}
              key={key}
              extra={(
                <Button
                  type="text"
                  danger
                  onClick={(e) => {
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
