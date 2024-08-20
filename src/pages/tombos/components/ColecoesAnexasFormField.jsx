import React from 'react'

import {
    Col, Radio, Tag, Input
} from 'antd'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

const RadioGroup = Radio.Group
const { TextArea } = Input

const ColecoesAnexasFormField = ({
    getFieldDecorator, colecaoInicial, onChange, value
}) => {
    return (
        <>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>Coleções anexas:</span>
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
                    <span> Observações da coleção anexa: </span>
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
