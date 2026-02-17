import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const RelevoFormField = ({
    initialValue, relevos, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const optionRelevos = () => relevos.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))
    
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Relevo:"
            initialValue={initialValue}
            placeholder="Digite para buscar relevos..."
            fieldName="relevo"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum relevo encontrado',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionRelevos()}
        </SelectedFormFiled>
    )
}

export default RelevoFormField
