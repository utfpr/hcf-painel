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
    getFieldDecorator, getFieldError, onChange, autor,
    xs, sm, md, lg, xl, others
}) => {
    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <Col span={24}>
                <span>{title}</span>
            </Col>
            <Col span={24}>
                <FormItem validateStatus={validateStatus}>
                    {getFieldDecorator(fieldName, {
                        initialValue,
                        rules
                    })(
                        <Select
                            style={{ width: '100%' }}
                            mode={title === 'Identificador:' ? 'multiple' : ''}
                            showSearch
                            placeholder={placeholder}
                            optionFilterProp="children"
                            status={getFieldError && getFieldError(fieldName) ? 'error' : ''}
                            onChange={onChange}
                            {...others}
                        >
                            {children}
                        </Select>
                    )}
                </FormItem>
            </Col>
            {autor ? (
                <Col span={24}>
                    <span>
                        <b>Autor:</b>
                        {' '}
                        {autor}
                    </span>
                </Col>
            )
                : null}

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
