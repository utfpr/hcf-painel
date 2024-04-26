import React from 'react'

import {
    Col, Select, Button
} from 'antd'

import { Form } from '@ant-design/compatible'
import {
    PlusOutlined
} from '@ant-design/icons'

const FormItem = Form.Item

const SelectedFormFiled = ({
    title, validateStatus, initialValue, rules,
    placeholder, children, fieldName, onClickAddMore,
    getFieldDecorator, getFieldError, onChange,
    xs, sm, md, lg, xl, others
}) => {
    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <Col span={24}>
                <span>{title}</span>
            </Col>
            <Col span={22}>
                <FormItem validateStatus={validateStatus}>
                    {getFieldDecorator(fieldName, {
                        initialValue,
                        rules
                    })(
                        <Select
                            showSearch
                            placeholder={placeholder}
                            optionFilterProp="children"
                            onChange={onChange}
                            {...others}
                        >
                            {children}
                        </Select>
                    )}
                </FormItem>
            </Col>
            {onClickAddMore
                ? (
                    <Col span={2}>
                        <Button
                            shape="dashed"
                            icon={<PlusOutlined />}
                            style={{
                                marginTop: '5px'
                            }}
                            onClick={onClickAddMore}
                        />
                    </Col>
                )
                : (<> </>)}
        </Col>
    )
}

export default SelectedFormFiled
