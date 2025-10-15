import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const GeneroFormField = ({
    initialValue, generos, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 600, disabled = false
}) => {
    const optionGeneros = () => generos?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Gênero:"
            initialValue={initialValue}
            placeholder="Digite para buscar gêneros..."
            fieldName="genero"
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
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum gênero encontrado',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionGeneros()}
        </SelectedFormFiled>
    )
}

export default GeneroFormField
