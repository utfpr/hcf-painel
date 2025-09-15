import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const PaisFormField = ({
    initialValue, paises, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionPaises = () => paises.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title="País:"
            initialValue={initialValue}
            placeholder="Selecione um pais"
            fieldName="pais"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            others={{allowClear: true}}
        >
            {optionPaises()}
        </SelectedFormFiled>
    )
}

export default PaisFormField
