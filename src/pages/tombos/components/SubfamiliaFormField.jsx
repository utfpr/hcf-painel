import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const SubfamiliaFormField = ({
    initialValue, subfamilias, getFieldDecorator, onClickAddMore, onChange, validateStatus, autor,
    onSearch, loading = false, debounceDelay = 200, disabled = false
}) => {
    const { t } = useTranslation('tombo')
    const optionSubfamilias = () => subfamilias?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title={t('subfamily')}
            initialValue={initialValue}
            placeholder={t('searchSubfamilies')}
            fieldName="subfamilia"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            autor={autor}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            disabled={disabled}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('subfamily').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionSubfamilias()}
        </SelectedFormFiled>
    )
}

export default SubfamiliaFormField
