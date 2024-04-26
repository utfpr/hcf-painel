import React from 'react'

import {
    Col, Row, InputNumber
} from 'antd'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item

const DataIdentificacaoFormField = ({ getFieldDecorator }) => {
    return (
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Col span={24}>
                <span> Data identificação: </span>
            </Col>
            <Col span={24}>
                <Row type="flex" gutter={4}>
                    <Col span={8}>
                        <FormItem>
                            {getFieldDecorator('dataIdentDia')(
                                <InputNumber
                                    min={1}
                                    max={31}
                                    initialValue={17}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem>
                            {getFieldDecorator('dataIdentMes')(
                                <InputNumber
                                    min={1}
                                    max={12}
                                    initialValue={11}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem>
                            {getFieldDecorator('dataIdentAno')(
                                <InputNumber
                                    min={500}
                                    max={5000}
                                    initialValue={2018}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </Col>
        </Col>
    )
}

export default DataIdentificacaoFormField
