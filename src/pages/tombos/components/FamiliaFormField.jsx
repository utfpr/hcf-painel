import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const FamiliaFormField = ({
    initialValue, familias, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    getFieldError, onSearch, loading = false, debounceDelay = 600
}) => {
    const optionFamilia = () => familias?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Família:"
            initialValue={initialValue}
            placeholder="Digite para buscar famílias..."
            fieldName="familia"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma família encontrada',
                filterOption: onSearch ? false : undefined,
                status: getFieldError && getFieldError('familia') ? 'error' : ''
            }}
        >
            {optionFamilia()}
        </SelectedFormFiled>
    )
}

export default FamiliaFormField
