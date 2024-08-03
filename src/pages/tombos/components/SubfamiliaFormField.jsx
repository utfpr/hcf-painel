import React, { useState } from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SubfamiliaFormField = ({
    initialValue, subfamilias, getFieldDecorator, onClickAddMore, validateStatus, onChange, autor
}) => {
    const optionSubfamilia = () => subfamilias.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Subfamilias:"
            initialValue={initialValue}
            placeholder="Selecione uma subfamilia"
            fieldName="subfamilia"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
        >
            {optionSubfamilia()}
        </SelectedFormFiled>
    )
}

export default SubfamiliaFormField
