import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const ReinoFormField = ({
    initialValue, reinos, getFieldDecorator, onClickAddMore, onChange,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const { t } = useTranslation('tombo')
    const optionReino = () => reinos?.map(item => (
        <Option key={item.id} value={`${item.id}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title={t('kingdom')}
            initialValue={initialValue}
            placeholder={t('searchKingdoms')}
            fieldName="reino"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('kingdom').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionReino()}
        </SelectedFormFiled>
    )
}

export default ReinoFormField
