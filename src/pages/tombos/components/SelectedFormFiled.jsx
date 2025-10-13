import React, { useState, useCallback } from 'react'
import debounce from 'lodash.debounce'

import {
    Col, Select, Button, Spin
} from 'antd'

import { Form } from '@ant-design/compatible'
import {
    PlusOutlined
} from '@ant-design/icons'

const FormItem = Form.Item

const SelectedFormField = ({
    title, validateStatus, initialValue, rules,
    placeholder, children, fieldName, onClickAddMore,
    getFieldDecorator, getFieldError, onChange, autor,
    xs, sm, md, lg, xl, onSearch, others, debounceDelay = 800
}) => {
    const [searchLoading, setSearchLoading] = useState(false)

    const debouncedSearch = useCallback(
        debounce((value) => {
            if (onSearch) {
                setSearchLoading(true)
                onSearch(value)
                setTimeout(() => setSearchLoading(false), 1000)
            }
        }, debounceDelay),
        [onSearch, debounceDelay]
    )

    const handleSearch = (value) => {
        if (value && value.length > 2) { 
            debouncedSearch(value)
        }
    }

    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <Col span={24}>
                <span>{title}</span>
                {autor && (
                    <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                        Autor: {autor}
                    </div>
                )}
            </Col>
            <Col span={24}>
                <FormItem validateStatus={validateStatus}>
                    {getFieldDecorator(fieldName, {
                        initialValue,
                        rules
                    })(
                        <Select
                            style={{ width: '100%' }}
                            mode={title === 'Identificadores:' ? 'multiple' : ''}
                            showSearch
                            placeholder={placeholder}
                            optionFilterProp="children"
                            onChange={onChange}
                            onSearch={onSearch ? handleSearch : undefined}
                            loading={searchLoading || others?.loading}
                            filterOption={onSearch ? false : undefined} // Se tem onSearch, desabilita filtro local
                            notFoundContent={searchLoading || others?.loading ? <Spin size="small" /> : 'Nenhum item encontrado'}
                            {...others}
                        >
                            {children}
                        </Select>
                    )}
                </FormItem>
                {onClickAddMore && (
                    <Button
                        type="dashed"
                        onClick={onClickAddMore}
                        icon={<PlusOutlined />}
                        size="small"
                        style={{ marginTop: 4 }}
                    >
                        Adicionar
                    </Button>
                )}
            </Col>
        </Col>
    )
}

export default SelectedFormField
