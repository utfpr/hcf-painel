import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const FamiliaFormField = ({
    initialValue, familias, getFieldDecorator, onClickAddMore, onChange
}) => {
    const optionFamilia = () => familias?.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
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
            placeholder="Selecione uma família"
            fieldName="familia"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
        >
            {optionFamilia()}
        </SelectedFormFiled>
    )
}

export default FamiliaFormField
