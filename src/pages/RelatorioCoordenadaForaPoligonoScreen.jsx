import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin, Table, Tag,
    Checkbox, Collapse
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Panel } = Collapse

class RelatorioCoordenadaForaPoligonoScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            loading: false,
            incluirSemCoordenadas: false
        }
    }

    componentDidMount() {
        this.requisitaDadosDoRelatorio()
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaDadosDoRelatorio = () => {
        this.setState({ loading: true })
        const params = {
            incluirSemCoordenadas: this.state.incluirSemCoordenadas,
            pagina: 1,
            limite: 99999
        }

        axios.get('/relatorio/coordenadas-fora-poligono', { params })
            .then(response => {
                this.setState({ loading: false })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        dados: data.resultado,
                        metadados: data.metadados
                    })
                } else {
                    this.notificacao('error', 'Erro', 'Erro ao buscar os dados do relatório.')
                }
            })
            .catch(() => {
                this.setState({ loading: false })
                this.notificacao('error', 'Erro', 'Falha ao buscar dados do relatório.')
            })
    }

    renderMotivo = motivo => {
        switch (motivo) {
            case 'SEM_COORDENADA':
                return <Tag color="orange">Sem coordenada</Tag>
            case 'SEM_POLIGONO':
                return <Tag color="blue">Sem polígono</Tag>
            case 'FORA_DO_POLIGONO':
                return <Tag color="red">Fora do polígono</Tag>
            default:
                return <Tag>{motivo}</Tag>
        }
    }

    handleSubmit = (err) => {
        if (!err) {
            this.requisitaDadosDoRelatorio()
        }
    }

    onSubmit = event => {
        event.preventDefault()
        const { form } = this.props
        form.validateFields(this.handleSubmit)
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <Card title="Filtros do relatório">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('incluirSemCoordenadas')(
                                        <Checkbox
                                            onChange={e => {
                                                this.setState({ incluirSemCoordenadas: e.target.checked })
                                            }}
                                        >
                                            Incluir tombos sem coordenadas
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    <TotalRecordFound
                                        total={this.state.metadados?.total}
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                const { form } = this.props
                                                form.resetFields()
                                                this.setState({
                                                    incluirSemCoordenadas: false
                                                }, () => {
                                                    this.requisitaDadosDoRelatorio()
                                                })
                                            }}
                                            className="login-form-button"
                                        >
                                            Limpar
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button"
                                        >
                                            Pesquisar
                                        </Button>
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Card>
        )
    }

    renderTabelaTombos(tombos) {
        const columns = [
            {
                title: 'HCF',
                dataIndex: 'hcf',
                key: 'hcf',
                sorter: (a, b) => a.hcf - b.hcf
            },
            {
                title: 'Nome Científico',
                dataIndex: 'nome_cientifico',
                key: 'nome_cientifico',
                ellipsis: true
            },
            {
                title: 'Latitude',
                dataIndex: 'latitude',
                key: 'latitude',
                render: val => (val !== null && val !== undefined ? val.toFixed(6) : '—')
            },
            {
                title: 'Longitude',
                dataIndex: 'longitude',
                key: 'longitude',
                render: val => (val !== null && val !== undefined ? val.toFixed(6) : '—')
            },
            {
                title: 'Motivo',
                dataIndex: 'motivo',
                key: 'motivo',
                render: motivo => this.renderMotivo(motivo),
                filters: [
                    { text: 'Fora do polígono', value: 'FORA_DO_POLIGONO' },
                    { text: 'Sem coordenada', value: 'SEM_COORDENADA' },
                    { text: 'Sem polígono', value: 'SEM_POLIGONO' }
                ],
                onFilter: (value, record) => record.motivo === value
            }
        ]

        return (
            <Table
                columns={columns}
                dataSource={tombos.map(t => ({ ...t, key: t.hcf }))}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: true }}
            />
        )
    }

    renderResultados() {
        const { dados, loading } = this.state

        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                </div>
            )
        }

        if (!dados || dados.length === 0) {
            return (
                <Card>
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        Nenhum registro encontrado.
                    </p>
                </Card>
            )
        }

        return (
            <Collapse accordion={false} defaultActiveKey={[]}>
                {dados.map(estado => (
                    <Panel
                        header={`${estado.estado} (${estado.sigla})`}
                        key={estado.estado}
                        extra={
                            <Tag>
                                {estado.cidades.reduce((acc, c) => acc + c.tombos.length, 0)}
                                {' '}
                                tombo(s)
                            </Tag>
                        }
                    >
                        <Collapse accordion={false} defaultActiveKey={[]}>
                            {estado.cidades.map(cidade => (
                                <Panel
                                    header={cidade.cidade}
                                    key={`${estado.estado}-${cidade.cidade}`}
                                    extra={
                                        <Tag>{cidade.tombos.length} tombo(s)</Tag>
                                    }
                                >
                                    {this.renderTabelaTombos(cidade.tombos)}
                                </Panel>
                            ))}
                        </Collapse>
                    </Panel>
                ))}
            </Collapse>
        )
    }

    renderFormulario() {
        return (
            <div>
                <Row
                    gutter={24}
                    style={{
                        marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                >
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>Relatório de Coordenadas Fora do Polígono</h2>
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca()}
                <Divider dashed />

                {this.renderResultados()}
                <Divider dashed />
            </div>
        )
    }

    render() {
        return (
            this.renderFormulario()
        )
    }
}

export default Form.create()(RelatorioCoordenadaForaPoligonoScreen)
