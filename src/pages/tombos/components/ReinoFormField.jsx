import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const ReinoFormField = ({
    initialValue, reinos, getFieldDecorator, onClickAddMore, onChange, 
    onSearch, loading = false, debounceDelay = 200
}) => {
    const optionReino = () => reinos?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Reino:"
            initialValue={initialValue}
            placeholder="Digite para buscar reinos..."
            fieldName="reino"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum reino encontrado',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionReino()}
        </SelectedFormFiled>
    )
}

export default ReinoFormField
