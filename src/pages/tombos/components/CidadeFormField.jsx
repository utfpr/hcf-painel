import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const CidadeFormField = ({
    initialValue, cidades, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionCidades = () => cidades.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title="Cidade:"
            initialValue={initialValue}
            placeholder="Selecione uma cidade"
            fieldName="cidade"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionCidades()}
        </SelectedFormFiled>
    )
}

export default CidadeFormField
