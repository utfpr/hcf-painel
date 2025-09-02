import { Component } from 'react'

import {
    Row,
    Col,
    Divider,
    notification,
    Spin,
    Button
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { isCuradorOuOperadorOuIdentificador } from '@/helpers/usuarios'

import GalleryComponent from '../components/GalleryComponent'
import LeafletMap from '../components/LeafletMap'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'
import decimalParaGrausMinutosSegundos from '../helpers/conversoes/Coordenadas'
import fotosTomboMap from '../helpers/fotos-tombo-map'

export default class DetalhesTomboScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            nomesColetores: ''
        }
        this.reinosRef = { current: { promise: null, data: null, error: null } }
    }

    componentDidMount() {
        if (this.props.match.params.tombo_id !== undefined) {
            this.requisitaTombo()
            this.requisitaReinos()
            this.setState({
                loading: true
            })
        }
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    requisitaTombo = () => {
        axios.get(`/tombos/${this.props.match.params.tombo_id}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        tombo: response.data
                    })
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao buscar os dados do tombo, tente novamente.'
                    )
                }

                if (response.data.coletor) {
                    this.setState({
                        nomesColetores: response.data.coletor.nome
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaReinos = () => {
        if (!this.reinosRef) {
            this.reinosRef = { current: { promise: null, data: null, error: null } }
        }
        if (this.reinosRef.current.promise) {
            return this.reinosRef.current.promise
        }

        const promise = axios
            .get('/reinos')
            .then(({ status, data }) => {
                if (status !== 200) throw new Error('Falha ao buscar reinos')

                const reinos = data?.resultado ?? []
                this.reinosRef.current.data = reinos

                return reinos
            })
            .catch(err => {
                this.reinosRef.current.promise = null
                this.reinosRef.current.data = null
                this.reinosRef.current.error = err

                this.openNotificationWithIcon('error', 'Erro', 'Falha ao buscar reinos.')
                throw err
            })

        this.reinosRef.current.promise = promise
        return promise
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    renderMainCharacteristics() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    {isCuradorOuOperadorOuIdentificador()
                        ? (
                            <Link to={`/tombos/${this.props.match.params.tombo_id}`}>
                                <Button type="primary">
                                    Editar Tombo
                                </Button>
                            </Link>
                        )
                        : null}
                    <Row gutter={8} style={{ margin: '20px 0' }}>

                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Número de tombo:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.hcf}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Nome popular:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.nome_popular}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Herbário:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.herbario}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Número da coleta:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.numero_coleta}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Data de coleta:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.data_coleta}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Data de tombo:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {formatarDataBDtoDataHora(tombo.data_tombo)}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={16} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Nome científico:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.nome_cientifico}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Tipo:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.tipo}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Tipo da exsicata:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {this.getExsicataTipo()}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    getExsicataTipo = () => {
        const { tombo } = this.state

        switch (tombo.unicata) {
            case true:
                return 'Unicata'
            case false:
                return 'Duplicata'
            default:
                return 'Não especificado'
        }
    }

    renderFamily() {
        const { tombo } = this.state
        const reinoIdTombo = tombo.familias?.[0]?.reino_id
        const reinoEncontrado = this.reinosRef.current.data.find(
            reino => reino.id === reinoIdTombo
        )

        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4> Reino:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {reinoEncontrado.nome}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4> Família:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.familia}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Subfamília:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.sub_familia}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Gênero:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.genero}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Espécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.especie.nome}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Subespécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.sub_especie.nome}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Variedade:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.variedade.nome}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Autor espécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.especie.autor}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Autor subespécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.sub_especie.autor}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Autor variedade:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.taxonomia.variedade.autor}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderLocal() {
        const { tombo } = this.state
        if (tombo) {
            console.log('kokoko')
            console.log(tombo.localizacao.longitude_graus)
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Latitude: (datum wgs84)</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.latitude ? decimalParaGrausMinutosSegundos(tombo.localizacao.latitude, false, true) : ''}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Longitude: (datum wgs84)</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.longitude ? decimalParaGrausMinutosSegundos(tombo.localizacao.longitude, true, true) : ''}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Altitude:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.altitude}
                                    m
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Cidade:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.cidade}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Estado:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.estado}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>País:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.localizacao.pais}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderGround() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Solo:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.solo}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Relevo:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.relevo}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Vegetação:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.vegetacao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Fase sucessional:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.fase_sucessional.nome}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Local de Coleta:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.descricao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Descrição:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.descricao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderCollectors() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Coletores:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {this.state.nomesColetores}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderComments() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Observações:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.observacao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderIdentificador() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Identificador:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.identificador_nome != null ? tombo.identificador_nome : ''}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>Data de identificação:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.data_identificacao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderColecoesAnexas() {
        const { tombo } = this.state
        if (tombo) {
            return (
                <div>
                    <Row gutter={24} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col style={{ padding: 0 }}>
                                <h4>Coleções Anexas:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.colecao_anexa.tipo}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col style={{ padding: 0 }}>
                                <h4>Observações da coleção anexa:</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.colecao_anexa.observacao}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        }
    }

    renderConteudo() {
        const { tombo } = this.state
        if (!tombo) {
            return null
        }
        const fotoNula = [{
            original: '/not-found.jpg',
            thumbnail: '/not-found.jpg'
        }]

        const fotos = tombo.fotos.length === 0 ? fotoNula : tombo.fotos.map(fotosTomboMap)

        return (
            <div>
                <Row type="flex" justify="center">
                    <Col span={12}>
                        <GalleryComponent fotos={fotos} />
                    </Col>
                </Row>
                <Divider dashed />
                {this.renderMainCharacteristics()}
                <Divider dashed />
                {this.renderFamily()}
                <Divider dashed />
                {this.renderLocal()}
                <Divider dashed />
                {this.renderGround()}
                <Divider dashed />
                {this.renderCollectors()}
                <Divider dashed />
                {this.renderIdentificador()}
                <Divider dashed />
                {this.renderColecoesAnexas()}
                <Divider dashed />
                {this.renderComments()}
                <Divider dashed />

                <LeafletMap
                    lat={tombo.localizacao.latitude}
                    lng={tombo.localizacao.longitude}
                    hcf={tombo.hcf}
                />
            </div>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderConteudo()}
                </Spin>
            )
        }
        return (
            this.renderConteudo()
        )
    }
}
