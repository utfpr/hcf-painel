import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const FaseFormField = ({
    initialValue, fases, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const optionFases = () => fases.map(item => (
        <Option key={item.numero} value={`${item.numero}`}>{item.nome}</Option>
    ))
    
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Fase sucessional:"
            initialValue={initialValue}
            placeholder="Digite para buscar fases..."
            fieldName="fases"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma fase encontrada',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionFases()}
        </SelectedFormFiled>
    )
}

export default FaseFormField
