import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'
import { all } from 'axios'

const { Option } = Select

const SoloFormField = ({
    initialValue, solos, getFieldDecorator, onClickAddMore, onChange, validateStatus
}) => {
    const optionSolos = () => solos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Solo:"
            initialValue={initialValue}
            placeholder="Selecione um solo"
            fieldName="solo"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            others={{allowClear: true}}
        >
            {optionSolos()}
        </SelectedFormFiled>
    )
}

export default SoloFormField
