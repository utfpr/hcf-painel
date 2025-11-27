import React from 'react'

import { Select, Spin } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const CidadeFormField = ({
    initialValue, cidades, getFieldDecorator, onClickAddMore, onChange, validateStatus, getFieldError, onSearch, loading = false, debounceDelay = 600, disabled = false
}) => {
    const optionCidades = () => cidades.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title="Cidade:"
            initialValue={initialValue}
            placeholder="Selecione uma cidade"
            fieldName="cidade"
            getFieldDecorator={getFieldDecorator}
            getFieldError={getFieldError}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            rules={[{
                required: true,
                message: 'Escolha uma cidade'
            }]}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum país encontrado',
                filterOption: onSearch ? false : undefined,
                status: getFieldError && getFieldError('cidade') ? 'error' : ''
            }}
        >
            {optionCidades()}
        </SelectedFormFiled>
    )
}

export default CidadeFormField
