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
import { useTranslation } from 'react-i18next'

import { fichaTomboUrl } from '../../../config/api'
import { requisitaCodigoBarrasService } from '../TomboService'

const buildTipos = t => ({
    comCodigo: {
        label: t('printSheetWithCode'),
        title: t('printSheetWithCodeTitle'),
        color: '#277a01',
        imprimir_cod: 1
    },
    semCodigo: {
        label: t('printSheetWithoutCode'),
        title: t('printSheetWithoutCodeTitle'),
        color: '#0066ff',
        imprimir_cod: 0
    },
    reduzida: {
        label: t('printReducedSheet'),
        title: t('printReducedSheetTitle'),
        color: '#e67e00',
        imprimir_cod: 2
    }
})

const FichaTomboActions = ({ hcf }) => {
    const { t } = useTranslation('tombo')
    const TIPOS = buildTipos(t)
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
                await requisitaCodigoBarrasService(
                    resp => {
                        response = resp
                    },
                    hcf
                )
                const lista = response?.data?.map(c => c.codigo_barra) ?? []
                setCodigos(lista)
                if (lista.length > 0) {
                    form.setFieldsValue({ codigoSelecionado: lista[0] })
                }
            } catch {
                message.error(t('loadBarcodesError'))
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

            message.success(t('printStarted'))
            window.open(url, '_blank')
            fechar()
        } catch {
            message.error(t('printStartError'))
        } finally {
            setPrinting(false)
        }
    }

    const { tipo } = state
    const semCodigos = tipo === 'comCodigo' && (!codigos || !codigos.length)

    const modalContent = () => (
        <div style={{ display: 'grid', gap: 12 }}>
            <div>
                <strong>{t('tomboLabel')}</strong>
                {' '}
                {hcf ?? '-'}
            </div>

            <Form form={form} layout="vertical" initialValues={{ copias: 1 }}>
                <Form.Item
                    name="copias"
                    label={t('copiesQuantity')}
                    rules={[
                        { required: true, message: t('informCopies') },
                        {
                            validator: (_, v) => (v >= 1 && v <= 3
                                ? Promise.resolve()
                                : Promise.reject(new Error(t('allow1to3'))))
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
                    <Spin tip={t('loadingBarcodes')} />
                )}
                {tipo === 'comCodigo' && !loadingCodigos && codigos.length === 0 && (
                    <Alert
                        type="warning"
                        showIcon
                        message={t('noBarcodeAvailableForTombo')}
                    />
                )}
                {tipo === 'comCodigo' && !loadingCodigos && codigos.length > 0 && (
                    <Form.Item
                        name="codigoSelecionado"
                        label={t('selectBarcode')}
                        rules={[{ required: true, message: t('selectBarcodeRequired') }]}
                    >
                        <Select
                            options={codigos.map(c => ({ value: c, label: c }))}
                            placeholder={t('selectCode')}
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
                okText={semCodigos ? t('common:cancelar', { ns: 'common' }) : t('print')}
                cancelText={t('common:cancelar', { ns: 'common' })}
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
