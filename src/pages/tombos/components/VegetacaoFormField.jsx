import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const VegetacaoFormField = ({
    initialValue, vegetacoes, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionVegetacoes = () => vegetacoes.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Vegetação:"
            initialValue={initialValue}
            placeholder="Selecione uma vegetação"
            fieldName="vegetacao"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionVegetacoes()}
        </SelectedFormFiled>
    )
}

export default VegetacaoFormField
