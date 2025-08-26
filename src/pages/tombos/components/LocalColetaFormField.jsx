import React from 'react'
import { Select, Spin } from 'antd'
import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const LocalColetaFormField = ({
    getFieldDecorator,
    initialValue,
    locaisColeta,
    fetchingLocaisColeta,
    onSearch,
    onClickAddMore
}) => {
    const optionLocalColeta = () => locaisColeta.map(d => <Option key={d.id}>{d.descricao}</Option>)

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={16}
            lg={8}
            xl={8}
            title="Local de coleta:"
            initialValue={initialValue ? { key: initialValue } : undefined}
            placeholder="Busque pelo local de coleta"
            fieldName="complemento"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onSearch={onSearch}
            others={{
                labelInValue: true,
                filterOption: true,            
            }}
        >
            {optionLocalColeta()}
        </SelectedFormFiled>
    )
}

export default LocalColetaFormField
