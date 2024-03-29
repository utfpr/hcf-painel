import { Component } from 'react'

import {
    Row, Col, Divider, Select, InputNumber,
    Tag, Input, Button, notification, Spin, Modal,
    Radio, Table
} from 'antd'
import axios from 'axios'

import converteDecimalParaGrausMinutosSegundos from '@/helpers/conversoes/Coordenadas'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import ButtonComponent from '../components/ButtonComponent'
import CoordenadaInputText from '../components/CoordenadaInputText'
import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import UploadPicturesComponent from '../components/UploadPicturesComponent'
import { fotosBaseUrl } from '../config/api'
import tomboParaRequisicao from '../helpers/conversoes/TomboParaRequisicao'
import { isIdentificador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input
const RadioGroup = Radio.Group

class NovoTomboScreen extends Component {
    tabelaFotosColunas = [
        {
            title: 'Foto',
            dataIndex: 'thumbnail',
            render: thumbnail => (
                <img width="120" src={`${fotosBaseUrl}/${thumbnail}`} />
            )
        },
        {
            title: 'Ação',
            dataIndex: 'acao',
            render: (text, record, index) => (
                <a href="#" onClick={e => { e.preventDefault(); this.excluirFotoTombo(record, index) }}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            )
        }
    ]

    constructor(props) {
        super(props)
        this.state = {
            showTable: false,
            fetchingColetores: false,
            fetchingIdentificadores: false,
            valoresColetores: [],
            search: {
                subfamilia: '',
                genero: '',
                especie: '',
                subespecie: '',
                variedade: ''
            },
            visibleModal: false,
            loadingModal: false,
            formulario: {
                desc: ''
            },
            formComAutor: false,
            loading: false,
            herbarios: [],
            tipos: [],
            paises: [],
            estados: [],
            cidades: [],
            familias: [],
            subfamilias: [],
            autores: [],
            generos: [],
            especies: [],
            subespecies: [],
            variedades: [],
            solos: [],
            relevos: [],
            vegetacoes: [],
            fases: [],
            identificadores: [],
            coletores: [],
            fotosExsicata: [],
            fotosEmVivo: [],
            herbarioInicial: '',
            localidadeInicial: '',
            tipoInicial: '',
            paisInicial: '',
            estadoInicial: '',
            cidadeInicial: '',
            familiaInicial: '',
            subfamiliaInicial: '',
            generoInicial: '',
            especieInicial: '',
            subespecieInicial: '',
            variedadeInicial: '',
            soloInicial: '',
            relevoInicial: '',
            vegetacaoInicial: '',
            faseInicial: '',
            identificadorInicial: '',
            coletoresInicial: '',
            colecaoInicial: '',
            complementoInicial: '',
            latGraus: '',
            latMinutos: '',
            latSegundos: '',
            fotosCadastradas: []
        }
    }

    excluirFotoTombo = (foto, indice) => {
        console.log('Excluir a foto', foto, indice)
    }

    openNotification = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    componentDidMount() {
        this.requisitaDadosFormulario()
        this.setState({
            loading: true
        })
    }

    requisitaDadosEdicao = id => {
        axios.get(`/tombos/${id}`)
            .then(response => {
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        ...this.state,
                        loading: false,
                        ...data
                    })
                    this.insereDadosFormulario(data)

                    if (data.identificacao && data.identificacao.usuario_id) {
                        this.setState({
                            identificadorInicial: data.identificacao.usuario_id
                        })
                    }
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os dados do tombo, tente novamente.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.log(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    insereDadosFormulario(dados) {
        let insereState = {
            estados: dados.estados,
            cidades: dados.cidades,
            subfamilias: dados.subfamilias,
            generos: dados.generos,
            especies: dados.especies,
            subespecies: dados.subespecies,
            variedades: dados.variedades
        }
        if (dados.coletores) {
            console.log('PASSOU TUR')
            const colet = dados.coletores.map(item => ({
                key: item.id,
                label: item.nome
            }))
            console.log(colet)

            this.props.form.setFields({
                coletores: {
                    value: colet
                }
            })
        }
        if (dados.localizacao) {
            insereState = {
                ...insereState,
                latGraus: dados.localizacao.latitude_graus,
                latMinutos: dados.localizacao.latitude_min,
                latSegundos: dados.localizacao.latitude_sec
            }
        }

        if (dados.retorno.identificadores) {
            this.setState({
                insereState,
                identificadores: dados.retorno.identificadores
            })
        }
        this.props.form.setFields({
            altitude: {
                value: dados.localizacao.altitude
            },
            dataColetaAno: {
                value: dados.data_coleta_ano
            },
            dataColetaDia: {
                value: dados.data_coleta_dia
            },
            dataColetaMes: {
                value: dados.data_coleta_mes
            },
            dataIdentAno: {
                value: dados.data_identificacao_ano
            },
            dataIdentDia: {
                value: dados.data_identificacao_dia
            },
            dataIdentMes: {
                value: dados.data_identificacao_mes
            },
            latitude: {
                value: dados.localizacao.latitude
            },
            longitude: {
                value: dados.localizacao.longitude
            },
            nomePopular: {
                value: dados.retorno.nomes_populares
            },
            numColeta: {
                value: dados.numero_coleta
            },
            observacoesColecaoAnexa: {
                value: dados.colecao_anexa.observacao
            },
            observacoesTombo: {
                value: dados.observacao
            },
            relevoDescricao: {
                value: dados.local_coleta.descricao
            },
            complemento: {
                value: dados.localizacao.complemento
            },
            autorEspecie: {
                value: dados.complemento
            }
        })
    }

    requisitaDadosFormulario = () => {
        axios.get('/tombos/dados')
            .then(response => {
                if (response.status === 200) {
                    const dados = response.data
                    this.setState({
                        ...this.state,
                        ...dados
                    })
                    if (this.props.match.params.tombo_id) {
                        this.setState({ showTable: true })
                        this.requisitaDadosEdicao(this.props.match.params.tombo_id)
                    } else {
                        this.setState({
                            loading: false
                        })
                    }
                } else {
                    this.setState({
                        loading: false
                    })
                    this.openNotification('error', 'Falha', 'Houve um problema ao buscar os dados do usuário, tente novamente.')
                }

                axios.get('/identificadores-predicao?nome=')
                    .then(response => {
                        if (response.status === 200) {
                            this.setState({
                                identificadores: response.data
                            })
                        }
                    })
                    .catch(err => {
                        this.catchRequestError(err)
                    })
                    .finally(() => {
                        this.setState({ fetchingIdentificadores: false })
                    })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaNumeroColetor = () => {
        axios.get('/numero-coletores')
            .then(response => {
                if (response.status === 200) {
                    this.setState(response.data)
                    this.props.form.setFields({
                        numeroColetor: {
                            value: response.data.numero
                        }
                    })
                } else {
                    this.openNotification('error', 'Falha', 'Houve um problema ao buscar o numero de coletor sugerido, tente novamente.')
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!(this.props.form.getFieldsValue().dataColetaDia || this.props.form.getFieldsValue().dataColetaMes || this.props.form.getFieldsValue().dataColetaAno)) {
                this.openNotificationWithIcon('warning', 'Falha', 'É necessário pelo menos o dia ou o mês ou o ano da data de coleta para o cadastro.')
                return false
            }
            if (err != null) {
                console.log(err)
                this.openNotificationWithIcon('warning', 'Falha', 'Preencha todos os dados requiridos.')
            } else {
                this.requisitaCadastroTombo(values)
                this.setState({
                    loading: true
                })
            }
        })
    }

    handleSubmitIdentificador = e => {
        e.preventDefault()
        const {
            familia, subfamilia, genero, especie, subespecie, variedade
        } = this.props.form.getFieldsValue()
        if ((familia || subfamilia || genero || especie || subespecie || variedade)) {
            this.setState({
                loading: true
            })
            const json = {}
            if (familia) {
                json.familia_id = familia
            }
            if (subfamilia) {
                json.subfamilia_id = subfamilia
            }
            if (genero) {
                json.genero_id = genero
            }
            if (especie) {
                json.especie_id = especie
            }
            if (subespecie) {
                json.subespecie_id = subespecie
            }
            if (variedade) {
                json.variedade_id = variedade
            }
            axios.put(`/tombos/${this.props.match.params.tombo_id}`, json)
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 200) {
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                        this.props.history.goBack()
                    }
                })
                .catch(err => {
                    this.setState({
                        loading: false
                    })
                    const { response } = err

                    if (response.status === 400) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao alterar o tombo tente novamente.')
                    }
                    if (response && response.data) {
                        const { error } = response.data
                        console.log(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaCadastroTombo(values) {
        const {
            altitude, autorEspecie, autorVariedade, autoresSubespecie, cidade, coletores, complemento,
            dataColetaAno, dataColetaDia, dataColetaMes, dataIdentAno, dataIdentDia, dataIdentMes,
            especie, familia, fases, genero, identificador, latitude, localidadeCor, longitude,
            nomePopular, numColeta, observacoesColecaoAnexa, observacoesTombo, relevo, solo,
            subespecie, subfamilia, tipo, tipoColecaoAnexa, variedade, vegetacao, entidade, relevoDescricao
        } = values
        const json = {}

        console.log('longitude', longitude)

        if (nomePopular) json.principal = { nome_popular: nomePopular }
        json.principal = { ...json.principal, entidade_id: entidade }
        json.principal.numero_coleta = numColeta
        if (dataColetaDia) json.principal.data_coleta = { dia: dataColetaDia }
        if (dataColetaMes) json.principal.data_coleta = { ...json.principal.data_coleta, mes: dataColetaMes }
        if (dataColetaAno) json.principal.data_coleta = { ...json.principal.data_coleta, ano: dataColetaAno }
        if (tipo) json.principal.tipo_id = tipo
        json.principal.cor = localidadeCor
        if (familia) json.taxonomia = { ...json.taxonomia, familia_id: familia }
        if (genero) json.taxonomia = { ...json.taxonomia, genero_id: genero }
        if (subfamilia) json.taxonomia = { ...json.taxonomia, sub_familia_id: subfamilia }
        if (especie) json.taxonomia = { ...json.taxonomia, especie_id: especie }
        if (variedade) json.taxonomia = { ...json.taxonomia, variedade_id: variedade }
        if (subespecie) json.taxonomia = { ...json.taxonomia, sub_especie_id: subespecie }
        if (latitude) json.localidade = { latitude: converteDecimalParaGrausMinutosSegundos(latitude, false, true) }
        if (longitude) json.localidade = { ...json.localidade, longitude: converteDecimalParaGrausMinutosSegundos(longitude, true, true) }
        if (altitude) json.localidade = { ...json.localidade, altitude }
        json.localidade = { ...json.localidade, cidade_id: cidade }
        if (complemento) {
            json.localidade = { ...json.localidade, complemento }
        }
        if (solo) json.paisagem = { ...json.paisagem, solo_id: solo }
        if (relevoDescricao) json.paisagem = { ...json.paisagem, descricao: relevoDescricao }
        if (relevo) json.paisagem = { ...json.paisagem, relevo_id: relevo }
        if (vegetacao) json.paisagem = { ...json.paisagem, vegetacao_id: vegetacao }
        if (fases) json.paisagem = { ...json.paisagem, fase_sucessional_id: fases }
        if (identificador) json.identificacao = { identificador_id: identificador }
        if (dataIdentDia) {
            json.identificacao = {
                ...json.identificacao,
                data_identificacao: {
                    dia: dataIdentDia
                }
            }
        }
        if (dataIdentMes) {
            json.identificacao = {
                ...json.identificacao,
                data_identificacao: {
                    ...json.identificacao.data_identificacao,
                    mes: dataIdentMes
                }
            }
        }
        if (dataIdentAno) {
            json.identificacao = {
                ...json.identificacao,
                data_identificacao: {
                    ...json.identificacao.data_identificacao,
                    ano: dataIdentAno
                }
            }
        }
        const converterInteiroColetores = () => coletores.map(item => parseInt(item.key))
        json.coletores = converterInteiroColetores()
        if (tipoColecaoAnexa) json.colecoes_anexas = { tipo: tipoColecaoAnexa }
        if (observacoesColecaoAnexa) json.colecoes_anexas = { ...json.colecoes_anexas, observacoes: observacoesColecaoAnexa }
        if (observacoesTombo) json.observacoes = observacoesTombo
        if (autorEspecie) json.autores = { especie: autorEspecie }
        if (autoresSubespecie) json.autores = { ...json.autores, subespecie: autoresSubespecie }
        if (autorVariedade) json.autores = { ...json.autores, variedade: autorVariedade }

        axios.post('/tombos', { json })
            .then(response => {
                if (response.status === 201) {
                    const tombo = response.data
                    const criaRequisicaoFoto = (hcf, emVivo, foto) => {
                        const form = new FormData()
                        form.append('imagem', foto)
                        form.append('tombo_hcf', hcf)
                        form.append('em_vivo', emVivo)

                        return axios.post('/uploads', form, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                    }

                    const criaFuncaoMap = (hcf, emVivo) => foto => criaRequisicaoFoto(hcf, emVivo, foto)

                    const { fotosEmVivo, fotosExsicata } = this.state

                    const promises = [
                        ...fotosEmVivo.map(criaFuncaoMap(tombo.hcf, true)),
                        ...fotosExsicata.map(criaFuncaoMap(tombo.hcf, false))
                    ]

                    return Promise.all(promises)
                }
            })
            .then(response => {
                this.setState({
                    loading: false
                })

                this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                this.props.history.goBack()
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err

                if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo tombo tente novamente.')
                }
                if (response && response.data) {
                    const { error } = response.data
                    console.log(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmitForm = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    optionEntidades = () => this.state.herbarios.map(item => (
        <Option value={`${item.id}`}>
            {item.sigla}
            {' '}
            -
            {' '}
            {item.nome}
        </Option>
    ))

    optionTipo = () => this.state.tipos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionFase = () => this.state.fases.map(item => (
        <Option value={`${item.numero}`}>{item.nome}</Option>
    ))

    optionPais = () => this.state.paises.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionEstado = () => this.state.estados.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionCidade = () => this.state.cidades.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionFamilia = () => this.state.familias.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionSubfamilia = () => this.state.subfamilias.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionGenero = () => this.state.generos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionEspecie = () => this.state.especies.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionSubespecie = () => this.state.subespecies.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionVariedade = () => this.state.variedades.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionVegetacao = () => this.state.vegetacoes.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionRelevo = () => this.state.relevos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionSolo = () => this.state.solos.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    optionColetores = () => this.state.coletores.map(item => (
        <Option key={`${item.id}`}>{item.nome}</Option>
    ))

    optionIdentificador = () => this.state.identificadores.map(item => (
        <Option key={`${item.id}`}>{item.nome}</Option>
    ))

    requisitaEstados = id => {
        axios.get('/estados', {
            params: {
                id
            }
        })
            .then(response => {
                if (response.data && response.status === 200) {
                    this.setState({
                        estados: response.data
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os estados desse país, tente novamente.')
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaCidades = id => {
        axios.get('/cidades', {
            params: {
                id
            }
        })
            .then(response => {
                if (response.data && response.status === 200) {
                    this.setState({
                        cidades: response.data
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar as cidades desse estado, tente novamente.')
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description,
            duration: 10
        })
    }

    cadastraNovoTipo() {
        this.setState({
            loading: true
        })
        axios.post('/tipos', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaTipos()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo tipo, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaTipos = () => {
        this.setState({
            loading: true
        })
        axios.get('/tipos')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        tipos: response.data
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os tipos do tombo, tente novamente.')
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema a listar os tipos, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaFamilia() {
        this.setState({
            loading: true
        })
        axios.post('/familias', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaFamilias()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova família, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaFamilias = () => {
        this.setState({
            loading: true
        })
        axios.get('/familias', {
            params: {
                limite: 9999999999
            }
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        familias: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar famílias, tente novamente.')
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem das famílias, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaSubfamilia() {
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma subfamília.')
        } else {
            this.setState({
                loading: true
            })
            axios.post('/subfamilias', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia
            })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaSubfamilias(this.props.form.getFieldsValue().familia)
                        this.setState({
                            search: {
                                subfamilia: 'validating'
                            }
                        })
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    }
                    this.props.form.setFields({
                        campo: {
                            value: ''
                        }
                    })
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
                            this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova subfamília, tente novamente.')
                        }
                        const { error } = response.data
                        throw new Error(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaSubfamilias = id => {
        // this.setState({
        //     loading: true,
        // });
        axios.get('/subfamilias', {
            params: {
                familia_id: id,
                limite: 999999999
            }
        })
            .then(response => {
                // this.setState({
                //     loading: false,
                // });
                this.setState({
                    search: {
                        subfamilia: ''
                    }
                })
                if (response.status === 200) {
                    this.setState({
                        subfamilias: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar as subfamílias, tente novamente.')
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        subfamilia: ''
                    }
                    // loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem de subfamília, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoGenero() {
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma subfamília.')
        } else {
            this.setState({
                loading: true
            })
            axios.post('/generos', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia
            })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaGeneros(this.props.form.getFieldsValue().familia)
                        this.setState({
                            search: {
                                genero: 'validating'
                            }
                        })
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    }
                    this.props.form.setFields({
                        campo: {
                            value: ''
                        }
                    })
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
                            this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo gênero, tente novamente.')
                        }
                        const { error } = response.data
                        throw new Error(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaGeneros = id => {
        // this.setState({
        //     loading: true,
        // });
        axios.get('/generos', {
            params: {
                familia_id: id,
                limite: 9999999999
            }
        })
            .then(response => {
                this.setState({
                    search: {
                        genero: ''
                    }
                    // loading: false,
                })
                if (response.status === 200) {
                    this.setState({
                        generos: response.data.resultado
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        genero: ''
                    }
                    // loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem de gêneros, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaEspecie() {
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione um gênero para cadastrar uma subfamília.')
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma subfamília.')
        } else {
            this.setState({
                loading: true
            })
            axios.post('/especies', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia,
                genero_id: this.props.form.getFieldsValue().genero,
                autor_id: this.props.form.getFieldsValue().autor
            })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaEspecies(this.props.form.getFieldsValue().genero)
                        this.setState({
                            search: {
                                especie: 'validating'
                            }
                        })
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    }
                    this.props.form.setFields({
                        campo: {
                            value: ''
                        }
                    })
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
                            this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova espécie, tente novamente.')
                        }
                        const { error } = response.data
                        throw new Error(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaEspecies = id => {
        // this.setState({
        //     loading: true,
        // });
        axios.get('/especies', {
            params: {
                genero_id: id,
                limite: 9999999999
            }
        })
            .then(response => {
                this.setState({
                    search: {
                        especie: ''
                    }
                    // loading: false,
                })
                if (response.status === 200) {
                    this.setState({
                        especies: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar as espécies, tente novamente.')
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        especie: ''
                    }
                    // loading: false,
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem de espécies, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaSubespecie() {
        if (!this.props.form.getFieldsValue().especie) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma espécie para cadastrar uma subespécie.')
        }
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione um gênero para cadastrar uma subespécie.')
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma subespécie.')
        } else {
            this.setState({
                loading: true
            })
            axios.post('/subespecies', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia,
                genero_id: this.props.form.getFieldsValue().genero,
                especie_id: this.props.form.getFieldsValue().especie,
                autor_id: this.props.form.getFieldsValue().autor
            })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaSubespecies(this.props.form.getFieldsValue().especie)
                        this.setState({
                            search: {
                                subespecie: 'validating'
                            }
                        })
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    }
                    this.props.form.setFields({
                        campo: {
                            value: ''
                        }
                    })
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
                            this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova subespécie, tente novamente.')
                        }
                        const { error } = response.data
                        throw new Error(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaSubespecies = id => {
        // this.setState({
        //     loading: true,
        // });
        axios.get('/subespecies', {
            params: {
                especie_id: id,
                limite: 999999999
            }
        })
            .then(response => {
                this.setState({
                    search: {
                        subespecie: ''
                    }
                    // loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        subespecies: response.data.resultado
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        subespecie: ''
                    }
                    // loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem das subespécies, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaVariedade() {
        if (!this.props.form.getFieldsValue().especie) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma espécie para cadastrar uma variedade.')
        }
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione um gênero para cadastrar uma variedade.')
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma variedade.')
        } else {
            this.setState({
                loading: true
            })
            axios.post('/variedades', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia,
                genero_id: this.props.form.getFieldsValue().genero,
                especie_id: this.props.form.getFieldsValue().especie,
                autor_id: this.props.form.getFieldsValue().autor
            })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaVariedades(this.props.form.getFieldsValue().especie)
                        this.setState({
                            search: {
                                variedade: 'validating'
                            }
                        })
                        this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                    }
                    this.props.form.setFields({
                        campo: {
                            value: ''
                        }
                    })
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
                            this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova variedade, tente novamente.')
                        }
                        const { error } = response.data
                        throw new Error(error.message)
                    } else {
                        throw err
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaVariedades = id => {
        // this.setState({
        //     loading: true,
        // });
        axios.get('/variedades', {
            params: {
                especie_id: id,
                limite: 999999999
            }
        })
            .then(response => {
                this.setState({
                    search: {
                        variedade: ''
                    }
                    //  loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        variedades: response.data.resultado
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        variedade: ''
                    }
                    //  loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem de variedade, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoAutor() {
        axios.post('/autores', {
            nome: this.props.form.getFieldsValue().campo,
            iniciais: ''
        })
            .then(response => {
                if (response.status === 204) {
                    this.requisitaAutores()
                    this.setState({
                        search: {
                            autor: 'validating'
                        }
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo autor, tente novamente.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaAutores = id => {
        this.setState({
            loading: true
        })
        axios.get('/autores')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        search: {
                            autor: ''
                        }
                    })
                    this.setState({
                        autores: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        autor: ''
                    },
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar os autores, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoSolo() {
        this.setState({
            loading: true
        })
        axios.post('/solos', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                if (response.status === 204) {
                    this.requisitaSolos()
                    this.setState({
                        search: {
                            solo: 'validating'
                        },
                        loading: false
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo solo, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaSolos = id => {
        this.setState({
            loading: true
        })
        axios.get('/solos')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        search: {
                            solo: ''
                        }
                    })
                    this.setState({
                        solos: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        solo: ''
                    },
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo solo, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoRelevo() {
        this.setState({
            loading: true
        })
        axios.post('/relevos', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaRelevos()
                    this.setState({
                        search: {
                            relevo: 'validating'
                        }
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo relevo, tente novamente.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo relevo, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaRelevos = id => {
        this.setState({
            loading: true
        })
        axios.get('/relevos')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        search: {
                            relevo: ''
                        }
                    })
                    this.setState({
                        relevos: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        relevo: ''
                    },
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar o relevo, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaVegetacao() {
        this.setState({
            loading: true
        })
        axios.post('/vegetacoes', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaVegetacoes()
                    this.setState({
                        search: {
                            vegetacao: 'validating'
                        }
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({
                    campo: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova vegetação, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaVegetacoes = id => {
        this.setState({
            loading: true
        })
        axios.get('/vegetacoes')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        search: {
                            vegetacao: ''
                        }
                    })
                    this.setState({
                        vegetacoes: response.data
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar as vegetações, tente novamente.')
                }
            })
            .catch(err => {
                this.setState({
                    search: {
                        vegetacao: ''
                    },
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar as vegetacoes, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoColetor() {
        this.setState({
            formColetor: false,
            loading: true
        })
        axios.post('/coletores', {
            nome: this.props.form.getFieldsValue().nomeColetor,
            email: this.props.form.getFieldsValue().emailColetor,
            numero: this.props.form.getFieldsValue().numeroColetor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaColetores('')
                    this.setState({
                        search: {
                            coletor: 'validating'
                        }
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({
                    nomeColetor: {
                        value: ''
                    },
                    emailColetor: {
                        value: ''
                    },
                    numeroColetor: {
                        value: ''
                    }
                })
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo coletor, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaColetores = nome => {
        this.setState({
            coletores: [],
            fetchingColetores: true
        })
        axios.get(`/coletores-predicao?nome=${nome}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        coletores: response.data
                    })
                }
                this.setState({ fetchingColetores: false })
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar coletores, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaIdentificadores = nome => {
        this.setState({
            identificadores: [],
            fetchingIdentificadores: true
        })
        axios.get(`/identificadores-predicao?nome=${nome}`)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        identificadores: response.data
                    })
                }
                this.setState({ fetchingIdentificadores: false })
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar os identificadores, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    renderPrincipaisCaracteristicas(getFieldDecorator, getFieldError) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Nome popular:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nomePopular')(
                                    <Input placeholder="Maracujá Doce" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Herbário:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('entidade', {
                                    initialValue: String(this.state.herbarioInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Escolha uma entidade'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma entidade"
                                        optionFilterProp="children"
                                        status={getFieldError('entidade') ? 'error' : ''}
                                    >
                                        {this.optionEntidades()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Número da coleta:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('numColeta', {
                                    initialValue: String(this.state.numero_coleta),
                                    rules: [{
                                        required: true,
                                        message: 'Insira o numero da coleta'
                                    }]
                                })(
                                    <Input type="text" placeholder="785" style={{ width: '100%' }} />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Data de coleta:</span>
                        </Col>
                        <Col span={24}>
                            <Row type="flex" gutter={4}>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataColetaDia', {
                                            rules: [{
                                                required: true,
                                                message: 'Insira o dia da coleta'
                                            }]
                                        })(
                                            <InputNumber
                                                min={1}
                                                max={31}
                                                initialValue={17}
                                                style={{ width: '100%' }}
                                                status={getFieldError('dataColetaDia') ? 'error' : ''}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataColetaMes', {
                                            rules: [{
                                                required: true,
                                                message: 'Insira o mês da coleta'
                                            }]
                                        })(
                                            <InputNumber
                                                min={1}
                                                max={12}
                                                initialValue={11}
                                                style={{ width: '100%' }}
                                                status={getFieldError('dataColetaMes') ? 'error' : ''}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataColetaAno', {
                                            rules: [{
                                                required: true,
                                                message: 'Insira o ano da coleta'
                                            }]
                                        })(
                                            <InputNumber
                                                min={500}
                                                max={5000}
                                                initialValue={2018}
                                                style={{ width: '100%' }}
                                                status={getFieldError('dataColetaAno') ? 'error' : ''}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Localidade:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('localidadeCor', {
                                    initialValue: String(this.state.localidadeInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Escolha uma localidade'
                                    }]
                                })(
                                    <RadioGroup
                                        onChange={this.onChange}
                                        value={this.state.value}
                                        style={{ padding: '3px', boxShadow: getFieldError('localidadeCor') ? '0 0 0 1px #f5222d' : '', borderRadius: '1px' }}
                                    >
                                        <Radio value="VERMELHO"><Tag color="red">Paraná</Tag></Radio>
                                        <Radio value="VERDE"><Tag color="green">Brasil</Tag></Radio>
                                        <Radio value="AZUL"><Tag color="blue">Outros países</Tag></Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Tipo:</span>
                        </Col>
                        <Col xs={22} sm={22} md={12} lg={12} xl={12}>
                            <FormItem>
                                {getFieldDecorator('tipo', {
                                    initialValue: String(this.state.tipoInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione o tipo"
                                        optionFilterProp="children"
                                    >
                                        {this.optionTipo()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'do novo tipo',
                                            tipo: 0
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    renderLocalTombo(getFieldDecorator, getFieldError) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Latitude:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('latitude')(
                                    <CoordenadaInputText
                                        placeholder={'48°40\'30"O'}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Longitude:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('longitude')(
                                    <CoordenadaInputText
                                        longitude
                                        placeholder={'48°40\'30"O'}
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Altitude:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('altitude')(
                                    <InputNumber style={{ width: '100%' }} />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>País:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('pais', {
                                    initialValue: String(this.state.paisInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Escolha um país'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um país"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaEstados(value)
                                        }}
                                        status={getFieldError('pais') ? 'error' : ''}
                                    >
                                        {this.optionPais()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Estado:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('estado', {
                                    initialValue: String(this.state.estadoInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Escolha um estado'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um estado"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaCidades(value)
                                        }}
                                        status={getFieldError('estado') ? 'error' : ''}
                                    >
                                        {this.optionEstado()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Cidade:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('cidade', {
                                    initialValue: String(this.state.cidadeInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Escolha uma cidade'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma cidade"
                                        optionFilterProp="children"
                                        status={getFieldError('cidade') ? 'error' : ''}
                                    >
                                        {this.optionCidade()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={16} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Complemento:</span>
                        </Col>
                        <Col span={24}>
                            {getFieldDecorator('complemento', {
                                initialValue: String(this.state.complementoInicial)
                            })(
                                <TextArea rows={4} />
                            )}
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    renderFamiliaTombo(getFieldDecorator) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Família:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem>
                                {getFieldDecorator('familia', {
                                    initialValue: String(this.state.familiaInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma família"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaSubfamilias(value)
                                            this.requisitaGeneros(value)
                                            this.setState({
                                                search: {
                                                    subfamilia: 'validating',
                                                    genero: 'validating'
                                                }
                                            })
                                            this.props.form.setFields({
                                                subfamilia: {
                                                    value: ''
                                                },
                                                genero: {
                                                    value: ''
                                                },
                                                especie: {
                                                    value: ''
                                                },
                                                subespecie: {
                                                    value: ''
                                                },
                                                variedade: {
                                                    value: ''
                                                }
                                            })
                                        }}
                                    >
                                        {this.optionFamilia()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova família',
                                            tipo: 1
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Subfamília:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.subfamilia}>
                                {getFieldDecorator('subfamilia', {
                                    initialValue: String(this.state.subfamiliaInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma subfamília"
                                        optionFilterProp="children"
                                    >
                                        {this.optionSubfamilia()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova subfamília',
                                            tipo: 2
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Gênero:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.genero}>
                                {getFieldDecorator('genero', {
                                    initialValue: String(this.state.generoInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um gênero"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaEspecies(value)
                                            this.setState({
                                                search: {
                                                    especie: 'validating'
                                                }
                                            })
                                            this.props.form.setFields({
                                                especie: {
                                                    value: ''
                                                },
                                                subespecie: {
                                                    value: ''
                                                },
                                                variedade: {
                                                    value: ''
                                                }
                                            })
                                        }}
                                    >
                                        {this.optionGenero()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'do novo gênero',
                                            tipo: 3
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Espécie:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.especie}>
                                {getFieldDecorator('especie', {
                                    initialValue: String(this.state.especieInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma espécie"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaSubespecies(value)
                                            this.requisitaVariedades(value)
                                            this.setState({
                                                search: {
                                                    subespecie: 'validating',
                                                    variedade: 'validating'
                                                },
                                                formComAutor: true
                                            })
                                            this.props.form.setFields({
                                                subespecie: {
                                                    value: ''
                                                },
                                                variedade: {
                                                    value: ''
                                                }
                                            })
                                        }}
                                    >
                                        {this.optionEspecie()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova espécie',
                                            tipo: 4
                                        },
                                        formComAutor: true,
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Subespécie:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.subespecie}>
                                {getFieldDecorator('subespecie', {
                                    initialValue: String(this.state.subespecieInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma subespécie"
                                        optionFilterProp="children"
                                    >
                                        {this.optionSubespecie()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova subespécie',
                                            tipo: 5
                                        },
                                        formComAutor: true,
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Variedade:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.variedade}>
                                {getFieldDecorator('variedade', {
                                    initialValue: String(this.state.variedadeInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma variedade"
                                        optionFilterProp="children"
                                    >
                                        {this.optionVariedade()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova variedade',
                                            tipo: 6
                                        },
                                        formComAutor: true,
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>

            </div>
        )
    }

    renderTipoSoloTombo(getFieldDecorator) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Solo:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.solo}>
                                {getFieldDecorator('solo', {
                                    initialValue: String(this.state.soloInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um solo"
                                        optionFilterProp="children"
                                    >
                                        {this.optionSolo()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'do novo solo',
                                            tipo: 8
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Relevo:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.relevo}>
                                {getFieldDecorator('relevo', {
                                    initialValue: String(this.state.relevoInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um relevo"
                                        optionFilterProp="children"
                                    >
                                        {this.optionRelevo()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'do novo relevo',
                                            tipo: 9
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Vegetação:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem validateStatus={this.state.search.vegetacao}>
                                {getFieldDecorator('vegetacao', {
                                    initialValue: String(this.state.vegetacaoInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma vegetacao"
                                        optionFilterProp="children"
                                    >
                                        {this.optionVegetacao()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.setState({
                                        formulario: {
                                            desc: 'da nova vegetação',
                                            tipo: 10
                                        },
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Fase sucessional:</span>
                        </Col>
                        <Col span={22}>
                            <FormItem>
                                {getFieldDecorator('fases', {
                                    initialValue: String(this.state.faseInicial)
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma fase sucessional"
                                        optionFilterProp="children"
                                    >
                                        {this.optionFase()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={16} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Descrição:</span>
                        </Col>
                        <Col span={24}>
                            {getFieldDecorator('relevoDescricao')(
                                <TextArea rows={4} />
                            )}
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    renderIdentificador(getFieldDecorator) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span> Identificador: </span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('identificador', {
                                    initialValue: String(this.state.identificadorInicial)
                                })(
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        optionFilterProp="children"
                                        // onChange={this.handleChangeIdentificadores}
                                        placeholder="Selecione o idenficador"
                                        onSearch={value => {
                                            this.requisitaIdentificadores(value)
                                        }}
                                        filterOption={false}
                                    >
                                        {this.optionIdentificador()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span> Data identificação: </span>
                        </Col>
                        <Col span={24}>
                            <Row type="flex" gutter={4}>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataIdentDia')(
                                            <InputNumber
                                                min={1}
                                                max={31}
                                                initialValue={17}
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataIdentMes')(
                                            <InputNumber
                                                min={1}
                                                max={12}
                                                initialValue={11}
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataIdentAno')(
                                            <InputNumber
                                                min={500}
                                                max={5000}
                                                initialValue={2018}
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    handleChangeColetores = valores => {
        this.setState({
            fetchingColetores: false,
            valoresColetores: valores,
            coletores: []
        })
    }

    handleChangeIdentificadores = valor => {
        console.log(valor)
        this.setState({
            fetchingIdentificadores: false,
            identificadorInicial: `${valor}`,
            identificadores: []
        })
    }

    renderColetores(getFieldDecorator, getFieldError) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={16} lg={16} xl={16}>
                        <Col span={24}>
                            <span>Coletores:</span>
                        </Col>
                        <Col span={18}>
                            <FormItem validateStatus={this.state.search.coletor}>
                                {getFieldDecorator('coletores', {
                                    // initialValue:  this.state.coletoresInicial != '' ? String(this.state.coletoresInicial) : "oi",
                                    rules: [{
                                        required: true,
                                        message: 'Insira ao menos um coletor'
                                    }]
                                })(
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        notFoundContent={this.state.fetchingColetores ? <Spin size="small" /> : null}
                                        labelInValue
                                        value={this.state.valoresColetores}
                                        // onChange={this.handleChangeColetores}
                                        placeholder="Selecione os coletores"
                                        filterOption={false}
                                        onSearch={value => {
                                            this.requisitaColetores(value)
                                        }}
                                        status={getFieldError('coletores') ? 'error' : ''}
                                    >
                                        {this.optionColetores()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                            <Button
                                shape="dashed"
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: '5px'
                                }}
                                onClick={() => {
                                    this.requisitaNumeroColetor()
                                    this.setState({
                                        formulario: {
                                            tipo: 11
                                        },
                                        formColetor: true,
                                        visibleModal: true
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    renderColecoesAnexas(getFieldDecorator) {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Coleções anexas:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('tipoColecaoAnexa', {
                                    initialValue: String(this.state.colecaoInicial)
                                })(
                                    <RadioGroup onChange={this.onChange} value={this.state.value}>
                                        <Radio value="CARPOTECA"><Tag color="red">Carpoteca</Tag></Radio>
                                        <Radio value="XILOTECA"><Tag color="green">Xiloteca</Tag></Radio>
                                        <Radio value="VIA LIQUIDA"><Tag color="blue">Via Líquida</Tag></Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span> Observações da coleção anexa: </span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('observacoesColecaoAnexa')(
                                    <TextArea rows={4} />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
            </div>
        )
    }

    renderFormulario(getFieldDecorator) {
        if (this.state.formColetor) {
            return (
                <div>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nomeColetor')(
                                        <Input placeholder="" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>E-mail:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('emailColetor')(
                                        <Input placeholder="" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nº Coletor:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('numeroColetor')(
                                        <Input placeholder="" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                </div>
            )
        } if (this.state.formComAutor) {
            return (
                <div>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>
                                Informe o nome
                                {this.state.formulario.desc}
                                :
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('campo')(
                                    <Input placeholder="" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Informe o nome do autor:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('autor')(
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Selecione um autor"
                                        optionFilterProp="children"
                                    >
                                        {this.optionAutores()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            )
        }
        return (
            <div>
                <Row gutter={8}>
                    <Col span={24}>
                        <span>
                            Informe o nome
                            {this.state.formulario.desc}
                            :
                        </span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('campo')(
                                <Input placeholder="" type="text" />
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </div>
        )
    }

    validacaoModal() {
        if (this.state.formColetor) {
            if (!this.props.form.getFieldsValue().nomeColetor || !this.props.form.getFieldsValue().numeroColetor) {
                this.openNotificationWithIcon('warning', 'Falha', 'O nome e o número do coletor são obrigatórios.')
                return false
            }
            return true
        }
        if (!this.props.form.getFieldsValue().campo) {
            this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome para o cadastro.')
            return false
        }
        return true
    }

    renderConteudoIdentificador() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Form onSubmit={this.handleSubmitForm}>
                    <ModalCadastroComponent
                        title="Edição"
                        visibleModal={this.state.visibleModal}
                        loadingModal={this.state.loadingModal}
                        onCancel={
                            () => {
                                this.setState({
                                    visibleModal: false,
                                    formColetor: 0,
                                    formComAutor: false
                                })
                            }
                        }
                        onOk={() => {
                            if (this.validacaoModal()) {
                                switch (this.state.formulario.tipo) {
                                    case 1:
                                        this.cadastraNovaFamilia()
                                        break
                                    case 2:
                                        this.cadastraNovaSubfamilia()
                                        break
                                    case 3:
                                        this.cadastraNovoGenero()
                                        break
                                    case 4:
                                        this.cadastraNovaEspecie()
                                        break
                                    case 5:
                                        this.cadastraNovaSubespecie()
                                        break
                                    case 6:
                                        this.cadastraNovaVariedade()
                                        break
                                    case 7:
                                        this.cadastraNovoAutor()
                                        break
                                    default:
                                        break
                                }
                            }

                            this.setState({
                                visibleModal: false,
                                formComAutor: false,
                                formColetor: 0
                            })
                        }}
                    >

                        {this.renderFormulario(getFieldDecorator)}

                    </ModalCadastroComponent>
                </Form>
                <Form onSubmit={this.handleSubmitIdentificador}>
                    <Row>
                        <Col span={12}>
                            <h2 style={{ fontWeight: 200 }}>Tombo</h2>
                        </Col>
                    </Row>
                    <Divider dashed />
                    {this.renderFamiliaTombo(getFieldDecorator)}
                    <Divider dashed />
                    <Row type="flex" justify="end">
                        <Col xs={24} sm={8} md={3} lg={3} xl={3}>
                            <ButtonComponent titleButton="Salvar" />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }

    renderConteudo() {
        const { getFieldDecorator, getFieldError } = this.props.form

        return (
            <div>
                <Form onSubmit={this.handleSubmitForm}>
                    <ModalCadastroComponent
                        title="Cadastro"
                        visibleModal={this.state.visibleModal}
                        loadingModal={this.state.loadingModal}
                        onCancel={
                            () => {
                                this.setState({
                                    visibleModal: false,
                                    formColetor: 0,
                                    formComAutor: false
                                })
                            }
                        }
                        onOk={() => {
                            if (this.validacaoModal()) {
                                switch (this.state.formulario.tipo) {
                                    case 0:
                                        this.cadastraNovoTipo()
                                        break
                                    case 1:
                                        this.cadastraNovaFamilia()
                                        break
                                    case 2:
                                        this.cadastraNovaSubfamilia()
                                        break
                                    case 3:
                                        this.cadastraNovoGenero()
                                        break
                                    case 4:
                                        this.cadastraNovaEspecie()
                                        break
                                    case 5:
                                        this.cadastraNovaSubespecie()
                                        break
                                    case 6:
                                        this.cadastraNovaVariedade()
                                        break
                                    case 7:
                                        this.cadastraNovoAutor()
                                        break
                                    case 8:
                                        this.cadastraNovoSolo()
                                        break
                                    case 9:
                                        this.cadastraNovoRelevo()
                                        break
                                    case 10:
                                        this.cadastraNovaVegetacao()
                                        break
                                    case 11:
                                        this.cadastraNovoColetor()
                                        break
                                    default:
                                        break
                                }
                            }

                            this.setState({
                                visibleModal: false,
                                formComAutor: false,
                                formColetor: 0
                            })
                        }}
                    >

                        {this.renderFormulario(getFieldDecorator)}

                    </ModalCadastroComponent>
                </Form>
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Col span={12}>
                            <h2 style={{ fontWeight: 200 }}>Tombo</h2>
                        </Col>
                    </Row>
                    <Divider dashed />
                    {this.renderPrincipaisCaracteristicas(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderLocalTombo(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderFamiliaTombo(getFieldDecorator)}
                    <Divider dashed />
                    {this.renderTipoSoloTombo(getFieldDecorator)}
                    <Divider dashed />
                    {this.renderIdentificador(getFieldDecorator)}
                    <Divider dashed />
                    {this.renderColetores(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderColecoesAnexas(getFieldDecorator)}
                    <Divider dashed />
                    <Row gutter={8}>
                        <Col span={24}>
                            <span> Observações do tombo: </span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('observacoesTombo')(
                                    <TextArea rows={4} />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span> Fotos da exsicata: </span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('fotosExsicata')(
                                        <UploadPicturesComponent
                                            fileList={this.state.fotosExsicata}
                                            beforeUpload={foto => {
                                                this.setState(({ fotosExsicata }) => ({
                                                    fotosExsicata: [
                                                        ...fotosExsicata,
                                                        foto
                                                    ]
                                                }))

                                                return false
                                            }}
                                            onRemove={foto => {
                                                this.setState(({ fotosExsicata: listaAntiga }) => {
                                                    const index = listaAntiga.indexOf(foto)

                                                    const fotosExsicata = listaAntiga
                                                        .filter((item, i) => i !== index)

                                                    return { fotosExsicata }
                                                })
                                            }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span> Fotos em vivo: </span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('fotosVivo')(
                                        <UploadPicturesComponent
                                            fileList={this.state.fotosEmVivo}
                                            beforeUpload={foto => {
                                                this.setState(({ fotosEmVivo }) => ({
                                                    fotosEmVivo: [
                                                        ...fotosEmVivo,
                                                        foto
                                                    ]
                                                }))

                                                return false
                                            }}
                                            onRemove={foto => {
                                                this.setState(({ fotosEmVivo: listaAntiga }) => {
                                                    const index = listaAntiga.indexOf(foto)

                                                    const fotosEmVivo = listaAntiga
                                                        .filter((item, i) => i !== index)

                                                    return { fotosEmVivo }
                                                })
                                            }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    <Divider dashed />
                    {this.state.showTable && (
                        <Row gutter={8}>
                            <Table
                                columns={this.tabelaFotosColunas}
                                dataSource={this.state.fotos}
                                loading={this.state.loading}
                                rowKey="id"
                            />
                        </Row>
                    )}
                    <Row type="flex" justify="end">
                        <Col xs={24} sm={8} md={3} lg={3} xl={3}>
                            <ButtonComponent titleButton="Salvar" />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }

    // fotosTabela = this.state.fotos.map(item => ({
    //     key: item.id,
    //     title: 'operation',
    //     dataIndex: 'operation',
    //     render: (text, record) =>
    //       this.state.dataSource.length >= 1 ? (
    //         <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
    //           <a href="javascript:;">Delete</a>
    //         </Popconfirm>
    //       ) : null,
    //     acao: gerarAcaoFoto(item.id)
    // }))

    mostraMensagemDelete(id) {
        confirm({
            title: 'Você tem certeza que deseja excluir esta foto?',
            content: 'Ao clicar em SIM, a foto será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {

            },
            onCancel() {
            }
        })
    }

    gerarAcaoFoto = id => {
        return (
            <span>
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    renderPorTipo() {
        if (isIdentificador()) {
            return this.renderConteudoIdentificador()
        }
        return this.renderConteudo()
    }

    render() {
        console.log('COLETOOOOOORES')
        console.log(this.props.form.getFieldsValue())
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderPorTipo()}
                </Spin>
            )
        }
        return (
            this.renderPorTipo()
        )
    }
}

export default Form.create()(NovoTomboScreen)
