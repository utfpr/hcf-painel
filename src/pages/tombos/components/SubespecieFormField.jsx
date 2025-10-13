import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SubespecieFormField = ({
    initialValue, subespecies, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor,
    onSearch, loading = false, debounceDelay = 600
}) => {
    const optionSubespecies = () => subespecies?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
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
            placeholder="Digite para buscar subespécies..."
            fieldName="subespecie"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : 'Nenhuma subespécie encontrada',
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionSubespecies()}
        </SelectedFormFiled>
    )
}

export default SubespecieFormField
