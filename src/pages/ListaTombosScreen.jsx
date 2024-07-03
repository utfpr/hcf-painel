import { Component } from 'react'

import {
    Divider, Modal, Card, Row,
    Col, Select, Input, Button,
    notification, InputNumber, Collapse,
    Tag, Checkbox, Spin, DatePicker
} from 'antd'
import axios from 'axios'
import debounce from 'lodash.debounce'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { Form } from '@ant-design/compatible'
import {
    DeleteOutlined, EditOutlined, ExportOutlined, SearchOutlined
} from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { baseUrl } from '../config/api'
import { isCuradorOuOperador, isIdentificador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select
const { Panel } = Collapse

const columns = [
    {
        title: 'HCF',
        type: 'number',
        key: 'hcf',
        width: 100
    },
    {
        title: 'Nome popular',
        type: 'text',
        key: 'nomePopular',
        width: 200
    },
    {
        title: 'Nome científico',
        type: 'text',
        key: 'nomeCientifico',
        width: 200
    },
    {
        title: 'Data de coleta',
        type: 'text',
        key: 'data',
        width: 100
    },
    {
        title: 'Coletor',
        type: 'text',
        key: 'coletor',
        width: 200
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 120
    }
]

class ListaTombosScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tombos: [],
            metadados: {},
            loading: true,
            pagina: 1,
            data: [],
            value: [],
            fetching: false
        }
        this.lastFetchId = 0
        this.fetchUser = debounce(this.fetchUser, 800)
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/tombos/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaTombos(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir tombo', 'O tombo foi excluído com sucesso.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao excluir o tombo, tente novamente.')
                    }
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir este tombo?',
            content: 'Ao clicar em SIM, o tombo será excluído.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    componentDidMount() {
        this.requisitaListaTombos({}, this.state.pagina)
    }

    renderExcluir(id) {
        return (
            <div>
                <Divider type="vertical" />
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </div>
        )
    }

    renderEditar(id) {
        return (
            <div>
                <Divider type="vertical" />
                <Link to={`/tombos/${id}`}>
                    <EditOutlined style={{ color: '#FFCC00' }} />
                </Link>
            </div>
        )
    }

    renderDetalhes(id) {
        return (
            <Link to={`/tombos/detalhes/${id}`}>
                <SearchOutlined />
            </Link>
        )
    }

    gerarAcao(id) {
        if (isCuradorOuOperador()) {
            return [
                this.renderDetalhes(id),
                this.renderEditar(id),
                this.renderExcluir(id)
            ]
        }
        if (isIdentificador()) {
            return [
                this.renderDetalhes(id),
                this.renderEditar(id)
            ]
        }
        return this.renderDetalhes(id)
    }

    retornaDataColeta(dia, mes, ano) {
        if (dia == null && mes == null && ano == null) {
            return ''
        } if (dia != null && mes == null && ano == null) {
            return dia
        } if (dia == null && mes != null && ano == null) {
            return mes
        } if (dia == null && mes == null && ano != null) {
            return ano
        } if (dia != null && mes != null && ano == null) {
            return `${dia}/${mes}`
        } if (dia != null && mes == null && ano != null) {
            return `${dia}/${ano}`
        } if (dia == null && mes != null && ano != null) {
            return `${mes}/${ano}`
        } if (dia != null && mes != null && ano != null) {
            return `${dia}/${mes}/${ano}`
        }
    }

    formataDadosTombo = tombos => tombos.map(item => ({
        key: item.hcf,
        hcf: item.hcf,
        nomePopular: item?.nomes_populares,
        nomeCientifico: item?.nome_cientifico,
        data: this.retornaDataColeta(item?.data_coleta_dia, item?.data_coleta_mes, item?.data_coleta_ano),
        coletor: item?.coletore?.nome,
        acao: <div style={{ display: 'flex' }}>{this.gerarAcao(item.hcf)}</div>
    }))

    requisitaListaTombos = (valores, pg, pageSize) => {
        this.setState({
            loading: true
        })
        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const {
                nomeCientifico, numeroHcf, tipo, nomePopular, situacao
            } = valores

            if (nomeCientifico) {
                params.nome_cientifico = nomeCientifico
            }
            if (numeroHcf) {
                params.hcf = numeroHcf
            }
            if (tipo && tipo !== -1) {
                params.tipo = tipo
            }
            if (nomePopular) {
                params.nome_popular = nomePopular
            }
            if (situacao && situacao !== -1) {
                params.situacao = situacao
            }
        }
        axios.get('/tombos', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        tombos: this.formataDadosTombo(data.tombos),
                        metadados: data.metadados
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os tombos, tente novamente.')
                    }
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaTombos(valores, this.state.pagina)
        }
    }

    handleChangeTombo = value => {
        this.props.form.setFieldsValue({
            exTombos: value
        })
        this.setState({
            value,
            data: [],
            fetching: false
        })
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar tombo">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>HCF:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('numeroHcf')(
                                        <InputNumber
                                            initialValue={17}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Tipo:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('tipo')(
                                        <Select initialValue="2" placeholder="Selecione" allowClear>
                                            <Option value="-1">Selecione</Option>
                                            <Option value="1">Parátipo</Option>
                                            <Option value="2">Isótipo</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Situação:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('situacao')(
                                        <Select initialValue="2" placeholder="Selecione" allowClear>
                                            <Option value="-1">Selecione</Option>
                                            <Option value="regular">Regular</Option>
                                            <Option value="permutado">Permutado</Option>
                                            <Option value="emprestado">Emprestado</Option>
                                            <Option value="doado">Doado</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <br />
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome científico:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nomeCientifico')(
                                        <Input placeholder="Passiflora edulis" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome popular:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nomePopular')(
                                        <Input placeholder="Maracujá" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <br />

                    <Row align="middle" type="flex" justify="end" gutter={16}>
                        <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                            Foram encontrados
                            {' '}
                            {this.state.metadados?.total || 0}
                            {' '}
                            registros.
                        </Col>
                        <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                            <FormItem>
                                <Button
                                    onClick={() => {
                                        this.props.form.resetFields()
                                        this.setState({
                                            pagina: 1,
                                            valores: {},
                                            metadados: {},
                                            usuarios: []
                                        })
                                        this.requisitaListaTombos({}, 1)
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

                </Form>
            </Card>
        )
    }

    handleSubmitExport = event => {
        event.preventDefault()

        function ehCheckboxComValorValido([chave, valor]) {
            return valor === true && !chave.startsWith('inp_')
        }

        function extraiApenasChave([chave]) {
            return chave
        }

        function extraiChavesFiltros(valores) {
            let {
                inp_data_coleta_de: dataColetaDe,
                inp_data_coleta_ate: dataColetaAte,
                inp_ids: ids = []
            } = valores

            if (dataColetaDe) {
                dataColetaDe = moment(dataColetaDe)
                    .format('YYYY-MM-DD')
            }

            if (dataColetaAte) {
                dataColetaAte = moment(dataColetaAte)
                    .format('YYYY-MM-DD')
            }

            return {
                de: valores.inp_de,
                ate: valores.inp_ate,
                ids: ids.map(id => Number(id.key || id.label)),
                data_coleta: [dataColetaDe, dataColetaAte]
            }
        }

        const valores = this.props.form.getFieldsValue()
        const campos = Object.entries(valores)
            .filter(ehCheckboxComValorValido)
            .map(extraiApenasChave)

        if (campos.length < 1 || campos.length > 5) {
            this.openNotificationWithIcon('warning', 'Alerta', 'Selecione o mínimo de 1 e o máximo de 5 colunas para exportar.')
            return
        }

        const grupos = [
            (!!valores.inp_de && !!valores.inp_ate),
            (!!valores.inp_ids),
            (!!valores.inp_data_coleta_de && !!valores.inp_data_coleta_ate)
        ].filter(item => item === true)

        if (grupos.length === 0) {
            this.openNotificationWithIcon('warning', 'Alerta', 'Informe um período, tombos específicos ou período de datas para exportar')
            return
        }

        if (grupos.length > 1) {
            this.openNotificationWithIcon('warning', 'Alerta', 'A exportação dos dados deve ser feita por um período, tombos específicos ou período de datas, nunca utilizando dois ou mais')
            return
        }

        const f = extraiChavesFiltros(valores)
        const filtros = Object.entries(f)
            .filter(entrada => {
                const [, valor] = entrada

                if (Array.isArray(valor)) {
                    return valor.filter(item => !!item).length > 0
                }
                return !!valor
            })
            .reduce((filtros, [chave, valor]) => ({ ...filtros, [chave]: valor }), {})

        const url = `${baseUrl}/tombos/exportar?campos=${JSON.stringify(campos)}&filtros=${JSON.stringify(filtros)}`
        window.open(url, '_blank')
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    fetchUser = value => {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.setState({ data: [], fetching: true })
        axios.get(`/tombos/filtrar_numero/${value}`)
            .then(response => {
                if (response.status === 200) {
                    if (fetchId !== this.lastFetchId) { // for fetch callback order
                        return
                    }
                    const data = response.data.map(item => ({
                        text: `${item.hcf}`,
                        value: item.hcf
                    }))
                    this.setState({ data, fetching: false })
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    renderExportar(getFieldDecorator) {
        const { fetching, data } = this.state

        return (
            <Form onSubmit={this.handleSubmitExport}>
                <Collapse accordion>
                    <Panel header="Selecione os campos a serem exportados:" key="1">

                        <Row gutter={8}>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('hcf')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="red">HCF</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('data_coleta')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="magenta">Data da Coleta</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('familia')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="red">Família</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('subfamilia')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="green">Subfamília</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('genero')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="red">Gênero</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('especie')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="blue">Espécie</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('subespecie')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="blue">Subespécie</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('variedade')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="red">Variedade</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('sequencia')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="gold">Sequencia do tombo</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={6} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('codigo_barra')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="gold">Codigo de barra</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('latitude')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="purple">Latitude</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('longitude')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="green">Longitude</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('altitude')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="green">Altitude</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('numero_coleta')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="volcano">Nº Coleta</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                                <FormItem>
                                    {getFieldDecorator('coletores')(
                                        <Checkbox>
                                            {' '}
                                            <Tag color="geekblue">Coletores</Tag>
                                        </Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Divider dashed />
                        <Row gutter={8}>
                            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                                <Col span={24}>
                                    <span>A partir de:</span>
                                </Col>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('inp_de')(
                                            <InputNumber
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                                <Col span={24}>
                                    <span>Até:</span>
                                </Col>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('inp_ate')(
                                            <InputNumber
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <br />
                        <Row gutter={8} type="flex" justify="center">
                            <span>OU</span>
                        </Row>
                        <Row gutter={8} style={{ marginTop: '20px' }}>
                            <Col span={24}>
                                <Col span={24}>
                                    <span>Numeros dos tombos a serem exportados:</span>
                                </Col>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('inp_ids')(
                                            <Select
                                                mode="multiple"
                                                labelInValue
                                                placeholder=""
                                                notFoundContent={fetching ? <Spin size="small" /> : null}
                                                filterOption={false}
                                                onSearch={this.fetchUser}
                                                onChange={this.handleChangeTombo}
                                                style={{ width: '100%' }}
                                            >
                                                {data.map(d => <Option key={d.value}>{d.text}</Option>)}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <br />
                        <Row gutter={8} type="flex" justify="center">
                            <span>OU</span>
                        </Row>
                        <br />
                        <Row gutter={8}>
                            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                                <Col span={24}>
                                    <span>A partir da data de tombo:</span>
                                </Col>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('inp_data_coleta_de')(
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                placeholder="Seleciona a data de tombo inicial"
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                                <Col span={24}>
                                    <span>Até a data de tombo:</span>
                                </Col>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('inp_data_coleta_ate')(
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                placeholder="Seleciona a data de tombo final"
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Divider dashed />
                        <Row gutter={8} type="flex" justify="end">
                            <Button
                                type="primary"
                                icon={<ExportOutlined />}
                                htmlType="submit"
                                style={{ backgroundColor: '#FF7F00', borderColor: '#FF7F00' }}
                            >
                                Exportar
                            </Button>
                        </Row>
                    </Panel>
                </Collapse>

            </Form>
        )
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <HeaderListComponent title="Tombos" link="/tombos/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.tombos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaTombos(this.state.valores, pg, pageSize)
                    }}
                />
                <Divider dashed />
                {this.renderExportar(getFieldDecorator)}
            </div>
        )
    }
}
export default Form.create()(ListaTombosScreen)
