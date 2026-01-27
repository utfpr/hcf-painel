import React from 'react'

import { Select, Spin } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const CidadeFormField = ({
    initialValue, cidades, getFieldDecorator, onClickAddMore, onChange, validateStatus, help, getFieldError, onSearch, loading = false, debounceDelay = 600, disabled = false
}) => {
    const errorList = getFieldError && getFieldError('cidade')
    const hasError = errorList && errorList.length > 0
    const finalStatus = hasError ? 'error' : (validateStatus || '')
    const warningMessage = (!hasError && help) ? (
        <span style={{ color: '#faad14', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: '500' }}>
            ⚠️ {help}
        </span>
    ) : null

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
            validateStatus={finalStatus}
            extra={hasError ? null : warningMessage}
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
                status: finalStatus
            }}
        >
            {optionCidades()}
        </SelectedFormFiled>
    )
}

export default CidadeFormField
