import React from 'react'

import {
    Col, Radio, Tag, Input
} from 'antd'
import { useTranslation } from 'react-i18next'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

const RadioGroup = Radio.Group
const { TextArea } = Input

const ColecoesAnexasFormField = ({
    getFieldDecorator, colecaoInicial, onChange, value
}) => {
    const { t } = useTranslation('tombo')
    return (
        <>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>{t('annexCollections')}</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('tipoColecaoAnexa', {
                            initialValue: String(colecaoInicial)
                        })(
                            <RadioGroup onChange={onChange} value={value}>
                                <Radio value="CARPOTECA"><Tag color="red">Carpoteca</Tag></Radio>
                                <Radio value="XILOTECA"><Tag color="green">Xiloteca</Tag></Radio>
                                <Radio value="VIA LIQUIDA"><Tag color="blue">Via Líquida</Tag></Radio>
                            </RadioGroup>
                        )}
                    </FormItem>
                </Col>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Col span={24}>
                    <span>{t('siteCollectionObservations')}</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('observacoesColecaoAnexa')(
                            <TextArea rows={4} />
                        )}
                    </FormItem>
                </Col>
            </Col>
        </>
    )
}

export default ColecoesAnexasFormField
