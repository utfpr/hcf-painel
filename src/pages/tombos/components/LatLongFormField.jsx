import React from 'react'

import { Col, InputNumber } from 'antd'

import { Form } from '@ant-design/compatible'

import CoordenadaInputText from '../../../components/CoordenadaInputText'

const FormItem = Form.Item

const LatLongFormField = ({ getFieldDecorator }) => {
    return (
        <>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>Latitude:</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('latitude')(
                            <CoordenadaInputText
                                placeholder={'48°40\'30"O'}
                            />
                        )}
                    </FormItem>
                </Col>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>Longitude:</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('longitude')(
                            <CoordenadaInputText
                                longitude
                                placeholder={'48°40\'30"O'}
                            />
                        )}
                    </FormItem>
                </Col>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>Altitude:</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('altitude')(
                            <InputNumber style={{ width: '100%' }} />
                        )}
                    </FormItem>
                </Col>
            </Col>
        </>
    )
}

export default LatLongFormField
