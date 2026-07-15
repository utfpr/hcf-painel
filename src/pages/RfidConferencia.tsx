import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Row,
    Col,
    Divider,
    Card,
    Button,
    notification,
    Table,
    Tag,
    Input,
    Select,
    Form
} from 'antd'
import { SearchOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'
import moment from 'moment'

const { Option } = Select

const formatarDataHora = (data?: string) => (data ? moment(data).format('DD/MM/YYYY HH:mm:ss') : '-')

const RfidConferencia: React.FC = () => {
    const [form] = Form.useForm()
  const { t } = useTranslation('rfid')
    
    const [dados, setDados] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [paginacao, setPaginacao] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    })

    const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
        notification[type]({
            message: titulo,
            description: descricao,
            placement: 'topRight'
        })
    }

    const requisitaDados = useCallback(async (pagina = 1, limite = 20, filtros = {}) => {
        setLoading(true)
        
        try {
            const response = await axios.get('/rfids', {
                params: {
                    pagina,
                    limite,
                    ...filtros
                }
            })

            if (response.status === 200) {
                const { dados, meta } = response.data
                
                setDados(dados)
                setPaginacao({
                    current: meta.pagina,
                    pageSize: meta.limite,
                    total: meta.total
                })
            }

        } catch (error) {
            notificacao('error', t('common.error'), t('notifications.conferenceFetchFailure'))
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        requisitaDados(1, 20)
    }, [requisitaDados])

    const handleTableChange = (pagination: any) => {
        const filtrosAtuais = form.getFieldsValue()
        requisitaDados(pagination.current, pagination.pageSize, filtrosAtuais)
    }

    const onFinish = (valores: any) => {
        requisitaDados(1, paginacao.pageSize, valores)
    }

    const limparFiltros = () => {
        form.resetFields()
        requisitaDados(1, 20, {})
    }

    const columns = [
        {
            title: t('conference.id'),
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: t('conference.tombo'),
            key: 'tombo_hcf',
            render: (text: any, record: any) => record.tombos_foto?.tombo_hcf || '-'
        },
        {
            title: t('conference.barcode'),
            key: 'codigo_barra',
            render: (text: any, record: any) => record.tombos_foto?.codigo_barra || '-'
        },
        {
            title: 'EPC',
            dataIndex: 'epc',
            key: 'epc',
        },
        {
            title: 'TID',
            dataIndex: 'tid',
            key: 'tid',
            render: (text: string) => text ? text : <span style={{ color: '#ccc' }}>N/A</span>
        },

        {
            title: t('conference.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: (data: string) => formatarDataHora(data),
        },

        {
            title: t('conference.updatedAt'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (data: string) => formatarDataHora(data),
        },

        {
            title: t('conference.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = status === 'CONCLUIDO' ? 'green' : status === 'FALHA' ? 'red' : 'default'
                return <Tag color={color}>{status}</Tag>
            }
        }
    ]

    return (
        <div style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={18}>
                    <h2 style={{ fontWeight: 200, margin: 0 }}>{t('conference.title')}</h2>
                </Col>
                <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => requisitaDados(paginacao.current, paginacao.pageSize, form.getFieldsValue())}
                        loading={loading}
                    >
                        {t('common.update')}
                    </Button>
                </Col>
            </Row>
            
            <Divider dashed />

            <Card title={t('conference.filtersTitle')} bordered={false} style={{ marginBottom: '24px' }}>
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="tombo_hcf" label={t('conference.tombo')}>
                                <Input placeholder={t('conference.searchTombo')} allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="codigo_barra" label={t('conference.barcode')}>
                                <Input placeholder={t('conference.searchBarcode')} allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="epc" label="EPC">
                                <Input placeholder={t('conference.searchEpc')} allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="status" label={t('conference.statusReading')}>
                                <Select placeholder={t('common.all')} allowClear>
                                    <Option value="CONCLUIDO">{t('conference.completed')}</Option>
                                    <Option value="FALHA">{t('conference.failed')}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row justify="end" gutter={16} style={{ marginTop: 8 }}>
                        <Col>
                            <Button icon={<ClearOutlined />} onClick={limparFiltros}>
                                {t('common.clear')}
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                {t('common.search')}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={dados}
                    rowKey="id"
                    pagination={{
                        ...paginacao,
                        showSizeChanger: true,
                        showTotal: (total, range) => t('conference.totalRecords', { start: range[0], end: range[1], total })
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    bordered
                    size="middle"
                />
            </Card>
        </div>
    )
}

export default RfidConferencia
