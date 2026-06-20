import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const IdentificadorFormField = ({
    initialValue, identificadores, getFieldDecorator, onChange, onSearch,
    onClickAddMore, loading = false, debounceDelay = 200, getFieldError
}) => {
    const { t } = useTranslation('tombo')
    const optionIdentificadores = () => identificadores?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title={t('identifier')}
            initialValue={initialValue}
            placeholder={t('searchIdentifiers')}
            fieldName="identificador"
            getFieldDecorator={getFieldDecorator}
            onChange={onChange}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            onClickAddMore={onClickAddMore}
            others={{
                allowClear: true,
                mode: 'multiple',
                loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('identifier').replace(':', '').toLowerCase() }),
                filterOption: false,
                labelInValue: true,
                status: getFieldError && getFieldError('identificador') ? 'error' : ''
            }}
        >
            {optionIdentificadores()}
        </SelectedFormFiled>
    )
}

export default IdentificadorFormField
