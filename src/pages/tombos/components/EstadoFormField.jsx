import React from 'react'

import { Select, Spin } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const EstadoFormField = ({
    initialValue, estados, getFieldDecorator, onClickAddMore, onChange, validateStatus, onSearch, loading = false, debounceDelay = 200, disabled = false
}) => {
    const optionEstados = () => estados.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title="Estado:"
            initialValue={initialValue}
            placeholder="Selecione um estado"
            fieldName="estados"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum país encontrado',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionEstados()}
        </SelectedFormFiled>
    )
}

export default EstadoFormField
