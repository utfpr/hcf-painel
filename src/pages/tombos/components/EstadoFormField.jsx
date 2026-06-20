import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const EstadoFormField = ({
    initialValue, estados, getFieldDecorator, onClickAddMore, onChange, validateStatus, onSearch, loading = false, debounceDelay = 200, disabled = false
}) => {
    const { t } = useTranslation('tombo')
    const optionEstados = () => estados.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))
    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            title={t('state')}
            initialValue={initialValue}
            placeholder={t('selectState')}
            fieldName="estados"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('state').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionEstados()}
        </SelectedFormFiled>
    )
}

export default EstadoFormField
