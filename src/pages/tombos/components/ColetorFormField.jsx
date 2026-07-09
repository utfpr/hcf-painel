import React from 'react'

import { Select } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const ColetorFormField = ({
    initialValue,
    coletores,
    getFieldDecorator,
    onClickAddMore,
    onChange,
    validateStatus,
    rules,
    getFieldError,
    onSearch,
    others = {},
    ...selectProps
}) => {
    const { t } = useTranslation('tombo')
    const optionColetor = () => coletores.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    const mergedOthers = { ...others, ...selectProps }

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={24}
            title={t('collector')}
            initialValue={initialValue}
            placeholder={t('searchCollectors')}
            fieldName="coletores"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            rules={rules}
            getFieldError={getFieldError}
            onSearch={onSearch}
            others={mergedOthers}
        >
            {optionColetor()}
        </SelectedFormFiled>
    )
}

export default ColetorFormField
