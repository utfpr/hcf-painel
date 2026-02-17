import React from 'react'

import { Col, InputNumber } from 'antd'

import { Form } from '@ant-design/compatible'

import CoordenadaInputText from '../../../components/CoordenadaInputText'

const FormItem = Form.Item

// Função para validar se o valor decimal está dentro dos limites
const validaCoordenadaDecimal = (valor, isLongitude) => {
    if (valor === undefined || valor === null || valor === '') return true
    if (Number.isNaN(valor)) return false
    const maxValor = isLongitude ? 180 : 90
    return valor >= -maxValor && valor <= maxValor
}

const LatLongFormField = ({ getFieldDecorator, form }) => {
    // Validador customizado para latitude
    const validadorLatitude = (rule, value, callback) => {
        const longitude = form?.getFieldValue('longitude')
        
        // Se latitude está vazia
        if (value === undefined || value === null || value === '') {
            // Longitude também deve estar vazia
            if (longitude !== undefined && longitude !== null && longitude !== '') {
                callback('Latitude é obrigatória quando longitude está preenchida')
                return
            }
            callback()
            return
        }
        
        // Valida o valor
        if (!validaCoordenadaDecimal(value, false)) {
            callback('Latitude inválida (deve estar entre -90 e 90)')
            return
        }
        
        callback()
    }

    // Validador customizado para longitude
    const validadorLongitude = (rule, value, callback) => {
        const latitude = form?.getFieldValue('latitude')
        
        // Se longitude está vazia
        if (value === undefined || value === null || value === '') {
            // Latitude também deve estar vazia
            if (latitude !== undefined && latitude !== null && latitude !== '') {
                callback('Longitude é obrigatória quando latitude está preenchida')
                return
            }
            callback()
            return
        }
        
        // Valida o valor
        if (!validaCoordenadaDecimal(value, true)) {
            callback('Longitude inválida (deve estar entre -180 e 180)')
            return
        }
        
        callback()
    }

    return (
        <>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Col span={24}>
                    <span>Latitude:</span>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('latitude', {
                            rules: [
                                { validator: validadorLatitude }
                            ]
                        })(
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
                        {getFieldDecorator('longitude', {
                            rules: [
                                { validator: validadorLongitude }
                            ]
                        })(
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
