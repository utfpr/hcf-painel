import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const LocalColetaFormField = ({
    getFieldDecorator,
    initialValue,
    locaisColeta,
    fetchingLocaisColeta,
    onSearch,
    onClickAddMore,
    getFieldError,
    loading = false,
    debounceDelay = 200,
    disabled = false
}) => {
    const { t } = useTranslation('tombo')
    const optionLocalColeta = () => locaisColeta.map(d => <Option key={d.id}>{d.descricao}</Option>)

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={16}
            lg={8}
            xl={8}
            title={t('siteCollection')}
            initialValue={initialValue ? { key: initialValue } : undefined}
            placeholder={t('searchSites')}
            fieldName="complemento"
            getFieldDecorator={getFieldDecorator}
            getFieldError={getFieldError}
            onClickAddMore={onClickAddMore}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('siteCollection').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}

        >
            {optionLocalColeta()}
        </SelectedFormFiled>
    )
}

export default LocalColetaFormField
