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
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { isCuradorOuOperadorOuIdentificador } from '@/helpers/usuarios'

import GalleryComponent from '../components/GalleryComponent'
import LeafletMap from '../components/LeafletMap'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'
import decimalParaGrausMinutosSegundos from '../helpers/conversoes/Coordenadas'
import fotosTomboMap from '../helpers/fotos-tombo-map'
import { verificarCoordenada } from './tombos/TomboService'

class DetalhesTomboScreen extends Component {
    tTombo = (key, options) => this.props.t(`tombo:${key}`, options)

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
                    this.setState({ loading: false })
                    this.openNotificationWithIcon(
                        'error',
                        this.props.t('common:tituloFalha'),
                        this.tTombo('detailLoadTomboError')
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
                if (status !== 200) throw new Error(this.tTombo('detailLoadKingdomsError'))

                const reinos = data?.resultado ?? []
                this.reinosRef.current.data = reinos

                return reinos
            })
            .catch(err => {
                this.reinosRef.current.promise = null
                this.reinosRef.current.data = null
                this.reinosRef.current.error = err

                this.openNotificationWithIcon('error', this.props.t('common:erro'), this.tTombo('detailLoadKingdomsError'))
                throw err
            })

        this.reinosRef.current.promise = promise
        return promise
    }

    verificaCoordenada = (cidadeId, latitude, longitude) => {
        verificarCoordenada(res => {
            if (res.data && res.data.dentro === false) {
                const cidadeEncontrada = res.data.cidade_encontrada
                const message = cidadeEncontrada
                    ? this.tTombo('coordinateOfTomboOtherCity', { city: cidadeEncontrada.nome, state: cidadeEncontrada.estado_sigla ? `/${cidadeEncontrada.estado_sigla}` : '' })
                    : this.tTombo('coordinateOfTomboUnknownCity')

                this.openNotificationWithIcon('warning', this.tTombo('detailCoordinateWarningTitle'), message)
            }
        }, cidadeId, latitude, longitude)
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {})
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
                                        {this.tTombo('detailEditTombo')}
                                    </Button>
                                </Link>
                            )
                        : null}
                    <Row gutter={8} style={{ margin: '20px 0' }}>

                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>{this.tTombo('numberTombo')}</h4>
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
                                <h4>{this.tTombo('popularName')}</h4>
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
                                <h4>{this.tTombo('herbarium')}</h4>
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
                                <h4>{this.tTombo('collectionNumber')}</h4>
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
                                <h4>{this.tTombo('collectionDate')}</h4>
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
                                <h4>{this.tTombo('tomboDate')}</h4>
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
                                <h4>{this.tTombo('detailScientificName')}</h4>
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
                                <h4>{this.tTombo('type')}</h4>
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
                                <h4>{this.tTombo('exsicataType')}</h4>
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
                                <h4>{this.tTombo('kingdom')}</h4>
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
                                <h4>{this.tTombo('family')}</h4>
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
                                <h4>{this.tTombo('subfamily')}</h4>
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
                                <h4>{this.tTombo('genus')}</h4>
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
                                <h4>{this.tTombo('species')}</h4>
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
                                <h4>{this.tTombo('subspecies')}</h4>
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
                                <h4>{this.tTombo('variety')}</h4>
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
                                <h4>{this.tTombo('detailAuthorSpecies')}</h4>
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
                                <h4>{this.tTombo('detailAuthorSubspecies')}</h4>
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
                                <h4>{this.tTombo('detailAuthorVariety')}</h4>
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
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>{this.tTombo('detailLatitudeDatum')}</h4>
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
                                <h4>{this.tTombo('detailLongitudeDatum')}</h4>
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
                                <h4>{this.tTombo('altitude')}</h4>
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
                                <h4>{this.tTombo('city')}</h4>
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
                                <h4>{this.tTombo('state')}</h4>
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
                                <h4>{this.tTombo('country')}</h4>
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
                                <h4>{this.tTombo('soil')}</h4>
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
                                <h4>{this.tTombo('relief')}</h4>
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
                                <h4>{this.tTombo('vegetation')}</h4>
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
                                <h4>{this.tTombo('successionalStage')}</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {tombo.local_coleta.fase_sucessional}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>{this.tTombo('detailCollectionSite')}</h4>
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
                                <h4>{this.tTombo('detailDescription')}</h4>
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
                                <h4>{this.tTombo('collectors')}</h4>
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
                                <h4>{this.tTombo('detailObservations')}</h4>
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
            // Verifica se existe a lista de identificadores no objeto "retorno" e extrai os nomes
            const identificadoresArray = tombo.retorno?.identificadores || []

            // Mapeia os nomes separados por vírgula. Faz fallback para o "identificador_nome" antigo caso a lista esteja vazia
            const nomesIdentificadores = identificadoresArray.length > 0
                ? identificadoresArray
                        .sort((a, b) => a.tombos_identificadores?.ordem - b.tombos_identificadores?.ordem)
                        .map(ident => ident.nome)
                        .join(', ')
                : (tombo.identificador_nome || '')

            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>{this.tTombo('identifier')}</h4>
                            </Col>
                            <Col span={24}>
                                <span>
                                    {' '}
                                    {nomesIdentificadores}
                                    {' '}
                                </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                            <Col span={24}>
                                <h4>{this.tTombo('identificationDate')}</h4>
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
                                <h4>{this.tTombo('annexCollections')}</h4>
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
                                <h4>{this.tTombo('detailAnnexCollectionObservations')}</h4>
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
                <Spin tip={this.props.t('common:carregando')}>
                    {this.renderConteudo()}
                </Spin>
            )
        }
        return (
            this.renderConteudo()
        )
    }
}

export default withTranslation()(DetalhesTomboScreen)
