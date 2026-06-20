import React from 'react'

import { Select } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const HerbarioFormField = ({
    initialValue, herbarios, getFieldDecorator, onChange,
    loading = false, getFieldError
}) => {
    const { t } = useTranslation('tombo')
    const optionHerbarios = () => herbarios.map(item => (
        <Option key={item.id} value={`${item.id}`}>
            {item.sigla}
            {' '}
            -
            {' '}
            {item.nome}
        </Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={8}
            lg={12}
            xl={12}
            title={t('herbarium')}
            initialValue={initialValue}
            placeholder={t('selectEntity')}
            fieldName="entidade"
            getFieldDecorator={getFieldDecorator}
            onChange={onChange}
            getFieldError={getFieldError}
            others={{
                allowClear: true,
                showSearch: true,
                loading: loading,
                notFoundContent: t('noneFoundEntity', { entity: t('herbarium').replace(':', '').toLowerCase() }),
                status: getFieldError && getFieldError('entidade') ? 'error' : ''
            }}
        >
            {optionHerbarios()}
        </SelectedFormFiled>
    )
}

export default HerbarioFormField
