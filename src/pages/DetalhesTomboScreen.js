import React, { Component } from 'react';
import {
    Row,
    Col,
    Divider,
    notification,
    Spin
} from 'antd';
import GalleryComponent from '../components/GalleryComponent';
import MapWithControlledZoom from '../components/MapWithControlledZoom';
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData';
import axios from 'axios';
import fotosTomboMap from '../helpers/fotos-tombo-map';

export default class DetalhesTomboScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            nomesColetores: "",
        };
    }

    componentDidMount() {
        if (this.props.match.params.tombo_id !== undefined) {
            this.requisitaTombo();
            this.setState({
                loading: true
            })
        }
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
        });
    };

    requisitaTombo = () => {
        axios.get(`/api/tombos/${this.props.match.params.tombo_id}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        tombo: response.data
                    });
                } else {
                    this.openNotificationWithIcon("error", "Falha", "Houve um problema ao buscar os dados do tombo, tente novamente.")
                }
                if (response.data.coletores) {
                    var coletores = "";
                    coletores = response.data.coletores.map(coletor => `${coletores}${coletor.nome},`).toString();
                    this.setState({
                        nomesColetores: coletores,
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                });
                const { response } = err;
                if (response && response.data) {
                    const { error } = response.data;
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError);
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log("Received values of form: ", values);
            }
        });
    };

    renderMainCharacteristics() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Número de tombo:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.hcf} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Nome Popular:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.nome_popular} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Herbário:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.herbario} </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Número da coleta:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.numero_coleta} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Data de Coleta:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.data_coleta} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Data de Tombo:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {formatarDataBDtoDataHora(tombo.data_tombo)} </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={16} md={16} lg={16} xl={16}>
                            <Col span={24}>
                                <h4> Nome cientifico:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.nome_cientifico} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Tipo:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.tipo} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderFamily() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Família:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.familia} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Subfamília:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.sub_familia} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Gênero:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.genero} </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Espécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.especie.nome} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Subespécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.sub_especie.nome} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Variedade:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.variedade.nome} </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Autor Espécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.especie.autor} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Autor Subespécie:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.sub_especie.autor} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4> Autor Variedade:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.taxonomia.variedade.autor} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderLocal() {
        const tombo = this.state.tombo;
        if (tombo) {
            
        console.log("kokoko")
        console.log(tombo.localizacao.longitude_graus)
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Latitude: (datum wgs84)</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.latitude_graus} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Longitude: (datum wgs84)</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.longitude_graus} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Altitude:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.altitude}m </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Cidade:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.cidade} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Estado:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.estado} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>País:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.localizacao.pais} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderGround() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Solo:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.local_coleta.solo} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Relevo:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.local_coleta.relevo} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Vegetação:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.local_coleta.vegetacao} </span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Fase sucessional:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.local_coleta.fase_sucessional.nome} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Descrição:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.local_coleta.descricao} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }


    renderCollectors() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <h4>Coletores:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {this.state.nomesColetores} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderComments() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <h4>Observações:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.observacao} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderIdentificador() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={8} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Identificador:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.identificador_nome != null ? tombo.identificador_nome : ''} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Data Identificação:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.data_identificacao} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderColecoesAnexas() {
        const tombo = this.state.tombo;
        if (tombo) {
            return (
                <div>
                    <Row gutter={24} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Coleções Anexas:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.colecao_anexa.tipo} </span>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <h4>Observações da coleção anexa:</h4>
                            </Col>
                            <Col span={24}>
                                <span> {tombo.colecao_anexa.observacao} </span>
                            </Col>
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    renderConteudo() {
        const tombo = this.state.tombo;
        if (!tombo) {
            return null;
        }
        const foto_nula = [{
            original: 'https://t4.ftcdn.net/jpg/01/39/16/63/240_F_139166369_NdTDXc0lM57N66868lC66PpsaMkFSwaf.jpg',
            thumbnail: 'https://t4.ftcdn.net/jpg/01/39/16/63/240_F_139166369_NdTDXc0lM57N66868lC66PpsaMkFSwaf.jpg',
        }]

        const fotos = tombo.fotos.length === 0 ? foto_nula : tombo.fotos.map(fotosTomboMap);

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

                <MapWithControlledZoom lat={tombo.localizacao.latitude} lng={tombo.localizacao.longitude} />
            </div>
        );
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
        );
    }
}
