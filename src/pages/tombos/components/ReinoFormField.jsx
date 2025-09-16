import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const ReinoFormField = ({
    initialValue, reinos, getFieldDecorator, onClickAddMore, onChange
}) => {
    const optionReino = () => reinos?.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Reino:"
            initialValue={initialValue}
            placeholder="Selecione um reino"
            fieldName="reino"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            others={{allowClear: true}}
        >
            {optionReino()}
        </SelectedFormFiled>
    )
}

export default ReinoFormField
