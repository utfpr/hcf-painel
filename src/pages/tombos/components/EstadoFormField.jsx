import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const EstadoFormField = ({
    initialValue, estados, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionEstados = () => estados.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title="Estado:"
            initialValue={initialValue}
            placeholder="Selecione um estado"
            fieldName="estados"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionEstados()}
        </SelectedFormFiled>
    )
}

export default EstadoFormField
