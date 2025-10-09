import { Component } from 'react'

import {
    Row, Col, Divider, Select, InputNumber,
    Tag, Input, Button, notification, Spin, Modal,
    Radio, Table, Tooltip, Upload, Image
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { formatarDataBRtoEN } from '@/helpers/conversoes/ConversoesData'
import converteDecimalParaGrausMinutosSegundos from '@/helpers/conversoes/Coordenadas'
import { Form } from '@ant-design/compatible'
import {
    DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined
} from '@ant-design/icons'

import BarcodeTableComponent from '../../components/BarcodeTableComponent'
import ButtonComponent from '../../components/ButtonComponent'
import ModalCadastroComponent from '../../components/ModalCadastroComponent'
import UploadPicturesComponent from '../../components/UploadPicturesComponent'
import { fotosBaseUrl, baseUrl } from '../../config/api'
import { isIdentificador } from '../../helpers/usuarios'
import CidadeFormField from './components/CidadeFormField'
import ColecoesAnexasFormField from './components/ColecoesAnexasFormField'
import ColetorFormField from './components/ColetorFormField'
import DataIdentificacaoFormField from './components/DataIdentificacaoFormField'
import EspecieFormField from './components/EspecieFormField'
import EstadoFormField from './components/EstadoFormField'
import ExsicataTipoFormField from './components/ExsicataTipoField'
import FamiliaFormField from './components/FamiliaFormField'
import FaseFormField from './components/FaseFormField'
import GeneroFormField from './components/GeneroFormField'
import IdentificadorFormField from './components/IdentificadorFormField'
import InputFormField from './components/InputFormField'
import LatLongFormField from './components/LatLongFormField'
import LocalColetaFormField from './components/LocalColetaFormField'
import PaisFormField from './components/PaisFormField'
import ReinoFormField from './components/ReinoFormField'
import RelevoFormField from './components/RelevoFormField'
import SoloFormField from './components/SoloFormField'
import SubespecieFormField from './components/SubespecieFormField'
import SubfamiliaFormField from './components/SubfamiliaFormField'
import VariedadeFormField from './components/VariedadeFormField'
import VegetacaoFormField from './components/VegetacaoFormField'
import {
    excluirFotoTomboService, atualizarFotoTomboService, criaCodigoBarrasSemFotosService,
    requisitaDadosEdicaoService, requisitaDadosFormularioService, requisitaIdentificadoresPredicaoService,
    verificaPendenciasService, requisitaCodigoBarrasService, requisitaNumeroHcfService,
    handleSubmitIdentificadorService
} from './TomboService'

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
            render: thumbnail => {
                return (
                    <Image
                        width={120}
                        src={`${fotosBaseUrl}/${thumbnail}`}
                    />
                )
            }
        },
        {
            title: 'Codigo de Barras',
            dataIndex: 'codigo_barra',
            render: codigoBarra => (
                <div width="120">{codigoBarra}</div>
            )
        },
        {
            title: 'Ação',
            dataIndex: 'acao',
            render: (text, record, index) => (
                <>
                    <Row>
                        <Col span={12}>
                            <Tooltip placement="top" title="Excluir">
                                <a href="#" onClick={e => { e.preventDefault(); this.mostraMensagemDeleteCod(record, index) }}>
                                    <DeleteOutlined style={{ color: '#e30613' }} />
                                </a>
                            </Tooltip>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col span={12}>
                            <Tooltip placement="top" title="editar imagem">
                                <Upload
                                    multiple
                                    {...this.props}
                                    beforeUpload={foto => {
                                        this.atualizarFotoTombo(foto, record, index)
                                    }}
                                >
                                    <Tooltip placement="top" title="editar imagem">
                                        <EditOutlined style={{ color: '#FFCC00' }} />
                                    </Tooltip>
                                </Upload>

                            </Tooltip>
                        </Col>
                    </Row>
                </>
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
            formLocalColeta: false,
            loading: false,
            herbarios: [],
            tipos: [],
            paises: [],
            estados: [],
            cidades: [],
            reinos: [],
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
            locaisColeta: [],
            fotosExsicata: [],
            fotosEmVivo: [],
            numeroHcf: 0,
            herbarioInicial: '',
            localidadeInicial: '',
            tipoInicial: '',
            paisInicial: '',
            estadoInicial: '',
            cidadeInicial: '',
            reinoInicial: '1',
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
            idSoloInicial: '',
            idRelevoInicial: '',
            idVegetacaoInicial: '',
            idFaseInicial: '',
            identificadorInicial: '',
            coletoresInicial: '',
            colecaoInicial: '',
            complementoInicial: '',
            latGraus: '',
            latMinutos: '',
            latSegundos: '',
            fotosCadastradas: [],
            longGraus: '',
            longMinutos: '',
            longSegundos: '',
            fotosTeste: [],
            codigoBarras: '',
            dadosFormulario: {},
            editing: Boolean(this.props.match.params.tombo_id),
            autorSubfamilia: '',
            autorEspecie: '',
            autorSubespecie: '',
            autorVariedade: '',
            codigosBarrasForm: [],
            codigosBarrasInicial: [],
            toDeleteBarcodes: [],
            isEditing: false
        }
    }

    componentDidMount() {
        this.carregaInformacoesEdicao()
    }

    carregaInformacoesEdicao = async () => {
        try {
            this.setState({
                loading: true
            })

            await Promise.all([
                this.requisitaDadosFormulario(),
                this.requisitaReinos(),
                this.requisitaFamilias(this.state.reinoInicial)
            ])
        } catch (error) {
            console.error(error)
        } finally {
            this.setState({
                loading: false
            })
        }
    }

    getCodigosTombo = (hcf) => {
        axios
          .get(`/tombos/codigo_barras/${hcf}`)
          .then(({ status, data }) => {
            if (status !== 200 || !Array.isArray(data)) return;

            const parseNumero = (numBarra, codigoBarra) => {
              const inteiro = parseInt(String(numBarra ?? "").split(".")[0], 10);
              if (Number.isFinite(inteiro)) return inteiro;
              return parseInt(String(codigoBarra || "").replace(/\D/g, ""), 10);
            };

            const normalize = (items) =>
              items.map((item) => ({
                id: item.id,
                codigo_barra: String(item.codigo_barra || ""),
                num_barra: parseNumero(item.num_barra, item.codigo_barra),
              }));

            const dedupeByCodigo = (rows) =>
              rows
                .filter((row) => row.codigo_barra)
                .reduce((acc, cur) => {
                  if (!acc.some((x) => x.codigo_barra === cur.codigo_barra)) acc.push(cur);
                  return acc;
                }, []);

            const barcodeEditList = dedupeByCodigo(normalize(data));

            console.log("Loaded barcodes:", barcodeEditList);

            this.setState({ codigosBarrasForm: barcodeEditList });
            this.setState({ codigosBarrasInicial : barcodeEditList });
          })
          .catch(this.catchRequestError);
    };

    handleChangeBarcodeList = (updatedList) => {
        const serialize = (list = []) =>
          list.map(({ codigo_barra, num_barra }) => `${codigo_barra}:${num_barra}`).join("|");

        const previousSignature = serialize(this.state.codigosBarrasForm);
        const nextSignature = serialize(updatedList);

        if (previousSignature !== nextSignature) {
          this.setState({ codigosBarrasForm: updatedList });
        }
    };

    handleDeletedBarcode = ({ codigo_barra, num_barra, id }) => {
        const toInt = (v) => {
            const n = parseInt(String(v ?? "").split(".")[0], 10);
            return Number.isFinite(n) ? n : NaN;
        };

        const deletedNum = toInt(num_barra);
        const deletedCode = String(codigo_barra || "");
    
        this.setState((prev) => {
            const inicial = prev.codigosBarrasInicial || [];
            const existedInInitial = inicial.some((item) => {
                const itemNum = toInt(item?.num_barra);
                const itemCode = String(item?.codigo_barra || "");
                return itemNum === deletedNum || itemCode === deletedCode;
            });

            const nextInicial = inicial.filter((item) => {
                const itemNum = toInt(item?.num_barra);
                const itemCode = String(item?.codigo_barra || "");
                return !(itemNum === deletedNum || itemCode === deletedCode);
            });

            let nextToDelete = prev.toDeleteBarcodes || [];
            if (existedInInitial) {
                const alreadyQueued = nextToDelete.some((x) => {
                    const n = toInt(x?.num_barra);
                    const c = String(x?.codigo_barra || "");
                    return n === deletedNum || c === deletedCode;
                });
                if (!alreadyQueued) {
                    nextToDelete = [
                        ...nextToDelete,
                        { codigo_barra, num_barra: deletedNum, id },
                    ];
                }
            }
    
            return {
                codigosBarrasInicial: nextInicial,
                toDeleteBarcodes: nextToDelete,
            };
        });
    };    


    editarCodigosBarras = async (tomboHcf, currentList) => {
        try {
            const initialList = this.state.codigosBarrasInicial || [];
            const currentBarcodes = currentList || [];
            const deletions = this.state.toDeleteBarcodes || [];
            const isEditing = this.state.isEditing;

            const initialSet = new Set(initialList.map((item) => item.codigo_barra));
            const newBarcodes = currentBarcodes.filter(
                (item) => !initialSet.has(item.codigo_barra)
            );
    
            const ops = [];
    
            if (newBarcodes.length > 0) {
                ops.push(this.criarCodigoBarras(tomboHcf, newBarcodes));
            }
    
            if (isEditing && deletions.length > 0) {
                const deleteRequests = deletions.map((b) =>
                    axios.delete(`/tombos/codigo_barras/${encodeURIComponent(b.num_barra)}`)
                );
                ops.push(Promise.allSettled(deleteRequests));
            }
    
            if (ops.length > 0) {
                await Promise.all(ops);
            }
    
            if (newBarcodes.length > 0 || (isEditing && deletions.length > 0)) {
                message.success("Códigos de barra atualizados com sucesso");
            }

            if (isEditing && deletions.length > 0) {
                this.setState({ toDeleteBarcodes: [] });
            }
        } catch (error) {
            console.error("Erro ao atualizar códigos de barras:", error);
            message.error("Erro ao atualizar os códigos de barras. Tente novamente.");
        }
    };    

    normalizeBarcodes = (barcodeList = []) => {
        const asArray = Array.isArray(barcodeList) ? barcodeList : [barcodeList];

        const integerPart = (val) => {
          const [int] = String(val).split(".");
          const n = parseInt(int, 10);
          return Number.isFinite(n) ? n : NaN;
        };

        const extractNumber = (item) => {
          if (item == null) return NaN;

          // 1) Objeto com num_barra (ex.: "41806.0")
          if (typeof item === "object" && "num_barra" in item) {
            return integerPart(item.num_barra);
          }

          // 2) Objeto com codigo_barra OU string tipo "HCF000041890"
          if ((typeof item === "object" && "codigo_barra" in item) || typeof item === "string") {
            const raw = typeof item === "string" ? item : String(item.codigo_barra || "");
            const n = parseInt(raw.replace(/\D/g, ""), 10);
            return Number.isFinite(n) ? n : NaN;
          }

          // 3) Número puro
          if (typeof item === "number" && Number.isFinite(item)) {
            return Math.trunc(item);
          }

          // 4) Fallback: extrai dígitos de qualquer coisa
          const n = parseInt(String(item).replace(/\D/g, ""), 10);
          return Number.isFinite(n) ? n : NaN;
        };

        const seen = new Set();
        return asArray
          .map(extractNumber)
          .filter((n) => Number.isFinite(n) && n > 0)
          .filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
    };

    criarCodigoBarras = async (id_tombo, barcodeList = []) => {
        const hcf = Number(id_tombo);
        if (!Number.isFinite(hcf)) {
          message.error("Tombo (HCF) inválido.");
          return;
        }

        const numeros = this.normalizeBarcodes(barcodeList);
        if (!numeros.length) {
          message.warning("Nenhum código válido para enviar.");
          return;
        }

        const key = "post-codigos";

        const results = await Promise.allSettled(
          numeros.map((n) => axios.post("/tombos/codigo_barras", { hcf, codigo_barra: n }))
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const fail = results.length - ok;

        if (ok) {
          message.success({ key, content: `Códigos criados: ${ok}${fail ? ` • Falharam: ${fail}` : ""}` });
        } else {
          message.error({ key, content: "Nenhum código foi criado." });
        }
    };


    handleRequisicao = values => {
        const { match } = this.props
        if (match.params.tombo_id) {
            this.editarCodigosBarras(match.params.tombo_id, this.state.codigosBarrasForm)
            const json = this.montaFormularioJsonEdicao(values)
            this.requisitaEdicaoTombo(json)
        } else {
            const json = this.montaFormularioJsonCadastro(values)
            this.requisitaCadastroTombo(json)
        }
    }

    onEditarTomboComSucesso = response => {
        const { data } = response

        this.encontraAutor(data.subfamilias, data.subfamiliaInicial, 'autorSubfamilia')
        this.encontraAutor(data.especies, data.especieInicial, 'autorEspecie')
        this.encontraAutor(data.subespecies, data.subespecieInicial, 'autorSubespecie')
        this.encontraAutor(data.variedades, data.variedadeInicial, 'autorVariedade')

        this.setState(prevState => ({
            ...prevState,
            loading: false,
            ...data
        }))
        this.insereDadosFormulario(data)
    }

    encontraAutor = (lista, valorSelecionado, campoTaxonomiaAutor) => {
        if ((!valorSelecionado && !lista) || Number.isNaN(valorSelecionado)) return

        const itemEncontrado = lista.find(item => item.id === Number(valorSelecionado))

        this.setState({
            [campoTaxonomiaAutor]: itemEncontrado?.autor?.nome || ''
        })
    }

    criaCodigoBarrasSemFotos = emVivo => {
        const { numeroHcf } = this.state
        this.defaultRequest(
            null,
            criaCodigoBarrasSemFotosService,
            'O codigo foi criado com sucesso.',
            'Houve um problema ao criar o codigo, tente novamente.',
            null,
            emVivo,
            numeroHcf
        )
    }

    atualizarFotoTombo = (foto, record) => {
        const tomboCodBar = record.codigo_barra
        this.defaultRequest(
            null,
            atualizarFotoTomboService,
            'A foto foi alterada com sucesso.',
            'Houve um problema ao alterar a foto, tente novamente.',
            null,
            foto,
            tomboCodBar
        )
    }

    excluirFotoTombo = (foto, indice) => {
        const codBarras = foto.codigo_barra
        this.defaultRequest(
            null,
            excluirFotoTomboService,
            'O codigo de barras foi deletado com sucesso.',
            'Houve um problema ao deletar o codigo de barras, tente novamente.',
            null,
            foto,
            indice,
            codBarras
        )
    }

    defaultRequest = async (onFinish, requestService, successMessage, errorMessage, successCalback, ...params) => {
        try {
            await requestService(
                response => {
                    successCalback(response, params)
                    if (successMessage !== '') {
                        this.openNotificationWithIcon('success', 'Sucesso', successMessage)
                    }
                },
                ...params
            )
        } catch (error) {
            console.error(error)
            let message = ''
            if (error) {
                message = `Falha ao carregar os dados do tombo: ${error.message}`
            }

            this.openNotificationWithIcon(
                'warning',
                'Falha',
                message
            )
        } finally {
            this.setState({
                loading: false
            })
            if (onFinish !== null) {
                onFinish()
            }
        }
    }

    requisitaDadosEdicao = id => {
        this.defaultRequest(
            null,
            requisitaDadosEdicaoService,
            '',
            'Houve um problema ao editar os dados do tombo, tente novamente.',
            this.onEditarTomboComSucesso,
            id
        )
    }

    onRequisitarDadosComSucesso = response => {
        const dados = response.data

        const { match } = this.props
        this.setState({
            ...this.state,
            ...dados
        })

        if (match.params.tombo_id) {
            this.setState({ isEditing: true })
            this.setState({ showTable: true })
            this.requisitaDadosEdicao(match.params.tombo_id)
            this.getCodigosTombo(match.params.tombo_id)
        } else {
            this.requisitaNumeroHcf()
            const hcfHerbario = dados.herbarios.find(herbario => herbario.sigla === 'HCF')
            const paisBrasil = dados.paises.find(p => p.nome === 'BRASIL')

            this.setState({
                loading: false,
                herbarioInicial: {
                    value: hcfHerbario?.id
                },
                paisInicial: paisBrasil ? String(paisBrasil.id) : ''
            })

            if (paisBrasil) {
                axios.get('/estados', { params: { id: paisBrasil.id } })
                    .then(estadosResponse => {
                        if (estadosResponse.data && estadosResponse.status === 200) {
                            const estadoParana = estadosResponse.data.find(e => e.nome === 'Paraná')
                            this.setState({
                                estados: estadosResponse.data,
                                estadoInicial: estadoParana ? String(estadoParana.id) : ''
                            })

                            if (estadoParana) {
                                this.requisitaCidades(estadoParana.id)
                            }
                        }
                    })
            }
        }
        this.requisitaIdentificadoresPredicao()
    }

    requisitaDadosFormulario = async () => {
        await this.defaultRequest(
            null,
            requisitaDadosFormularioService,
            '',
            'Houve um problema ao buscar os dados do usuário, tente novamente.',
            this.onRequisitarDadosComSucesso
        )
    }

    onRequisitaIdentificadoresPredicaoComSucesso = response => {
        if (response.status === 200) {
            this.setState({
                identificadores: response.data
            })
        }
    }

    onFinishPredicao = () => {
        this.setState({ fetchingIdentificadores: false })
    }

    requisitaIdentificadoresPredicao = () => {
        this.defaultRequest(
            this.onFinishPredicao,
            requisitaIdentificadoresPredicaoService,
            '',
            'Houve um problema ao buscar o identificador, tente novamente.',
            this.onRequisitaIdentificadoresPredicaoComSucesso
        )
    }

    onVerificaPendenciasComSucesso = response => {
        if (response.data !== null) {
            this.mostraMensagemVerificaPendencia()
        }
    }

    verificaPendencias = tomboId => {
        this.defaultRequest(
            null,
            verificaPendenciasService,
            '',
            'Houve um problema ao verificar as pendencias, tente novamente.',
            this.onVerificaPendenciasComSucesso,
            tomboId
        )
    }

    onRequisitaNumeroColetorComSucesso = response => {
        this.setState(response.data)
        this.props.form.setFields({
            numeroColetor: {
                value: response.data.numero
            }
        })
    }

    onRequisitaCodigoBarrasComSucesso = response => {
        const dados = response.data
        this.setState({
            fotosTeste: dados
        })
    }

    requisitaCodigoBarras = () => {
        const tomboId = this.props.match.params.tombo_id
        this.defaultRequest(
            null,
            requisitaCodigoBarrasService,
            '',
            'Houve um erro ao buscar os codigos de barras, tente novamente.',
            this.onRequisitaCodigoBarrasComSucesso,
            tomboId
        )
    }

    onHandleSubmitIdentificadorComSucesso = () => {
        this.setState({
            loading: false
        })
        this.props.history.goBack()
    }

    handleSubmitIdentificador = e => {
        e.preventDefault()
        const {
            reino, familia, subfamilia, genero, especie, subespecie, variedade
        } = this.props.form.getFieldsValue()
        if ((familia || subfamilia || genero || especie || subespecie || variedade)) {
            this.setState({
                loading: true
            })
            const json = {}

            if (reino) {
                json.reino_id = reino
            }
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
            const tomboId = this.props.match.params.tombo_id
            this.defaultRequest(
                null,
                handleSubmitIdentificadorService,
                'O cadastro foi realizado com sucesso.',
                'Houve um problema ao cadastrar o tombo, tente novamente.',
                this.onHandleSubmitIdentificadorComSucesso,
                tomboId,
                json
            )
        }
    }

    onRequisitaEdicaoTomboComSucesso = async (response, params) => {
        const tombo = response.data

        await axios.put(`/tombos/${this.props.match.params.tombo_id}`, {
            ...params[1]
        })

        this.setState({
            loading: false
        })

        this.props.history.push('/tombos')
    }

    requisitaNumeroHcf = () => {
        axios.get('/tombos/filtrar_ultimo_numero')
            .then(response => {
                if (response.status === 200) {
                    if (this.props.match.params.tombo_id) {
                        this.setState({ numeroHcf: this.props.match.params.tombo_id })
                        this.props.form.setFields({
                            numeroTombo: {
                                value: this.props.match.params.tombo_id
                            }
                        })
                        const date = new Date(response.data.data_tombo)
                        this.props.form.setFields({
                            dataTombo: {
                                value: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                            }
                        })
                        this.requisitaCodigoBarras()
                        this.verificaPendencias(this.props.match.params.tombo_id)
                    } else {
                        this.setState({ numeroHcf: response.data.hcf + 1 })
                        this.props.form.setFields({
                            numeroTombo: {
                                value: response.data.hcf + 1
                            }
                        })
                        const date = new Date()
                        this.props.form.setFields({
                            dataTombo: {
                                value: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                            }
                        })
                    }
                } else {
                    this.openNotification(
                        'error',
                        'Falha',
                        'Houve um problema ao buscar o numero de coletor sugerido, tente novamente.'
                    )
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
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao buscar os estados desse país, tente novamente.'
                    )
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

    cadastraNovoTipo = () => {
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

    cadastraNovoReino = () => {
        this.setState({
            loading: true
        })
        axios.post('/reinos', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaReinos()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                this.props.form.setFields({ campo: { value: '' } }) // eslint-disable-line
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
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo reino, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaFamilia = () => {
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
            .finally(() => {
                this.setState({
                    autorSubfamilia: '',
                    autorEspecie: '',
                    autorSubespecie: '',
                    autorVariedade: ''
                })
            })
    }

    requisitaReinos = async () => {
        return axios.get('/reinos', {
            params: {
                limite: 9999999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        reinos: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar reinos, tente novamente.')
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar a listagem dos reinos, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaFamilias = async (reinoId) => {
        try {
            const params = { limite: 9999999999 }
            if (reinoId) {
                params.reino_id = reinoId
            }

            const response = await axios.get('/familias', { params })

            if (response.status === 200) {
                this.setState({
                    familias: response.data.resultado
                })
            } else {
                this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar famílias, tente novamente.')
            }
        } catch (err) {
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                this.openNotificationWithIcon('warning', 'Falha', error.message)
            } else {
                throw err
            }
        }
    }

    cadastraNovaSubfamilia = () => {
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon('warning', 'Falha', 'Selecione uma família para cadastrar uma subfamília.')
        } else {
            axios.post('/subfamilias', {
                nome: this.props.form.getFieldsValue().campo,
                familia_id: this.props.form.getFieldsValue().familia
            })
                .then(response => {
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
        this.setState({
            loading: true
        })
        axios.get('/subfamilias', {
            params: {
                familia_id: id,
                limite: 999999999
            }
        })
            .then(response => {
                this.setState({
                    loading: false
                })
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
                    },
                    loading: false
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

    cadastraNovoGenero = () => {
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
        this.setState({
            loading: true
        })
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
                    },
                    loading: false
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
                    },
                    loading: false
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

    cadastraNovaEspecie = () => {
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
        this.setState({
            loading: true
        })
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
                    },
                    loading: false
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
                    },
                    loading: false
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

    cadastraNovaSubespecie = () => {
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
        this.setState({
            loading: true
        })
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
                    },
                    loading: false
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
                    },
                    loading: false
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

    cadastraNovaVariedade = () => {
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
        this.setState({
            loading: true
        })
        axios.get('/variedades', {
            params: {
                especie_id: id,
                limite: 999999999
            }
        })
            .then(response => {
                this.setState({
                    loading: false,
                    search: {
                        variedade: ''
                    }
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
                    },
                    loading: false
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

    cadastraNovoAutor = () => {
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

    cadastraNovoSolo = () => {
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

    cadastraNovoRelevo = () => {
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

    cadastraNovaVegetacao = () => {
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

    cadastraNovoColetor = () => {
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

    cadastraNovoLocalColeta = () => {
        this.setState({ loading: true })
        const { form } = this.props
        const { getFieldsValue, getFieldValue } = form
        const { descricaoLocalColeta } = getFieldsValue()
        const cidadeId = getFieldValue('cidade')
        const faseSucessionalId = getFieldValue('fases')

        if (!cidadeId) {
            this.openNotificationWithIcon('warning', 'Atenção', 'Selecione uma cidade para cadastrar um local de coleta.')
            this.setState({ loading: false })
            return
        }

        const payload = {
            descricao: descricaoLocalColeta,
            cidade_id: cidadeId
        }

        if (faseSucessionalId) {
            payload.fase_sucessional_id = faseSucessionalId
        }

        axios.post('/locais-coleta', payload)
            .then(response => {
                if (response.status === 201) {
                    this.requisitaLocaisColeta('')
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                }
                form.setFields({
                    descricaoLocalColeta: { value: '' }
                })
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    this.openNotificationWithIcon('error', 'Falha', response.data.error?.message || 'Houve um problema ao cadastrar o novo local de coleta.')
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo local de coleta, tente novamente.')
                }
            })
            .finally(() => {
                this.setState({ loading: false })
            })
    }

    requisitaLocaisColeta = id => {
        const cidadeId = id || this.props.form.getFieldValue('cidade')
        if (!cidadeId) {
            this.openNotificationWithIcon('warning', 'Atenção', 'Por favor, selecione uma cidade primeiro.')
            return
        }

        this.setState({
            locaisColeta: [],
            fetchingLocaisColeta: true
        })
        axios.get('/locais-coleta', { params: { cidade_id: cidadeId, getAll: 'true' } })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        locaisColeta: response.data.resultado
                    })
                }
                this.setState({ fetchingLocaisColeta: false })
            })
            .catch(err => {
                this.setState({ fetchingLocaisColeta: false })
                const { response } = err
                if (response && response.data) {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao requisitar os locais de coleta, tente novamente.')
                }
            })
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

    requisitaEdicaoTombo = json => {
        const tomboId = this.props.match.params.tombo_id
        this.defaultRequest(
            null,
            requisitaNumeroHcfService,
            'A alteração foi realizada com sucesso.',
            'Houve um problema ao alterar o tombo, tente novamente.',
            this.onRequisitaEdicaoTomboComSucesso,
            tomboId,
            json
        )
    }


    requisitaCadastroTombo = json => {
        axios.post('/tombos', { json })
            .then(response => {
                if (response.status === 201) {
                    const tombo = response.data
                    this.criarCodigoBarras(tombo.hcf, this.state.codigosBarrasForm)
                }
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                this.props.history.push('/tombos')
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
                    console.error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    openNotification = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    mostraMensagemDeleteCod(foto, indice) {
        confirm({
            title: 'Você tem certeza que deseja excluir esta foto?',
            content: 'Ao clicar em SIM, a foto será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk: () => {
                this.excluirFotoTombo(foto, indice)
            },
            onCancel: () => {
            }
        })
    }

    insereDadosFormulario = dados => {
        const { form } = this.props
        this.setState({ dadosFormulario: dados })
        let insereState = {
            estados: dados.estados,
            cidades: dados.cidades,
            subfamilias: dados.subfamilias,
            generos: dados.generos,
            especies: dados.especies,
            subespecies: dados.subespecies,
            variedades: dados.variedades
        }

        this.requisitaFamilias()

        if (dados.familiaInicial) {
            this.requisitaSubfamilias(dados.familiaInicial)
            this.requisitaGeneros(dados.familiaInicial)
        }

        if (dados.generoInicial) {
            this.requisitaEspecies(dados.generoInicial)
        }

        if (dados.especieInicial) {
            this.requisitaSubespecies(dados.especieInicial)
            this.requisitaVariedades(dados.especieInicial)
        }

        if (dados.coletor) {
            form.setFields({
                coletores: {
                    value: {
                        key: dados.coletor.id,
                        label: dados.coletor.nome
                    }
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

            insereState = {
                ...insereState,
                longGraus: dados.localizacao.long_graus,
                longMinutos: dados.localizacao.long_min,
                longSegundos: dados.localizacao.latitude_sec
            }
        }
        this.setState({
            ...insereState
        })

        if (dados.retorno && dados.retorno.identificadores && dados.retorno.identificadores.length > 0) {
            const identificadoresParaFormulario = dados.retorno.identificadores
                .sort((a, b) => a.tombos_identificadores.ordem - b.tombos_identificadores.ordem)
                .map(identificador => ({
                    key: identificador.id,
                    label: identificador.nome
                }))

            form.setFields({
                identificador: {
                    value: identificadoresParaFormulario
                }
            })
        }

        const date = new Date(dados.data_tombo)

        form.setFields({
            numeroTombo: {
                value: dados.hcf
            },
            dataTombo: {
                value: `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`
            },
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
                value: dados.descricao
            },
            unicata: {
                value: dados.unicata
            },
            complemento: {
                value: {
                    key: dados.local_coleta.id,
                    label: dados.local_coleta.descricao
                }
            },
            autorEspecie: {
                value: dados.complemento
            },
            coletoresComplementares: {
                value: dados.retorno.coletor_complementar?.complementares
            }
        })

        if (dados.cidadeInicial) {
            this.requisitaLocaisColeta(dados.cidadeInicial)
        }
    }

    mostraMensagemVerificaPendencia = () => {
        confirm({
            title: 'Pendência',
            content: 'Este tombo possui pendências não resolvidas, deseja continuar alterando?',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk: () => {
            },
            onCancel: () => {
                window.history.go(-1)
            }
        })
    }

    handleSubmit = e => {
        e.preventDefault()
        const { form } = this.props
        form.validateFields((err, values) => {
            if (!(form.getFieldsValue().dataColetaDia
                || form.getFieldsValue().dataColetaMes
                || form.getFieldsValue().dataColetaAno)) {
                this.openNotificationWithIcon(
                    'warning',
                    'Falha',
                    'É necessário pelo menos o dia ou o mês ou o ano da data de coleta para o cadastro.'
                )
                return false
            }
            if (err != null) {
                console.log(err)
                this.openNotificationWithIcon('warning', 'Falha', 'Preencha todos os dados requiridos.')
            } else {
                this.handleRequisicao(values)
                this.setState({
                    loading: true
                })
            }
            return true
        })
    }

    normalizaDataTombo = valor => {
        if (!valor) return null
        if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor
        const convertido = formatarDataBRtoEN(valor)
        return convertido || null
    }

    montaFormularioJsonEdicao = values => {
        const {
            altitude, autorEspecie, autorVariedade, autoresSubespecie, cidade, coletores, coletoresComplementares, complemento,
            dataColetaAno, dataColetaDia, dataColetaMes, dataIdentAno, dataIdentDia, dataIdentMes,
            especie, reino, familia, fases, genero, identificador, latitude, localidadeCor, longitude,
            nomePopular, numColeta, observacoesColecaoAnexa, observacoesTombo, relevo, solo,
            subespecie, subfamilia, tipo, tipoColecaoAnexa, variedade, vegetacao, entidade, relevoDescricao, unicata, dataTombo
        } = values

        const isUserIdentificador = isIdentificador()

        const json = {}

        const extrairId = valor => {
            if (typeof valor === 'object' && valor.key) {
                return parseInt(valor.key)
            }
            if (typeof valor === 'string' && valor.trim() !== '') {
                return parseInt(valor)
            }
            if (typeof valor === 'number') {
                return valor
            }
            return null
        }

        const normalizarIdentificadores = identificadores => {
            if (!identificadores || !Array.isArray(identificadores)) {
                return null
            }

            return identificadores.map(item => {
                if (typeof item === 'object' && item.key) {
                    return parseInt(item.key)
                }
                return item
            })
        }

        if (isUserIdentificador) {
            json.taxonomia = {
                reino_id: reino ? parseInt(reino) : null,
                familia_id: familia ? parseInt(familia) : null,
                sub_familia_id: subfamilia ? parseInt(subfamilia) : null,
                genero_id: genero ? parseInt(genero) : null,
                especie_id: especie ? parseInt(especie) : null,
                sub_especie_id: subespecie ? parseInt(subespecie) : null,
                variedade_id: variedade ? parseInt(variedade) : null
            }

            return json
        }

        const soloId = extrairId(solo)
        const relevoId = extrairId(relevo)
        const vegetacaoId = extrairId(vegetacao)

        json.principal = {
            entidade_id: parseInt(entidade),
            numero_coleta: parseInt(numColeta)
        }

        json.principal.nome_popular = nomePopular || null
        json.principal.tipo_id = tipo ? parseInt(tipo) : null
        json.principal.cor = localidadeCor || null
        json.principal.data_tombo = this.normalizaDataTombo(dataTombo)

        if (dataColetaDia || dataColetaMes || dataColetaAno) {
            json.principal.data_coleta = {
                dia: dataColetaDia || null,
                mes: dataColetaMes || null,
                ano: dataColetaAno || null
            }
        }

        json.taxonomia = {
            reino_id: reino ? parseInt(reino) : null,
            familia_id: familia ? parseInt(familia) : null,
            sub_familia_id: subfamilia ? parseInt(subfamilia) : null,
            genero_id: genero ? parseInt(genero) : null,
            especie_id: especie ? parseInt(especie) : null,
            sub_especie_id: subespecie ? parseInt(subespecie) : null,
            variedade_id: variedade ? parseInt(variedade) : null
        }

        json.localidade = {
            cidade_id: parseInt(cidade),
            latitude: latitude ? converteDecimalParaGrausMinutosSegundos(latitude, false, true) : null,
            longitude: longitude ? converteDecimalParaGrausMinutosSegundos(longitude, true, true) : null,
            altitude: altitude ? parseInt(altitude) : null,
            local_coleta_id: complemento ? parseInt(complemento.key) : null
        }

        json.paisagem = {
            solo_id: soloId,
            relevo_id: relevoId,
            vegetacao_id: vegetacaoId,
            fase_sucessional_id: fases ? parseInt(fases) : null,
            descricao: relevoDescricao || null
        }

        json.identificacao = {
            identificadores: normalizarIdentificadores(identificador)
        }

        if (dataIdentDia || dataIdentMes || dataIdentAno) {
            json.identificacao.data_identificacao = {
                dia: dataIdentDia || null,
                mes: dataIdentMes || null,
                ano: dataIdentAno || null
            }
        } else {
            json.identificacao.data_identificacao = null
        }

        json.coletor = coletores.key

        json.coletor_complementar = {
            complementares: coletoresComplementares || null
        }

        json.colecoes_anexas = {
            tipo: tipoColecaoAnexa || null,
            observacoes: observacoesColecaoAnexa || null
        }

        json.observacoes = observacoesTombo || null

        json.autores = {
            especie: autorEspecie || null,
            subespecie: autoresSubespecie || null,
            variedade: autorVariedade || null
        }

        json.unicata = unicata

        return json
    }

    montaFormularioJsonCadastro = values => {
        const {
            altitude, autorEspecie, autorVariedade, autoresSubespecie, cidade, coletores, coletoresComplementares, complemento,
            dataColetaAno, dataColetaDia, dataColetaMes, dataIdentAno, dataIdentDia, dataIdentMes,
            especie, reino, familia, fases, genero, identificador, latitude, localidadeCor, longitude,
            nomePopular, numColeta, observacoesColecaoAnexa, observacoesTombo, relevo, solo,
            subespecie, subfamilia, tipo, tipoColecaoAnexa, variedade, vegetacao, entidade, relevoDescricao, unicata, dataTombo
        } = values
        const json = {}

        const extrairId = valor => {
            if (typeof valor === 'object' && valor.key) {
                return parseInt(valor.key)
            }
            if (typeof valor === 'string' && valor.trim() !== '') {
                return parseInt(valor)
            }
            if (typeof valor === 'number') {
                return valor
            }
            return null
        }

        const normalizarIdentificadores = identificadores => {
            if (!identificadores || !Array.isArray(identificadores)) {
                return identificadores
            }

            return identificadores.map(item => {
                if (typeof item === 'object' && item.key) {
                    return parseInt(item.key)
                }
                return item
            })
        }

        const soloId = extrairId(solo)
        const relevoId = extrairId(relevo)
        const vegetacaoId = extrairId(vegetacao)

        if (nomePopular) json.principal = { nome_popular: nomePopular }
        json.principal = { ...json.principal, data_tombo: this.normalizaDataTombo(dataTombo) }
        json.principal = { ...json.principal, entidade_id: parseInt(entidade) }
        json.principal.numero_coleta = parseInt(numColeta)
        if (dataColetaDia) json.principal.data_coleta = { dia: dataColetaDia }
        if (dataColetaMes) json.principal.data_coleta = { ...json.principal.data_coleta, mes: dataColetaMes }
        if (dataColetaAno) json.principal.data_coleta = { ...json.principal.data_coleta, ano: dataColetaAno }
        if (tipo) json.principal.tipo_id = tipo
        if (localidadeCor)json.principal.cor = localidadeCor
        if (reino) json.taxonomia = { reino_id: reino }
        if (familia) json.taxonomia = { ...json.taxonomia, familia_id: familia }
        if (genero) json.taxonomia = { ...json.taxonomia, genero_id: genero }
        if (subfamilia) json.taxonomia = { ...json.taxonomia, sub_familia_id: subfamilia }
        if (especie) json.taxonomia = { ...json.taxonomia, especie_id: especie }
        if (variedade) json.taxonomia = { ...json.taxonomia, variedade_id: variedade }
        if (subespecie) json.taxonomia = { ...json.taxonomia, sub_especie_id: subespecie }
        if (latitude) json.localidade = { latitude: converteDecimalParaGrausMinutosSegundos(latitude, false, true) }
        if (longitude) json.localidade = { ...json.localidade, longitude: converteDecimalParaGrausMinutosSegundos(longitude, true, true) }
        if (altitude) json.localidade = { ...json.localidade, altitude }
        json.localidade = { ...json.localidade, cidade_id: parseInt(cidade) }
        if (complemento) {
            json.localidade = { ...json.localidade, local_coleta_id: parseInt(complemento.key) }
        }
        if (solo) json.paisagem = { ...json.paisagem, solo_id: soloId }
        if (relevoDescricao) json.paisagem = { ...json.paisagem, descricao: relevoDescricao }
        if (relevo) json.paisagem = { ...json.paisagem, relevo_id: relevoId }
        if (vegetacao) json.paisagem = { ...json.paisagem, vegetacao_id: vegetacaoId }
        if (fases) json.paisagem = { ...json.paisagem, fase_sucessional_id: fases }
        if (identificador) json.identificacao = { identificadores: normalizarIdentificadores(identificador) }
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

        json.coletor = coletores.key
        if (coletoresComplementares) json.coletor_complementar = { complementares: coletoresComplementares }
        if (tipoColecaoAnexa) json.colecoes_anexas = { tipo: tipoColecaoAnexa }
        if (observacoesColecaoAnexa) json.colecoes_anexas = { ...json.colecoes_anexas, observacoes: observacoesColecaoAnexa }
        if (observacoesTombo) json.observacoes = observacoesTombo
        if (autorEspecie) json.autores = { especie: autorEspecie }
        if (autoresSubespecie) json.autores = { ...json.autores, subespecie: autoresSubespecie }
        if (autorVariedade) json.autores = { ...json.autores, variedade: autorVariedade }
        if (unicata !== undefined) json.unicata = unicata
        return json
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

    optionAutores = () => this.state.autores.map(item => (
        <Option value={`${item.id}`}>{item.nome}</Option>
    ))

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description,
            duration: 10
        })
    }

    mostraMensagemDelete = id => {
        confirm({
            title: 'Você tem certeza que deseja excluir esta foto?',
            content: 'Ao clicar em SIM, a foto será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk: () => {

            },
            onCancel: () => {
            }
        })
    }

    handleChangeColetores = valores => {
        this.setState({
            fetchingColetores: false,
            valoresColetores: valores,
            coletores: []
        })
    }

    handleChangeIdentificadores = valor => {
        this.setState({
            fetchingIdentificadores: false,
            identificadorInicial: `${valor}`,
            identificadores: []
        })
    }

    ajustaColetores = value => {
        if (value) {
            axios.get(`/tombos/numeroColetor/${value.key}`)
                .then(response => {
                    if (response.status === 200) {
                        const todosNumeros = response.data
                        todosNumeros.sort((a, b) => b.numero_coleta - a.numero_coleta)

                        this.props.form.setFields({
                            numColeta: {
                                value: todosNumeros.length === 0 || todosNumeros[0].numero_coleta === null ? 1 : todosNumeros[0].numero_coleta + 1
                            }
                        })
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    validacaoModal = () => {
        if (this.state.formColetor) {
            if (!this.props.form.getFieldsValue().nomeColetor || !this.props.form.getFieldsValue().numeroColetor) {
                this.openNotificationWithIcon('warning', 'Falha', 'O nome e o número do coletor são obrigatórios.')
                return false
            }
            return true
        }
        if (this.state.formLocalColeta) {
            if (!this.props.form.getFieldsValue().descricaoLocalColeta) {
                this.openNotificationWithIcon('warning', 'Falha', 'A descrição do local de coleta é obrigatória.')
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

    renderColetores = (getFieldDecorator, getFieldError) => {
        const {
            coletoresInicial, coletores, search, fetchingColetores, valoresColetores
        } = this.state
        return (
            <div>
                <Row gutter={8}>
                    <Col span={12}>
                        <ColetorFormField
                            initialValue={String(coletoresInicial)}
                            coletores={coletores}
                            validateStatus={search.coletor}
                            getFieldDecorator={getFieldDecorator}
                            onChange={value => {
                                this.ajustaColetores(value)
                            }}
                            onClickAddMore={() => {
                                this.setState({
                                    formulario: {
                                        tipo: 11
                                    },
                                    formColetor: true,
                                    visibleModal: true
                                })
                            }}
                            style={{ width: '100%' }}
                            notFoundContent={fetchingColetores ? <Spin size="small" /> : null}
                            labelInValue
                            value={valoresColetores}
                            placeholder="Selecione os coletores"
                            filterOption={false}
                            onSearch={value => {
                                this.requisitaColetores(value)
                            }}
                            status={getFieldError('coletores') ? 'error' : ''}
                            others={{allowClear: true}}
                        />
                    </Col>

                    <Col span={12}>
                        <Row gutter={8}>
                            <Col span={24}>
                                <span>
                                    Coletores complementares:
                                </span>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('coletoresComplementares')(
                                        <Input placeholder="" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        )
    }

    renderColecoesAnexas = getFieldDecorator => {
        const { colecaoInicial, value } = this.state
        return (
            <div>
                <Row gutter={8}>
                    <ColecoesAnexasFormField
                        getFieldDecorator={getFieldDecorator}
                        colecaoInicial={colecaoInicial}
                        value={value}
                        onChange={this.onChange}
                    />
                </Row>
            </div>
        )
    }

    renderExsicataTipo = getFieldDecorator => {
        const { value } = this.state
        return (
            <ExsicataTipoFormField
                getFieldDecorator={getFieldDecorator}
                value={value}
                onChange={this.onChange}
            />
        )
    }

    renderFormulario = getFieldDecorator => {
        if (this.state.formColetor) {
            return (
                <div>
                    <Row gutter={8}>
                        <InputFormField
                            name="nomeColetor"
                            title="Nome:"
                            getFieldDecorator={getFieldDecorator}
                        />
                        <InputFormField
                            name="emailColetor"
                            title="E-mail:"
                            getFieldDecorator={getFieldDecorator}
                        />
                        <InputFormField
                            name="numeroColetor"
                            title="Nº Coletor:"
                            getFieldDecorator={getFieldDecorator}
                        />
                    </Row>
                </div>
            )
        }
        if (this.state.formLocalColeta) {
            return (
                <div>
                    <Row gutter={8}>
                        <InputFormField
                            name="descricaoLocalColeta"
                            title="Descrição:"
                            getFieldDecorator={getFieldDecorator}
                        />
                    </Row>
                </div>
            )
        }
        if (this.state.formComAutor) {
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

    renderConteudoIdentificador = () => {
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
                                    case 8:
                                        this.cadastraNovoReino()
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

    renderLocalTombo = (getFieldDecorator, getFieldError) => {
        const {
            paisInicial, estadoInicial, cidadeInicial,
            paises, estados, cidades
        } = this.state
        return (
            <div>
                <Row gutter={8}>
                    <LatLongFormField getFieldDecorator={getFieldDecorator} />
                </Row>
                <br />
                <Row gutter={8}>
                    <PaisFormField
                        initialValue={String(paisInicial)}
                        paises={paises}
                        getFieldDecorator={getFieldDecorator}
                        rules={[{
                            required: true,
                            message: 'Escolha um país'
                        }]}
                        onChange={value => {
                            this.requisitaEstados(value)
                        }}
                        status={getFieldError('pais') ? 'error' : ''}
                    />
                    <EstadoFormField
                        initialValue={String(estadoInicial)}
                        estados={estados}
                        getFieldDecorator={getFieldDecorator}
                        rules={[{
                            required: true,
                            message: 'Escolha um estado'
                        }]}
                        onChange={value => {
                            this.requisitaCidades(value)
                        }}
                        status={getFieldError('estado') ? 'error' : ''}
                    />
                    <CidadeFormField
                        initialValue={String(cidadeInicial)}
                        cidades={cidades}
                        getFieldDecorator={getFieldDecorator}
                        onChange={value => {
                            this.props.form.setFieldsValue({ complemento: undefined })
                            this.requisitaLocaisColeta(value)
                        }}
                        getFieldError={getFieldError}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <LocalColetaFormField
                        getFieldDecorator={getFieldDecorator}
                        initialValue={this.state.complementoInicial}
                        locaisColeta={this.state.locaisColeta}
                        fetchingLocaisColeta={this.state.fetchingLocaisColeta}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo local de coleta',
                                    tipo: 13
                                },
                                formLocalColeta: true,
                                visibleModal: true
                            })
                        }}
                        getFieldError={getFieldError}
                    />
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

    renderFamiliaTombo = (getFieldDecorator, getFieldError) => {
        const {
            reinoInicial, familiaInicial, reinos, familias, generoInicial, generos, search,
            especieInicial, especies, subespecieInicial, subespecies,
            variedadeInicial, variedades, subfamiliaInicial, subfamilias
        } = this.state
        return (
            <div>
                {this.props.match.params.tombo_id && (
                    <Row gutter={8} style={{ fontSize: 16, marginLeft: 5 }}>
                        Editar dados Tombo
                    </Row>
                )}
                <Row justify="end" gutter={8}>
                    <Button
                        type="secondary"
                    >
                        <Link
                            to="/tombos"
                        >
                            Sair/Cancelar
                        </Link>
                    </Button>
                </Row>
                <Row gutter={8}>
                    <InputFormField
                        name="numeroTombo"
                        title="Numero de Tombo:"
                        disabled
                        getFieldDecorator={getFieldDecorator}
                    />
                    <InputFormField
                        name="dataTombo"
                        title="Data do Tombo:"
                        getFieldDecorator={getFieldDecorator}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <ReinoFormField
                        initialValue={String(reinoInicial)}
                        reinos={reinos}
                        getFieldDecorator={getFieldDecorator}
                        onChange={value => {
                            this.requisitaFamilias(value)
                            this.setState({
                                search: {
                                    familia: 'validating'
                                },
                                autorSubfamilia: '',
                                autorEspecie: '',
                                autorSubespecie: '',
                                autorVariedade: ''
                            })
                            this.props.form.setFields({
                                familia: {
                                    value: ''
                                },
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
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo reino',
                                    tipo: 12
                                },
                                visibleModal: true
                            })
                        }}
                    />
                    <FamiliaFormField
                        initialValue={String(familiaInicial)}
                        familias={familias}
                        getFieldDecorator={getFieldDecorator}
                        getFieldError={getFieldError}
                        onChange={value => {
                            this.requisitaSubfamilias(value)
                            this.requisitaGeneros(value)
                            this.setState({
                                search: {
                                    subfamilia: 'validating',
                                    genero: 'validating'
                                },
                                autorSubfamilia: '',
                                autorEspecie: '',
                                autorSubespecie: '',
                                autorVariedade: ''
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
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova família',
                                    tipo: 1
                                },
                                visibleModal: true
                            })
                        }}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <SubfamiliaFormField
                        initialValue={String(subfamiliaInicial)}
                        subfamilias={subfamilias}
                        validateStatus={search.subfamilia}
                        getFieldDecorator={getFieldDecorator}
                        onChange={value => this.encontraAutor(subfamilias, value, 'autorSubfamilia')}
                        autor={this.state.autorSubfamilia}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: 'do novo subfamília',
                                    tipo: 2
                                },
                                visibleModal: true
                            })
                        }}
                    />
                    <GeneroFormField
                        initialValue={String(generoInicial)}
                        generos={generos}
                        validateStatus={search.genero}
                        getFieldDecorator={getFieldDecorator}
                        onChange={value => {
                            this.requisitaEspecies(value)
                            this.setState({
                                search: {
                                    especie: 'validating'
                                },
                                autorEspecie: '',
                                autorSubespecie: '',
                                autorVariedade: ''
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
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo gênero',
                                    tipo: 3
                                },
                                visibleModal: true
                            })
                        }}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <EspecieFormField
                        initialValue={String(especieInicial)}
                        especies={especies}
                        validateStatus={search.especie}
                        getFieldDecorator={getFieldDecorator}
                        autor={this.state.autorEspecie}
                        onChange={value => {
                            this.requisitaSubespecies(value)
                            this.requisitaVariedades(value)
                            this.setState({
                                search: {
                                    subespecie: 'validating',
                                    variedade: 'validating'
                                },
                                formComAutor: true,
                                autorSubespecie: '',
                                autorVariedade: ''
                            })
                            this.props.form.setFields({
                                subespecie: {
                                    value: ''
                                },
                                variedade: {
                                    value: ''
                                }
                            })

                            this.encontraAutor(especies, value, 'autorEspecie')
                        }}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova espécie',
                                    tipo: 4
                                },
                                formComAutor: true,
                                visibleModal: true
                            })
                        }}
                    />
                    <SubespecieFormField
                        initialValue={String(subespecieInicial)}
                        subespecies={subespecies}
                        validateStatus={search.subespecie}
                        getFieldDecorator={getFieldDecorator}
                        autor={this.state.autorSubespecie}
                        onChange={value => {
                            this.encontraAutor(subespecies, value, 'autorSubespecie')

                            this.setState({
                                autorVariedade: ''
                            })
                        }}
                        onClickAddMore={() => {
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
                </Row>
                <br />
                <Row gutter={8}>
                    <VariedadeFormField
                        initialValue={String(variedadeInicial)}
                        variedades={variedades}
                        validateStatus={search.variedade}
                        getFieldDecorator={getFieldDecorator}
                        autor={this.state.autorVariedade}
                        onChange={value => this.encontraAutor(variedades, value, 'autorVariedade')}
                        onClickAddMore={() => {
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
                </Row>
            </div>
        )
    }

    renderTipoSoloTombo = getFieldDecorator => {
        const {
            soloInicial, search, solos, relevos, faseInicial,
            relevoInicial, vegetacaoInicial, vegetacoes, fases, idSoloInicial, idRelevoInicial, idVegetacaoInicial, idFaseInicial
        } = this.state
        return (
            <div>
                <Row gutter={8}>
                    <SoloFormField
                        initialValue={idSoloInicial ? {
                            key: idSoloInicial,
                            label: soloInicial
                        } : undefined}
                        solos={solos}
                        validateStatus={search.solo}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: 'do novo solo',
                                    tipo: 8
                                },
                                visibleModal: true
                            })
                        }}
                    />
                    <RelevoFormField
                        initialValue={idRelevoInicial ? {
                            key: idRelevoInicial,
                            label: relevoInicial
                        } : undefined}
                        relevos={relevos}
                        validateStatus={search.relevo}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: 'do novo relevo',
                                    tipo: 9
                                },
                                visibleModal: true
                            })
                        }}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <VegetacaoFormField
                        initialValue={idVegetacaoInicial ? {
                            key: idVegetacaoInicial,
                            label: vegetacaoInicial
                        } : undefined}
                        vegetacoes={vegetacoes}
                        validateStatus={search.vegetacao}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: 'da nova vegetação',
                                    tipo: 10
                                },
                                visibleModal: true
                            })
                        }}
                    />
                    <FaseFormField
                        initialValue={idFaseInicial ? {
                            key: idFaseInicial,
                            label: faseInicial
                        } : undefined}
                        fases={fases}
                        validateStatus={search.fase}
                        getFieldDecorator={getFieldDecorator}
                    />
                </Row>
            </div>
        )
    }

    renderIdentificador = (getFieldDecorator, getFieldError) => {
        const { identificadores, identificadorInicial, identificadorNome } = this.state
        const initialValue = identificadorInicial ? { key: String(identificadorInicial), label: identificadorNome } : undefined
        return (
            <div>
                <Row gutter={8}>
                    <IdentificadorFormField
                        initialValue={initialValue}
                        identificadores={identificadores}
                        getFieldDecorator={getFieldDecorator}
                        showSearch
                        style={{ width: '100%' }}
                        optionFilterProp="children"
                        // onChange={this.handleChangeIdentificadores}
                        placeholder="Selecione o idenficador"
                        getFieldError={getFieldError}
                        onSearch={value => {
                            this.requisitaIdentificadores(value)
                        }}
                        filterOption={false}
                    />
                    <DataIdentificacaoFormField getFieldDecorator={getFieldDecorator} />
                </Row>
            </div>
        )
    }

    renderConteudo = () => {
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
                                    formComAutor: false,
                                    formLocalColeta: false
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
                                    case 12:
                                        this.cadastraNovoReino()
                                        break
                                    case 13:
                                        this.cadastraNovoLocalColeta()
                                        break
                                    default:
                                        break
                                }
                            }

                            this.setState({
                                visibleModal: false,
                                formComAutor: false,
                                formColetor: 0,
                                formLocalColeta: false
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
                    {this.renderFamiliaTombo(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderColetores(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderPrincipaisCaracteristicas(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderLocalTombo(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderTipoSoloTombo(getFieldDecorator)}
                    <Divider dashed />
                    {this.renderIdentificador(getFieldDecorator, getFieldError)}
                    <Divider dashed />
                    {this.renderColecoesAnexas(getFieldDecorator)}
                    <Divider dashed />
                    <Row gutter={8}>
                        <Col span={24}>
                            <span> Observações do tombo: </span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={20}>
                            <FormItem>
                                {getFieldDecorator('observacoesTombo')(
                                    <TextArea rows={4} />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            {this.renderExsicataTipo(getFieldDecorator)}
                        </Col>
                    </Row>
                    <br />
                    <Divider />
                    <Row gutter={8}>
                        <BarcodeTableComponent
                            barcodeEditList={this.state.codigosBarrasForm}
                            onDeletedBarcode={this.handleDeletedBarcode}
                            onChangeBarcodeList={this.handleChangeBarcodeList}
                            isEditing={this.state.isEditing}
                        />
                    </Row>
                    <br />
                    {' '}
                    <br />
                    <Row gutter={8}>
                        {/* <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
                    <br />
                    <br />
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span> Exsicata sem foto: </span>
                            </Col>
                            <Col span={8}>
                                <Button onClick={() => this.criaCodigoBarrasSemFotos(false)}>
                                    <UploadOutlined />
                                    {' '}
                                    Enviar
                                </Button>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span> Em vivo sem foto: </span>
                            </Col>
                            <Col span={8}>
                                <Button onClick={() => this.criaCodigoBarrasSemFotos(true)}>
                                    <UploadOutlined />
                                    {' '}
                                    Enviar
                                </Button>
                            </Col>
                        </Col> */}
                    </Row>
                    <Divider dashed />
                    {/* {this.state.showTable && this.props.match.params.tombo_id && (
                        <Row gutter={8}>
                            <Table
                                columns={this.tabelaFotosColunas}
                                dataSource={this.state.fotos}
                                loading={this.state.loading}
                                rowKey="id"
                            />
                        </Row>
                    )} */}
                    <Row type="flex" justify="start" gutter={8}>
                        {/* <Col>
                            <Button
                                disabled={!this.props.match.params.tombo_id}
                                type="primary"
                            >
                                <Link
                                    to={{
                                        pathname: `${baseUrl}/fichas/tombos/${this.state.numeroHcf}/1`
                                    }}
                                    target="_blank"
                                >
                                    {' '}
                                    imprimir ficha c/ código
                                </Link>
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                disabled={!this.props.match.params.tombo_id}
                                type="primary"
                            >
                                <Link
                                    to={{
                                        pathname: `${baseUrl}/fichas/tombos/${this.state.numeroHcf}/0`
                                    }}
                                    target="_blank"
                                >
                                    {' '}
                                    imprimir ficha s/ código
                                </Link>
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                disabled={!this.props.match.params.tombo_id}
                                type="primary"
                            >
                                <Link
                                    to={{
                                        pathname: `/pendencias/${this.state.numeroHcf}`
                                    }}
                                    target="_blank"
                                >
                                    {' '}
                                    ver pendencias
                                </Link>
                            </Button>
                        </Col> */}
                        <Col style={{ marginLeft: 'auto' }} xs={24} sm={8} md={3} lg={3} xl={3}>
                            <ButtonComponent titleButton="Salvar" />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }

    renderPrincipaisCaracteristicas = (getFieldDecorator, getFieldError) => {
        return (
            <div>
                <Row gutter={8}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Número da coleta:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('numColeta', {
                                    initialValue: String(this.state.numero_coleta)
                                })(
                                    <Input
                                        type="text"
                                        placeholder="785"
                                        style={{ width: '100%' }}
                                        status={getFieldError('numColeta') ? 'error' : ''}
                                    />
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
                            <Button 
                                type="text" 
                                onClick={() => {
                                    this.props.form.setFieldsValue({ localidadeCor: undefined })
                                }}
                                style={{ 
                                    color: '#999', 
                                    fontSize: '12px',
                                    padding: '0 4px',
                                    height: 'auto'
                                }}
                            >
                                Limpar
                            </Button>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('localidadeCor', {
                                    initialValue: String(this.state.localidadeInicial),
                                })(
                                    <RadioGroup
                                        onChange={this.onChange}
                                        value={this.state.value}
                                        style={{
                                            padding: '3px',
                                            boxShadow: getFieldError('localidadeCor')
                                                ? '0 0 0 1px #f5222d' : '',
                                            borderRadius: '1px'
                                        }}
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
                                    initialValue: String(!this.props.match.params.tombo_id ? this.state.herbarioInicial?.value || '' : this.state.herbarioInicial),
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione uma entidade"
                                        optionFilterProp="children"
                                        allowClear
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
                                        allowClear
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

    gerarAcaoFoto = id => {
        return (
            <span>
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    renderPorTipo = () => {
        if (isIdentificador()) {
            return this.renderConteudoIdentificador()
        }
        return this.renderConteudo()
    }

    render() {
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
