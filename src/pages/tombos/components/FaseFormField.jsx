import React from 'react'

import { Select, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import SelectedFormFiled from './SelectedFormFiled'

const { Option } = Select

const FaseFormField = ({
    initialValue, fases, getFieldDecorator, onClickAddMore, onChange, validateStatus,
    onSearch, loading = false, debounceDelay = 200
}) => {
    const { t } = useTranslation('tombo')
    const optionFases = () => fases.map(item => (
        <Option key={item.numero} value={`${item.numero}`}>{item.nome}</Option>
    ))

    return (
        <SelectedFormFiled
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={12}
            title={t('successionalStage')}
            initialValue={initialValue}
            placeholder={t('searchStages')}
            fieldName="fases"
            getFieldDecorator={getFieldDecorator}
            onClickAddMore={onClickAddMore}
            onChange={onChange}
            validateStatus={validateStatus}
            onSearch={onSearch}
            debounceDelay={debounceDelay}
            others={{
                allowClear: true,
                loading: loading,
                notFoundContent: loading ? <Spin size="small" /> : t('noneFoundEntity', { entity: t('successionalStage').replace(':', '').toLowerCase() }),
                filterOption: onSearch ? false : undefined
            }}
        >
            {optionFases()}
        </SelectedFormFiled>
    )
}

export default FaseFormField
