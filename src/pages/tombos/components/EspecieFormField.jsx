import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const EspecieFormField = ({
    initialValue, especies, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor,
    onSearch, loading = false, debounceDelay = 200, disabled = false
}) => {
    const optionEspecie = () => especies?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Espécie:"
            initialValue={initialValue}
            placeholder="Digite para buscar espécies..."
            fieldName="especie"
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
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma espécie encontrada',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionEspecie()}
        </SelectedFormFiled>
    )
}

export default EspecieFormField
