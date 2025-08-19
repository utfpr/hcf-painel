import React from 'react'

import {
    Col, Radio, Tag
} from 'antd'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

const RadioGroup = Radio.Group

const ExsicataTipoFormField = ({
    getFieldDecorator, onChange, value
}) => {
    return (
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Col span={24}>
                <span>Tipo da exsicata:</span>
            </Col>
            <Col span={24}>
                <FormItem>
                    {getFieldDecorator('exsicataTipo', {
                        initialValue: 'UNICATA'
                    })(
                        <RadioGroup onChange={onChange} value={value}>
                            <Radio value="UNICATA"><Tag color="cyan">Unicata</Tag></Radio>
                            <Radio value="DUPLICATA"><Tag color="pink">Duplicata</Tag></Radio>
                        </RadioGroup>
                    )}
                </FormItem>
            </Col>
        </Col>
    )
}

export default ExsicataTipoFormField
