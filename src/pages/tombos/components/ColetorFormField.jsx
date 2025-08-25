import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const ColetorFormField = ({
    initialValue, coletores, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    ...others
}) => {
    const optionColetor = () => coletores.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={24}
            title="Coletor:"
            initialValue={initialValue}
            placeholder="Selecione os coletores"
            fieldName="coletores"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            others={others}
        >
            {optionColetor()}
        </SelectedFormFiled>
    )
}

export default ColetorFormField
