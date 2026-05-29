import React, { useState, useEffect, useCallback } from 'react'
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

const { Option } = Select

const RfidConferencia: React.FC = () => {
    const [form] = Form.useForm()
    
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
            notificacao('error', 'Erro', 'Falha ao buscar os dados da conferência.')
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
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tombo',
            key: 'tombo_hcf',
            render: (text: any, record: any) => record.tombos_foto?.tombo_hcf || '-'
        },
        {
            title: 'Codigo de Barras',
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
            title: 'Status',
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
                    <h2 style={{ fontWeight: 200, margin: 0 }}>Conferência RFID</h2>
                </Col>
                <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => requisitaDados(paginacao.current, paginacao.pageSize, form.getFieldsValue())}
                        loading={loading}
                    >
                        Atualizar
                    </Button>
                </Col>
            </Row>
            
            <Divider dashed />

            <Card title="Filtros da Conferência" bordered={false} style={{ marginBottom: '24px' }}>
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="tombo_hcf" label="Tombo HCF">
                                <Input placeholder="Buscar por Tombo..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="codigo_barra" label="Código de Barras">
                                <Input placeholder="Buscar por Cód. Barras..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="epc" label="Código EPC">
                                <Input placeholder="Buscar por EPC..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="status" label="Status da Leitura">
                                <Select placeholder="Todos" allowClear>
                                    <Option value="CONCLUIDO">Concluído</Option>
                                    <Option value="FALHA">Falha</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row justify="end" gutter={16} style={{ marginTop: 8 }}>
                        <Col>
                            <Button icon={<ClearOutlined />} onClick={limparFiltros}>
                                Limpar
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                Pesquisar
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
                        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`
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
