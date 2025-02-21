import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const EspecieFormField = ({
    initialValue, especies, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor
}) => {
    const optionEspecie = () => especies.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
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
            placeholder="Selecione uma espécie"
            fieldName="especie"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
        >
            {optionEspecie()}
        </SelectedFormFiled>
    )
}

export default EspecieFormField
