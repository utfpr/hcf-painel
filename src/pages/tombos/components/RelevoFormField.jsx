import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const RelevoFormField = ({
    initialValue, relevos, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionRelevos = () => relevos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Relevos:"
            initialValue={initialValue}
            placeholder="Selecione um relevo"
            fieldName="relevo"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
        >
            {optionRelevos()}
        </SelectedFormFiled>
    )
}

export default RelevoFormField
