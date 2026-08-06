import React from 'react'

import {
    Divider, Card, Row, Col, Input, Button, notification, Form, Select
} from 'antd'

import ModalCadastroComponent from '@/components/ModalCadastroComponent'
import SimpleTableComponent from '@/components/SimpleTableComponent'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next'


const ListaEstadosComponent = ({
    t,
    form,
    estados,
    paises,
    metadados,
    loading,
    visibleModal,
    loadingModal,
    tituloModal,
    onBusca,
    onLimparBusca,
    onTabelaChange,
    onExcluir,
    onAbrirModal,
    onFecharModal,
    onSalvar,
    isCuradorOuOperador
}) => {
    const renderActionButtons = item => {
        if (!isCuradorOuOperador) return null
        return (
            <span>
                <a onClick={() => onAbrirModal(item)}>
                    <EditOutlined style={{ color: '#FFCC00' }} />
                </a>
                <Divider type="vertical" />
                <a onClick={() => onExcluir(item.id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    const formattedEstados = (estados || []).map(item => ({
        ...item,
        key: item.id,
        paisNome: item.pais?.nome || '-',
        acao: renderActionButtons(item)
    }))

    const columns = [
        { title: t('estadoComponent:colunaEstado'), dataIndex: 'nome', key: 'nome' },
        { title: t('estadoComponent:colunaSigla'), dataIndex: 'sigla', key: 'sigla' },
        { title: t('estadoComponent:colunaPais'), dataIndex: 'paisNome', key: 'paisNome' },
        { title: t('estadoComponent:colunaAcao'), key: 'acao' }
    ]

    const finalColumns = isCuradorOuOperador
        ? columns
        : columns.filter(col => col.key !== 'acao')

    const handleSearch = () => {
        const valores = form.getFieldsValue()
        onBusca(valores)
    }

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields()
            if (values.nomeEstado && values.nomeEstado.trim() !== '') {
                onSalvar({
                    nome: values.nomeEstado,
                    sigla: values.ufEstado,
                    pais_id: parseInt(values.paisId, 10)
                })
            }
        } catch {
            notification.warning({
                message: t('common:tituloFalha'),
                description: t('estadoComponent: preencherCamposObrigatorios')
            })
        }
    }

    return (
        <div>
            <Row gutter={24} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                    <h2 style={{ fontWeight: 200 }}>{t('estadoComponent:estados')}</h2>
                </Col>
                <Col xs={24} sm={10} md={6} lg={4} xl={4}>
                    {isCuradorOuOperador && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => onAbrirModal()}
                            style={{
                                backgroundColor: '#5CB85C',
                                borderColor: '#5CB85C',
                                width: '100%'
                            }}
                        >
                            {t('common:adicionar')}
                        </Button>
                    )}
                </Col>
            </Row>
            <Divider dashed />
            <Card title={t('estadoComponent:buscarEstado')}>
                <Form form={form} onFinish={handleSearch}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}><span>{t('estadoComponent:buscarNomeEstado')}:</span></Col>
                            <Col span={24}>
                                <Form.Item name="nome">
                                    <Input placeholder={t('estadoComponent:placeholderNomeEstado')} type="text" />
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}><span>{t('estadoComponent:buscarPais')}:</span></Col>
                            <Col span={24}>
                                <Form.Item name="paisId">
                                    <Select
                                        showSearch
                                        placeholder={t('estadoComponent:placeholderSelecionarPais')}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                                    >
                                        {paises.map(pais => (
                                            <Select.Option key={pais.id} value={pais.id}>
                                                {pais.nome}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row justify="end" align="middle" gutter={16}>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <Form.Item>
                                        <Button
                                            onClick={onLimparBusca}
                                            className="login-form-button"
                                        >
                                            {t('common:limpar')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button ant-btn-pesquisar"
                                        >
                                            {t('common:pesquisar')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Divider dashed />
            <SimpleTableComponent
                columns={finalColumns}
                data={formattedEstados}
                metadados={metadados}
                loading={loading}
                changePage={onTabelaChange}
            />
            <Divider dashed />
            <ModalCadastroComponent
                title={tituloModal}
                visibleModal={visibleModal}
                loadingModal={loadingModal}
                onCancel={onFecharModal}
                onOk={handleModalOk}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={8}>
                        <Col span={24}>
                            <Form.Item label={t('estadoComponent:cadastroNomeEstado')} name="nomeEstado" rules={[{ required: true, message: t('estadoComponent:validacaoInformarEstado') }]}>
                                <Input placeholder={t('estadoComponent:placeholderNomeEstado')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <Form.Item
                                label={t('estadoComponent:cadastroSigla')}
                                name="ufEstado"
                                rules={[
                                    { required: true, message: t('estadoComponent:validacaoInformarSigla') },
                                    { pattern: /^[A-Za-z]+$/, message: t('estadoComponent:validacaoApenasLetras') }
                                ]}
                            >
                                <Input maxLength={3} placeholder={t('estadoComponent:placeholderSigla')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <Form.Item
                                label={t('estadoComponent:cadastroPais')}
                                name="paisId"
                                rules={[{ required: true, message: t('estadoComponent:validacaoInformarPais') }]}
                            >
                                <Select
                                    showSearch
                                    placeholder={t('estadoComponent:placeholderSelecionarPais')}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                                >
                                    {paises.map(pais => (
                                        <Select.Option key={pais.id} value={pais.id}>
                                            {pais.nome}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </ModalCadastroComponent>
        </div>
    )
}

export default withTranslation()(ListaEstadosComponent)
