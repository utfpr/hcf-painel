import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const IdentificadorFormField = ({
    initialValue, identificadores, getFieldDecorator, onChange, onSearch,
    loading = false, debounceDelay = 200, getFieldError
}) => {
    const optionIdentificadores = () => identificadores?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Identificador:"
            initialValue={initialValue}
            placeholder="Digite para buscar identificadores..."
            fieldName="identificador"
            getFieldDecorator={getFieldDecorator}
            onChange={onChange}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                mode: 'multiple',
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum identificador encontrado',
                filterOption: false,
                labelInValue: true,
                status: getFieldError && getFieldError('identificador') ? 'error' : ''
            }}
        >
            {optionIdentificadores()}
        </SelectedFormFiled>
    )
}

export default IdentificadorFormField
