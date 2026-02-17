import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const VegetacaoFormField = ({
    initialValue, vegetacoes, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const optionVegetacoes = () => vegetacoes.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))
    
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Vegetação:"
            initialValue={initialValue}
            placeholder="Digite para buscar vegetações..."
            fieldName="vegetacao"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma vegetação encontrada',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionVegetacoes()}
        </SelectedFormFiled>
    )
}

export default VegetacaoFormField
