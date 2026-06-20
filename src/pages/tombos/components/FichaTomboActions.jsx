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

const TIPOS = {
    comCodigo: {
        label: 'Imprimir Ficha Tombo (com código de barras)',
        title: 'Imprimir ficha com código de barras',
        color: '#277a01',
        imprimir_cod: 1
    },
    semCodigo: {
        label: 'Imprimir Ficha Tombo (sem código de barras)',
        title: 'Imprimir ficha sem código de barras',
        color: '#0066ff',
        imprimir_cod: 0
    },
    reduzida: {
        label: 'Imprimir Ficha Tombo Reduzida',
        title: 'Imprimir ficha reduzida',
        color: '#e67e00',
        imprimir_cod: 2
    }
}

const FichaTomboActions = ({ hcf }) => {
    const [state, setState] = useState({
        open: false,
        tipo: 'comCodigo',
        copias: 1
    })

    const [form] = Form.useForm()
    const [codigos, setCodigos] = useState([])
    const [loadingCodigos, setLoadingCodigos] = useState(false)
    const [printing, setPrinting] = useState(false)

    const abrirModalImpressao = async tipo => {
        setState(s => ({ ...s, open: true, tipo }))
        form.setFieldsValue({ copias: 1, codigoSelecionado: undefined })

        if (tipo === 'comCodigo') {
            setLoadingCodigos(true)
            try {
                let response = null
                await requisitaCodigoBarrasService(resp => { response = resp }, hcf)
                const lista = response?.data?.map(c => c.codigo_barra) ?? []
                setCodigos(lista)
                if (lista.length > 0) {
                    form.setFieldsValue({ codigoSelecionado: lista[0] })
                }
            } catch {
                message.error('Não foi possível carregar os códigos de barras.')
                setCodigos([])
            } finally {
                setLoadingCodigos(false)
            }
        } else {
            setCodigos([])
        }
    }

    const fechar = () => setState(s => ({ ...s, open: false }))

    const confirmarImpressao = async () => {
        try {
            setPrinting(true)
            const valores = await form.validateFields()
            const { tipo } = state
            const { imprimir_cod } = TIPOS[tipo]

            let url = `${fichaTomboUrl}/fichas/tombos/${hcf}/${imprimir_cod}?qtd=${valores.copias}`
            if (tipo === 'comCodigo') {
                url += `&code=${valores.codigoSelecionado}`
            }

            message.success('Impressão iniciada!')
            window.open(url, '_blank')
            fechar()
        } catch {
            message.error('Não foi possível iniciar a impressão.')
        } finally {
            setPrinting(false)
        }
    }

    const { tipo } = state
    const semCodigos = tipo === 'comCodigo' && (!codigos || !codigos.length)

    const modalContent = () => (
        <div style={{ display: 'grid', gap: 12 }}>
            <div>
                <strong>Tombo:</strong>
                {' '}
                {hcf ?? '-'}
            </div>

            <Form form={form} layout="vertical" initialValues={{ copias: 1 }}>
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
                        disabled={printing || semCodigos}
                    />
                </Form.Item>

                {tipo === 'comCodigo' && loadingCodigos && (
                    <Spin tip="Carregando códigos de barras..." />
                )}
                {tipo === 'comCodigo' && !loadingCodigos && codigos.length === 0 && (
                    <Alert
                        type="warning"
                        showIcon
                        message="Nenhum código de barras disponível para este tombo."
                    />
                )}
                {tipo === 'comCodigo' && !loadingCodigos && codigos.length > 0 && (
                    <Form.Item
                        name="codigoSelecionado"
                        label="Código de barras"
                        rules={[{ required: true, message: 'Selecione um código de barras' }]}
                    >
                        <Select
                            options={codigos.map(c => ({ value: c, label: c }))}
                            placeholder="Selecione o código"
                            showSearch
                            filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
                        />
                    </Form.Item>
                )}
            </Form>
        </div>
    )

    return (
        <div>
            {Object.entries(TIPOS).map(([key, config], index) => (
                <React.Fragment key={key}>
                    {index > 0 && <Divider type="vertical" />}
                    <Button
                        style={{ width: 'fit-content' }}
                        type="link"
                        icon={<PrinterOutlined style={{ color: config.color }} />}
                        onClick={() => abrirModalImpressao(key)}
                        title={config.title}
                    />
                </React.Fragment>
            ))}
            <Divider type="vertical" />

            <Modal
                title={TIPOS[tipo]?.label}
                open={state.open}
                onOk={semCodigos ? fechar : confirmarImpressao}
                onCancel={fechar}
                okText={semCodigos ? 'Cancelar' : 'Imprimir'}
                cancelText="Cancelar"
                cancelButtonProps={semCodigos ? { style: { display: 'none' } } : undefined}
                confirmLoading={printing}
                destroyOnClose
                maskClosable={false}
            >
                {modalContent()}
            </Modal>
        </div>
    )
}

export default FichaTomboActions
