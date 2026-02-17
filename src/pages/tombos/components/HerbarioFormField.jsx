import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const HerbarioFormField = ({
    initialValue, herbarios, getFieldDecorator, onChange,
    onSearch, loading = false, debounceDelay = 200, getFieldError
}) => {
    const optionHerbarios = () => herbarios.map(item => (
        <Option key={item.id} value={`${item.id}`}>
            {item.sigla} - {item.nome}
        </Option>
    ))
    
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={12}
            xl={12}
            title="Herbário:"
            initialValue={initialValue}
            placeholder="Selecione uma entidade"
            fieldName="entidade"
            getFieldDecorator={getFieldDecorator}
            onChange={onChange}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            getFieldError={getFieldError}
            others={{
                allowClear: true,
                showSearch: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum herbário encontrado',
                filterOption: false,
                status: getFieldError && getFieldError('entidade') ? 'error' : ''
            }}
        >
            {optionHerbarios()}
        </SelectedFormFiled>
    )
}

export default HerbarioFormField
