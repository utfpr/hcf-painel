import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SoloFormField = ({
    initialValue, solos, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 600
}) => {
    const optionSolos = () => solos.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
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
            placeholder="Digite para buscar solos..."
            fieldName="solo"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhum solo encontrado',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionSolos()}
        </SelectedFormFiled>
    )
}

export default SoloFormField
