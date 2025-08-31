import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const IdentificadorFormField = ({
    initialValue, identificadores, getFieldDecorator,
    onClickAddMore, onChange, validateStatus, getFieldError, onSearch
}) => {
    const optionIdentificadores = () => identificadores.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Identificadores:"
            initialValue={initialValue}
            placeholder="Selecione um identificador"
            fieldName="identificador"
            labelInValue
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            getFieldError={getFieldError}
            onSearch={onSearch}
        >
            {optionIdentificadores()}
        </SelectedFormFiled>
    )
}

export default IdentificadorFormField
