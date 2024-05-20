import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const FaseFormField = ({
    initialValue, fases, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionFases = () => fases.map(item => (
        <Option value={`${item.numero}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Fase sucessional:"
            initialValue={initialValue}
            placeholder="Selecione uma fase sucessional"
            fieldName="fases"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionFases()}
        </SelectedFormFiled>
    )
}

export default FaseFormField
