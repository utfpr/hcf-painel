import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SoloFormField = ({
    initialValue, solos, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const { t } = useTranslation('tombo')
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
            title={t('soil')}
            initialValue={initialValue}
            placeholder={t('searchSoils')}
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
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('soil').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionSolos()}
        </SelectedFormFiled>
    )
}

export default SoloFormField
