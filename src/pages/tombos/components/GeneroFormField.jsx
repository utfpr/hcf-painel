import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const GeneroFormField = ({
    initialValue, generos, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionGenero = () => generos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
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
            placeholder="Selecione um gênero"
            fieldName="genero"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionGenero()}
        </SelectedFormFiled>
    )
}

export default GeneroFormField
