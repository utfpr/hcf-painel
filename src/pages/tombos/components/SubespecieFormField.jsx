import React from 'react'

import { Select } from 'antd'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SubespecieFormField = ({
    initialValue, subespecies, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor
}) => {
    const optionSubespecies = () => subespecies.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title="Subespécie:"
            initialValue={initialValue}
            placeholder="Selecione uma subespécie"
            fieldName="subespecie"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
            others={{allowClear: true}}
        >
            {optionSubespecies()}
        </SelectedFormFiled>
    )
}

export default SubespecieFormField
