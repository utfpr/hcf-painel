import React from 'react'

import {
    Divider, Card, Row, Col, Input, Button, notification, Form, Select
} from 'antd'

import CoordenadaInputText from '@/components/CoordenadaInputText'
import ModalCadastroComponent from '@/components/ModalCadastroComponent'
import SimpleTableComponent from '@/components/SimpleTableComponent'
import converteDecimalParaGrausMinutosSegundos from '@/helpers/conversoes/Coordenadas'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next'

const { Option } = Select

const CidadesComponent = ({
    t,
    form,
    cidades,
    estados,
    paises,
    estadosFiltrados,
    setEstadosFiltrados,
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

    const formattedCidades = (cidades || []).map(item => ({
        ...item,
        key: item.id,
        estadoNome: item.estado?.nome || '-',
        latitude: converteDecimalParaGrausMinutosSegundos(item.latitude, false, true),
        longitude: converteDecimalParaGrausMinutosSegundos(item.longitude, true, true),
        acao: renderActionButtons(item)
    }))

    const columns = [
        { title: t('cidadeComponent:colunaCidade'), dataIndex: 'nome', key: 'nome' },
        { title: t('cidadeComponent:colunaEstado'), dataIndex: 'estadoNome', key: 'estadoNome' },
        { title: t('cidadeComponent:colunaLatitude'), dataIndex: 'latitude', key: 'latitude' },
        { title: t('cidadeComponent:colunaLongitude'), dataIndex: 'longitude', key: 'longitude' },
        { title: t('cidadeComponent:colunaAcao'), key: 'acao' }
    ]

    const finalColumns = isCuradorOuOperador
        ? columns
        : columns.filter(col => col.key !== 'acao')

    const handleSearch = () => {
        const valores = form.getFieldsValue()
        onBusca(valores)
    }

    const handleBusca = valores => {
        // eslint-disable-next-line no-undef
        const filtradas = cidadesOriginais.filter(c =>
            (!valores.nome || c.nome.toLowerCase().includes(valores.nome.toLowerCase()))
            && (!valores.estadoId || c.estado_id === parseInt(valores.estadoId))
            && (!valores.paisId || c.estado?.pais_id === parseInt(valores.paisId))
        )

        // eslint-disable-next-line no-undef
        setPagina(1)
        // eslint-disable-next-line no-undef
        atualizaPagina(1, pageSize, filtradas)
    }

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields()

            const latitude = values.latitude
            const longitude = values.longitude

            const isLatitudeValida = latitude >= -90 && latitude <= 90
            const isLongitudeValida = longitude >= -180 && longitude <= 180

            if (!isLatitudeValida || !isLongitudeValida) {
                notification.error({
                    message: t('cidadeComponent:erroValidacaoCoordenadas'),
                    description: t('cidadeComponent:descricaoErroValidacaoCoordenadas')
                })
                return
            }

            if (values.nomeCidade && values.nomeCidade.trim() !== '') {
                onSalvar({
                    nome: values.nomeCidade,
                    estado_id: values.estadoId,
                    latitude: latitude,
                    longitude: longitude
                })
            }
        } catch {
            notification.warning({
                message: t('common:tituloFalha'),
                description: t('cidadeComponent:preencherCamposObrigatorios')
            })
        }
    }

    return (
        <div>
            <Row gutter={24} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                    <h2 style={{ fontWeight: 200 }}>{t('cidadeComponent:cidades')}</h2>
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
            <Card title={t('cidadeComponent:buscarCidade')}>
                <Form form={form} onFinish={handleSearch}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{t('cidadeComponent:buscarNomeCidade')}</span></Col>
                            <Col span={24}>
                                <Form.Item name="nome">
                                    <Input placeholder={t('cidadeComponent:placeholderNomeCidade')} type="text" />
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{t('cidadeComponent:buscarPais')}</span></Col>
                            <Col span={24}>
                                <Form.Item name="paisId">
                                    <Select
                                        showSearch
                                        placeholder={t('cidadeComponent:placeholderSelecionarPais')}
                                        onChange={paisId => {
                                            form.setFieldsValue({ estadoId: undefined })
                                            const novosEstados = estados.filter(e => e.pais_id === paisId)
                                            setEstadosFiltrados(novosEstados)
                                        }}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                                    >
                                        {paises.map(pais => (
                                            <Option key={pais.id} value={pais.id}>{pais.nome}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{t('cidadeComponent:buscarEstado')}</span></Col>
                            <Col span={24}>
                                <Form.Item name="estadoId">
                                    <Select
                                        showSearch
                                        placeholder={form.getFieldValue('paisId') ? t('cidadeComponent:placeholderSelecionarEstado') : t('cidadeComponent:placeholderSelecionarPaisPrimeiro')}
                                        disabled={!form.getFieldValue('paisId')}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                                    >
                                        {estadosFiltrados.map(estado => (
                                            <Option key={estado.id} value={estado.id}>{estado.nome}</Option>
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
                data={formattedCidades}
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
                            <Form.Item label={t('cidadeComponent:cadastroNomeCidade')} name="nomeCidade" rules={[{ required: true, message: t('cidadeComponent:validacaoInformarCidade') }]}>
                                <Input placeholder={t('cidadeComponent:placeholderNomeCidade')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <Form.Item
                                label={t('cidadeComponent:cadastroEstado')}
                                name="estadoId"
                                rules={[{ required: true, message: t('cidadeComponent:validacaoInformarEstado') }]}
                            >
                                <Select
                                    showSearch
                                    placeholder={t('cidadeComponent:placeholderSelecionarEstadoCadastro')}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())}
                                >
                                    {estados.map(estado => (
                                        <Option key={estado.id} value={`${estado.id}`}>
                                            {estado.nome}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item label={t('cidadeComponent:cadastroLatitude')} name="latitude">
                                <CoordenadaInputText longitude={false} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item label={t('cidadeComponent:cadastroLongitude')} name="longitude">
                                <CoordenadaInputText longitude />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </ModalCadastroComponent>
        </div>
    )
}

export default withTranslation()(CidadesComponent)