import React from 'react'

import { Col, Input } from 'antd'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

const InputFormField = ({
    getFieldDecorator, name, title, disabled = false
}) => {
    return (
        <Col xs={24} sm={24} md={8} lg={12} xl={12}>
            <Col span={24}>
                <span>{title}</span>
            </Col>
            <Col span={24}>
                <FormItem>
                    {getFieldDecorator(name)(
                        <Input disabled={disabled} type="text" />
                    )}
                </FormItem>
            </Col>
        </Col>
    )
}

export default InputFormField
