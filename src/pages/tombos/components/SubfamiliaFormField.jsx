import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SubfamiliaFormField = ({
    initialValue, subfamilias, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor,
    onSearch, loading = false, debounceDelay = 600, disabled = false
}) => {
    const optionSubfamilias = () => subfamilias?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Subfamília:"
            initialValue={initialValue}
            placeholder="Digite para buscar subfamílias..."
            fieldName="subfamilia"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma subfamília encontrada',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionSubfamilias()}
        </SelectedFormFiled>
    )
}

export default SubfamiliaFormField
