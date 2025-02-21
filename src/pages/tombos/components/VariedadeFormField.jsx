import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const VariedadeFormField = ({
    initialValue, variedades, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor
}) => {
    const optionVariedades = () => variedades.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Variedades:"
            initialValue={initialValue}
            placeholder="Selecione uma variedade"
            fieldName="variedade"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
        >
            {optionVariedades()}
        </SelectedFormFiled>
    )
}

export default VariedadeFormField
