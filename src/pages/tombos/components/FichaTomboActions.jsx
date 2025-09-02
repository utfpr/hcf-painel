import React, { useState } from 'react'

import {
    Divider,
    Button,
    Modal,
    Form,
    InputNumber,
    Select,
    Alert,
    Spin,
    message
} from 'antd'

import { PrinterOutlined } from '@ant-design/icons'

import { fichaTomboUrl } from '../../../config/api'
import { requisitaCodigoBarrasService } from '../TomboService'

const FichaTomboActions = ({ hcf }) => {
    const [state, setState] = useState({
        open: false,
        comCodigo: true,
        copias: 1
    })

    const [form] = Form.useForm()
    const [codigos, setCodigos] = useState([])
    const [loadingCodigos, setLoadingCodigos] = useState(false)
    const [printing, setPrinting] = useState(false)

    const abrirModalImpressao = async comCodigo => {
        setState(s => ({ ...s, open: true, comCodigo }))
        form.setFieldsValue({
            copias: 1,
            codigoSelecionado: undefined
        })

        if (comCodigo) {
            setLoadingCodigos(true)
            try {
                let response = null
                const getResponse = resp => { response = resp }
                await requisitaCodigoBarrasService(getResponse, hcf)

                const lista = response?.data?.map(c => c.codigo_barra) ?? []
                setCodigos(lista)

                // se vier ao menos um código, pré-seleciona o primeiro
                if (lista.length > 0) {
                    form.setFieldsValue({ codigoSelecionado: lista[0] })
                }
            } catch (err) {
                message.error('Não foi possível carregar os códigos de barras.')
                setCodigos([])
            } finally {
                setLoadingCodigos(false)
            }
        } else {
            // sem código, limpa possíveis resíduos
            setCodigos([])
        }
    }

    const fechar = () => {
        setState(s => ({ ...s, open: false }))
    }

    const confirmarImpressao = async () => {
        try {
            setPrinting(true)
            const valores = await form.validateFields()

            message.success('Impressão iniciada!')
            const url = state.comCodigo ? `${fichaTomboUrl}/fichas/tombos/${hcf}/1`
                + `?qtd=${valores.copias}&code=${valores.codigoSelecionado}`
                : `${fichaTomboUrl}/fichas/tombos/${hcf}/0?qtd=${valores.copias}`
            window.open(url, '_blank')
            fechar()
        } catch (e) {
            message.error('Não foi possível iniciar a impressão.')
        } finally {
            setPrinting(false)
        }
    }

    const modalContent = () => {
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                <div>
                    <strong>Tombo:</strong>
                    {' '}
                    {hcf ?? '-'}
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ copias: 1 }}
                >
                    <Form.Item
                        name="copias"
                        label="Quantidade de cópias"
                        rules={[
                            { required: true, message: 'Informe a quantidade de cópias' },
                            {
                                validator: (_, v) => (v >= 1 && v <= 3
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Permitido entre 1 e 3')))
                            }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={3}
                            style={{ width: '100%' }}
                            disabled={printing || (state.comCodigo && (!codigos || codigos.length === 0))}
                        />
                    </Form.Item>

                    {state.comCodigo && loadingCodigos && (
                        <Spin tip="Carregando códigos de barras..." />
                    )}
                    {state.comCodigo && !loadingCodigos && codigos.length === 0 && (
                        <Alert
                            type="warning"
                            showIcon
                            message="Nenhum código de barras disponível para este tombo."
                        />
                    )}
                    {state.comCodigo && !loadingCodigos && codigos.length > 0 && (
                        <Form.Item
                            name="codigoSelecionado"
                            label="Código de barras"
                            rules={[{ required: true, message: 'Selecione um código de barras' }]}
                        >
                            <Select
                                options={codigos.map(c => ({ value: c, label: c }))}
                                placeholder="Selecione o código"
                                showSearch
                                filterOption={(input, option) => {
                                    return option?.label.toLowerCase().includes(input.toLowerCase())
                                }}
                            />
                        </Form.Item>
                    )}
                </Form>
            </div>
        )
    }

    return (
        <div>
            <Button
                style={{ width: 'fit-content' }}
                type="link"
                icon={<PrinterOutlined style={{ color: '#277a01' }} />}
                onClick={() => abrirModalImpressao(true)}
                title="Imprimir ficha com código de barras"
            />
            <Divider type="vertical" />
            <Button
                style={{ width: 'fit-content' }}
                type="link"
                icon={<PrinterOutlined style={{ color: '#0066ff' }} />}
                onClick={() => abrirModalImpressao(false)}
                title="Imprimir ficha sem código de barras"
            />
            <Divider type="vertical" />

            {state.comCodigo && (!codigos || !codigos.length) ? (
                <Modal
                    title={
                        state.comCodigo
                            ? 'Imprimir Ficha Tombo (com código de barras)'
                            : 'Imprimir Ficha Tombo (sem código de barras)'
                    }
                    open={state.open}
                    onOk={fechar}
                    onCancel={fechar}
                    okText="Cancelar"
                    destroyOnClose
                    maskClosable={false}
                    cancelButtonProps={{ style: { display: 'none' } }}
                >
                    {modalContent()}
                </Modal>
            ) : (
                <Modal
                    title={
                        state.comCodigo
                            ? 'Imprimir Ficha Tombo (com código de barras)'
                            : 'Imprimir Ficha Tombo (sem código de barras)'
                    }
                    open={state.open}
                    onOk={confirmarImpressao}
                    onCancel={fechar}
                    okText="Imprimir"
                    cancelText="Cancelar"
                    confirmLoading={printing}
                    destroyOnClose
                    maskClosable={false}
                >
                    {modalContent()}
                </Modal>
            )}
        </div>
    )
}

export default FichaTomboActions
