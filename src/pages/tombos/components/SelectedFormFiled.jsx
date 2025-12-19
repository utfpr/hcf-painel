import React, { useState, useCallback, useEffect } from 'react'
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
    xs, sm, md, lg, xl, onSearch, others, debounceDelay = 800, disabled = false, extra
}) => {
    const [searchLoading, setSearchLoading] = useState(false)
    const [lastSearchValue, setLastSearchValue] = useState('')

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
        const normalizedValue = value || ''
        
        if (normalizedValue !== lastSearchValue) {
            setLastSearchValue(normalizedValue)
            debouncedSearch(normalizedValue)
        }
    }

    useEffect(() => {
        if (disabled) {
            setLastSearchValue('')
        }
    }, [disabled])

    const handleClear = () => {
        setLastSearchValue('')
        if (onSearch && !disabled) {
            setSearchLoading(true)
            onSearch('')
            setTimeout(() => setSearchLoading(false), 1000)
        }
    }

    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <Col span={24}>
                <span>{title}</span>
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
                            placeholder={disabled ? 'Selecione o nível superior primeiro' : placeholder}
                            optionFilterProp="children"
                            onChange={onChange}
                            onSearch={onSearch ? handleSearch : undefined}
                            onClear={handleClear}
                            loading={searchLoading || others?.loading}
                            filterOption={onSearch ? false : undefined}
                            disabled={disabled}
                            notFoundContent={others?.notFoundContent || (searchLoading || others?.loading ? <Spin size="small" /> : 'Nenhum resultado encontrado')}
                            {...others}
                        >
                            {children}
                        </Select>
                    )}
                </FormItem>
            </Col>
            {extra && (
                <Col span={24} style={{ marginTop: '-5px', marginBottom: '20px' }}>
                    {extra}
                </Col>
            )}
            {autor ? (
                <Col span={24}>
                    <span>
                        <b>Autor:</b>
                        {' '}
                        {autor}
                    </span>
                </Col>
            )
                : null}
            {onClickAddMore && !disabled && (
                <Col span={2}>
                    <Button
                        shape="dashed"
                        icon={<PlusOutlined />}
                        onClick={onClickAddMore}
                        style={{ marginTop: '5px' }}
                    />
                </Col>
            )}
        </Col>
    )
}

export default SelectedFormField
