import { Component } from 'react'

import {
    Row,
    Col,
    Divider,
    Select,
    InputNumber,
    Tag,
    Input,
    Button,
    notification,
    Spin,
    Modal,
    Radio,
    Table,
    Tooltip,
    Upload,
    Image
} from 'antd'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { Link } from 'react-router-dom'

import { formatarDataBRtoEN } from '@/helpers/conversoes/ConversoesData'
import converteDecimalParaGrausMinutosSegundos from '@/helpers/conversoes/Coordenadas'
import { Form } from '@ant-design/compatible'
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    UploadOutlined
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
import HerbarioFormField from './components/HerbarioFormField'
import IdentificadorFormField from './components/IdentificadorFormField'
import InputFormField from './components/InputFormField'
import LatLongFormField from './components/LatLongFormField'
import LocalColetaFormField from './components/LocalColetaFormField'
import PaisFormField from './components/PaisFormField'
import ReinoFormField from './components/ReinoFormField'
import RelevoFormField from './components/RelevoFormField'
import SelectedFormField from './components/SelectedFormFiled'
import SoloFormField from './components/SoloFormField'
import SubespecieFormField from './components/SubespecieFormField'
import SubfamiliaFormField from './components/SubfamiliaFormField'
import VariedadeFormField from './components/VariedadeFormField'
import VegetacaoFormField from './components/VegetacaoFormField'
import {
    excluirFotoTomboService,
    atualizarFotoTomboService,
    criaCodigoBarrasSemFotosService,
    requisitaDadosEdicaoService,
    requisitaDadosFormularioService,
    requisitaIdentificadoresPredicaoService,
    verificaPendenciasService,
    requisitaCodigoBarrasService,
    requisitaNumeroHcfService,
    handleSubmitIdentificadorService,
    verificarCoordenada
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
                    <Image width={120} src={`${fotosBaseUrl}/${thumbnail}`} />
                )
            }
        },
        {
            title: 'Codigo de Barras',
            dataIndex: 'codigo_barra',
            render: codigoBarra => <div width="120">{codigoBarra}</div>
        },
        {
            title: 'Ação',
            dataIndex: 'acao',
            render: (text, record, index) => (
                <>
                    <Row>
                        <Col span={12}>
                            <Tooltip placement="top" title="Excluir">
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault()
                                        this.mostraMensagemDeleteCod(
                                            record,
                                            index
                                        )
                                    }}
                                >
                                    <DeleteOutlined
                                        style={{ color: '#e30613' }}
                                    />
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
                                        this.atualizarFotoTombo(
                                            foto,
                                            record,
                                            index
                                        )
                                    }}
                                >
                                    <Tooltip
                                        placement="top"
                                        title="editar imagem"
                                    >
                                        <EditOutlined
                                            style={{ color: '#FFCC00' }}
                                        />
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
        this.barcodeRef = null // Add ref for BarcodeTableComponent
        this.state = {
            showTable: false,
            fetchingColetores: false,
            fetchingIdentificadores: false,
            fetchingHerbarios: false,
            fetchingPaises: false,
            fetchingEstados: false,
            fetchingCidades: false,
            fetchingLocaisColeta: false,
            fetchingSolos: false,
            fetchingRelevos: false,
            fetchingVegetacoes: false,
            fetchingFases: false,
            fetchingAutores: false,
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
            dadosFormulabarcodePhotosFromServerrioInicial: {},
            barcodePhotosForm: {},
            initialBarcodePhotos: {},
            isEditing: false,
            fetchingReinos: false,
            fetchingFamilias: false,
            fetchingSubfamilias: false,
            fetchingGeneros: false,
            fetchingEspecies: false,
            fetchingSubespecies: false,
            fetchingVariedades: false,
            cidadeStatus: '',
            cidadeHelp: ''
        }
    }

    componentDidMount() {
        this.carregaInformacoesEdicao()
    }

    validateAnoNaoFuturo = (_rule, value, callback) => {
        if (value == null || value === '') return callback()
        const anoAtual = new Date().getFullYear()
        if (Number(value) > anoAtual) {
            return callback('O ano não pode ser no futuro.')
        }
        return callback()
    }

    validateDataTombo = (_rule, value, callback) => {
        if (!value) return callback()

        const str = String(value).trim()

        const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        if (!m) return callback('Formato inválido. Use DD/MM/AAAA.')

        const d = Number(m[1])
        const mm = Number(m[2])
        const y = Number(m[3])

        if (mm < 1 || mm > 12) return callback('Mês inválido.')
        if (d < 1 || d > 31) return callback('Dia inválido.')

        const dt = new Date(y, mm - 1, d)
        if (
            dt.getFullYear() !== y
            || dt.getMonth() + 1 !== mm
            || dt.getDate() !== d
        ) {
            return callback('Data inválida.')
        }

        const anoAtual = new Date().getFullYear()
        if (y > anoAtual) return callback('O ano não pode ser no futuro.')

        return callback()
    }

    carregaInformacoesEdicao = async () => {
        try {
            this.setState({ loading: true })

            await Promise.all([
                this.requisitaDadosFormulario(),
                this.requisitaReinos(''),
                this.requisitaFamilias('', this.state.reinoInicial)
            ])
        } catch (error) {
            console.error(error)
        } finally {
            this.setState({ loading: false })
        }
    }

    getCodigosTombo = hcf => {
        axios
            .get(`/tombos/codigo_barras/${hcf}`)
            .then(({ status, data }) => {
                if (status !== 200 || !Array.isArray(data)) return

                const parseNumero = (numBarra, codigoBarra) => {
                    const inteiro = parseInt(
                        String(numBarra ?? '').split('.')[0],
                        10
                    )
                    if (Number.isFinite(inteiro)) return inteiro
                    return parseInt(
                        String(codigoBarra || '').replace(/\D/g, ''),
                        10
                    )
                }

                const normalize = items => items.map(item => ({
                    id: item.id,
                    codigo_barra: String(item.codigo_barra || ''),
                    num_barra: parseNumero(
                        item.num_barra,
                        item.codigo_barra
                    )
                }))

                const dedupeByCodigo = rows => rows
                    .filter(row => row.codigo_barra)
                    .reduce((acc, cur) => {
                        if (
                            !acc.some(
                                x => x.codigo_barra === cur.codigo_barra
                            )
                        ) acc.push(cur)
                        return acc
                    }, [])

                const barcodeEditList = dedupeByCodigo(normalize(data))

                this.setState({ codigosBarrasForm: barcodeEditList })
                this.setState({ codigosBarrasInicial: barcodeEditList })
            })
            .catch(this.catchRequestError)
    }

    handleChangeBarcodeList = updatedList => {
        const serialize = (list = []) => list
            .map(
                ({ codigo_barra, num_barra }) => `${codigo_barra}:${num_barra}`
            )
            .join('|')

        const previousSignature = serialize(this.state.codigosBarrasForm)
        const nextSignature = serialize(updatedList)

        if (previousSignature !== nextSignature) {
            this.setState({ codigosBarrasForm: updatedList })
        }
    }

    handleDeletedBarcode = ({ codigo_barra, num_barra, id }) => {
        const toInt = v => {
            const n = parseInt(String(v ?? '').split('.')[0], 10)
            return Number.isFinite(n) ? n : NaN
        }

        const deletedNum = toInt(num_barra)
        const deletedCode = String(codigo_barra || '')

        this.setState(prev => {
            const inicial = prev.codigosBarrasInicial || []
            const existedInInitial = inicial.some(item => {
                const itemNum = toInt(item?.num_barra)
                const itemCode = String(item?.codigo_barra || '')
                return itemNum === deletedNum || itemCode === deletedCode
            })

            const nextInicial = inicial.filter(item => {
                const itemNum = toInt(item?.num_barra)
                const itemCode = String(item?.codigo_barra || '')
                return !(itemNum === deletedNum || itemCode === deletedCode)
            })

            let nextToDelete = prev.toDeleteBarcodes || []
            if (existedInInitial) {
                const alreadyQueued = nextToDelete.some(x => {
                    const n = toInt(x?.num_barra)
                    const c = String(x?.codigo_barra || '')
                    return n === deletedNum || c === deletedCode
                })
                if (!alreadyQueued) {
                    nextToDelete = [
                        ...nextToDelete,
                        { codigo_barra, num_barra: deletedNum, id }
                    ]
                }
            }

            return {
                codigosBarrasInicial: nextInicial,
                toDeleteBarcodes: nextToDelete
            }
        })
    }

    uploadFotoCodigo = async (tomboHcf, numeroCodigo, file) => {
        const form = new FormData()
        form.append('imagem', file)
        form.append('codigo_foto', String(numeroCodigo))
        form.append('tombo_hcf', String(tomboHcf))
        form.append('em_vivo', 'true')

        return axios.post('/uploads', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    makeFileGetter = source => codigo => {
        if (typeof source === 'function') return source(codigo) || []
        if (source && typeof source === 'object') return source[codigo] || []
        if (typeof this?.getPhotosOfCode === 'function') return this.getPhotosOfCode(codigo) || []
        return []
    }

    pickUploadableFile = (list = []) => {
        for (const f of list) {
            if (typeof File !== 'undefined' && f instanceof File) return f
            if (f && f.originFileObj) return f.originFileObj
        }
        return null
    }

    hasLocalFile = (files = []) => !!this.pickUploadableFile(files)

    shouldUploadPhoto = (initialFiles = [], currentFiles = []) => {
        if (this.hasLocalFile(currentFiles)) return true
        return false
    }

    formatCodeLabel = n => `HCF${String(n).padStart(9, '0')}`

    editarCodigosBarras = async (tomboHcf, currentList, photoSourceArg) => {
        try {
            const initialList = this.state.codigosBarrasInicial || []
            const currentBarcodes = currentList || []
            const deletions = this.state.toDeleteBarcodes || []
            const { isEditing } = this.state

            const initialPhotosMap = this.state.initialBarcodePhotos || {}
            const currentPhotosMap = photoSourceArg ?? this.state.currentBarcodePhotos ?? {}

            const getFiles = typeof this.makeFileGetter === 'function'
                ? this.makeFileGetter(currentPhotosMap)
                : () => []

            const initialSet = new Set(
                initialList.map(it => it.codigo_barra)
            )
            const newBarcodes = currentBarcodes.filter(
                it => !initialSet.has(it.codigo_barra)
            )
            const existingBarcodes = currentBarcodes.filter(it => initialSet.has(it.codigo_barra))

            const ops = []

            if (newBarcodes.length > 0) {
                ops.push(
                    this.criarCodigoBarras(tomboHcf, newBarcodes, getFiles)
                )
            }

            if (isEditing && existingBarcodes.length > 0) {
                const codigosComAlteracaoArquivo = existingBarcodes
                    .filter(row => {
                        const codigoFormatado = this.formatCodeLabel(
                            row.num_barra
                        )
                        const filesAtuais = getFiles(codigoFormatado) || []
                        const filesIniciais = initialPhotosMap[codigoFormatado] || []

                        const temArquivoNovo = this.hasLocalFile(filesAtuais)
                        const adicionouArquivo = filesIniciais.length === 0
                            && filesAtuais.length > 0

                        return temArquivoNovo || adicionouArquivo
                    })
                    .map(row => {
                        const codigoFormatado = this.formatCodeLabel(
                            row.num_barra
                        )
                        const files = getFiles(codigoFormatado) || []
                        const file = this.pickUploadableFile
                            ? this.pickUploadableFile(files)
                            : null
                        return file
                            ? { numeroCodigo: row.num_barra, file }
                            : null
                    })
                    .filter(Boolean)

                if (codigosComAlteracaoArquivo.length > 0) {
                    const uploadRequests = codigosComAlteracaoArquivo.map(
                        ({ numeroCodigo, file }) => this.uploadFotoCodigo(tomboHcf, numeroCodigo, file)
                    )
                    ops.push(Promise.allSettled(uploadRequests))
                }
            }

            if (isEditing) {
                const codesWithPhotoInitially = Object.keys(
                    initialPhotosMap
                ).filter(
                    code => Array.isArray(initialPhotosMap[code])
                        && initialPhotosMap[code].length > 0
                )

                if (codesWithPhotoInitially.length > 0) {
                    const codesNowWithoutPhoto = codesWithPhotoInitially.filter(
                        code => {
                            const atual = currentPhotosMap[code]
                            return !Array.isArray(atual) || atual.length === 0 // vazio agora
                        }
                    )

                    if (codesNowWithoutPhoto.length > 0) {
                        const deletePhotoRequests = codesNowWithoutPhoto
                            .map(code => {
                                const row = currentBarcodes.find(
                                    r => r.codigo_barra === code
                                )
                                    || initialList.find(
                                        r => r.codigo_barra === code
                                    )
                                    || null

                                const numeroCodigo = row?.num_barra
                                    ?? parseInt(
                                        String(code).replace(/\D/g, ''),
                                        10
                                    )
                                if (!Number.isFinite(numeroCodigo)) return null

                                return axios.delete(
                                    `/uploads/${encodeURIComponent(
                                        numeroCodigo
                                    )}`
                                )
                            })
                            .filter(Boolean)

                        if (deletePhotoRequests.length > 0) {
                            ops.push(Promise.allSettled(deletePhotoRequests))
                        }
                    }
                }
            }

            if (isEditing && deletions.length > 0) {
                const deleteRequests = deletions.map(b => axios.delete(
                    `/tombos/codigo_barras/${encodeURIComponent(
                        b.num_barra
                    )}`
                ))
                ops.push(Promise.allSettled(deleteRequests))
            }

            if (ops.length > 0) {
                await Promise.all(ops)
            }

            if (
                newBarcodes.length > 0
                || (isEditing
                    && (deletions.length > 0 || existingBarcodes.length > 0))
            ) {
                this.openNotificationWithIcon(
                    'success',
                    'Sucesso',
                    'Códigos de barra atualizados com sucesso'
                )
            }

            if (isEditing && deletions.length > 0) {
                this.setState({ toDeleteBarcodes: [] })
            }
        } catch (error) {
            console.error('Erro ao atualizar códigos de barras:', error)
            this.openNotificationWithIcon(
                'error',
                'Erro',
                'Erro ao atualizar os códigos de barras. Tente novamente.'
            )
        }
    }

    normalizeBarcodes = (barcodeList = []) => {
        const asArray = Array.isArray(barcodeList)
            ? barcodeList
            : [barcodeList]

        const integerPart = val => {
            const [int] = String(val).split('.')
            const n = parseInt(int, 10)
            return Number.isFinite(n) ? n : NaN
        }

        const extractNumber = item => {
            if (item == null) return NaN

            // 1) Objeto com num_barra (ex.: "41806.0")
            if (typeof item === 'object' && 'num_barra' in item) {
                return integerPart(item.num_barra)
            }

            // 2) Objeto com codigo_barra OU string tipo "HCF000041890"
            if (
                (typeof item === 'object' && 'codigo_barra' in item)
                || typeof item === 'string'
            ) {
                const raw = typeof item === 'string'
                    ? item
                    : String(item.codigo_barra || '')
                const n = parseInt(raw.replace(/\D/g, ''), 10)
                return Number.isFinite(n) ? n : NaN
            }

            // 3) Número puro
            if (typeof item === 'number' && Number.isFinite(item)) {
                return Math.trunc(item)
            }

            // 4) Fallback: extrai dígitos de qualquer coisa
            const n = parseInt(String(item).replace(/\D/g, ''), 10)
            return Number.isFinite(n) ? n : NaN
        }

        const seen = new Set()
        return asArray
            .map(extractNumber)
            .filter(n => Number.isFinite(n) && n > 0)
            .filter(n => (seen.has(n) ? false : (seen.add(n), true)))
    }

    criarCodigoBarras = async (id_tombo, barcodeList = [], getFiles) => {
        const hcf = Number(id_tombo)
        if (!Number.isFinite(hcf)) {
            message.error('Tombo (HCF) inválido.')
            return
        }

        const numeros = this.normalizeBarcodes(barcodeList)
        if (!numeros.length) {
            this.openNotificationWithIcon(
                'warning',
                'Atenção',
                'Nenhum código válido para enviar.'
            )
            return
        }

        const resultados = await Promise.all(
            numeros.map(async numeroCodigo => {
                try {
                    await axios.post('/tombos/codigo_barras', {
                        hcf,
                        codigo_barra: numeroCodigo
                    })

                    let uploaded = false
                    if (typeof getFiles === 'function') {
                        const codigoFormatado = this.formatCodeLabel(numeroCodigo)
                        const arquivos = getFiles(codigoFormatado)

                        if (arquivos && arquivos[0]) {
                            const file = this.pickUploadableFile(arquivos)
                            if (file) {
                                await this.uploadFotoCodigo(
                                    hcf,
                                    numeroCodigo,
                                    file
                                )
                                uploaded = true
                            }
                        }
                    }

                    return { ok: true, numeroCodigo, uploaded }
                } catch (error) {
                    console.error(
                        'Erro ao criar/enviar para código:',
                        numeroCodigo,
                        error
                    )
                    return { ok: false, numeroCodigo, error }
                }
            })
        )

        const okCount = resultados.filter(r => r.ok).length
        const failCount = resultados.length - okCount
        const uploadedCount = resultados.filter(
            r => r.ok && r.uploaded
        ).length

        if (okCount) {
            this.openNotificationWithIcon(
                'success',
                'Sucesso',
                `Códigos criados: ${okCount}${
                    uploadedCount ? ` • Uploads: ${uploadedCount}` : ''
                }${failCount ? ` • Falharam: ${failCount}` : ''}`
            )
        } else {
            this.openNotificationWithIcon(
                'error',
                'Erro',
                'Nenhum código foi criado.'
            )
        }
    }

    handleRequisicao = values => {
        const { match } = this.props
        const photoSourceArg = codigo => this.barcodeRef?.getPhotosOfCode?.(codigo) || []

        if (match.params.tombo_id) {
            this.editarCodigosBarras(
                match.params.tombo_id,
                this.state.codigosBarrasForm,
                photoSourceArg
            )
            const json = this.montaFormularioJsonEdicao(values)
            this.requisitaEdicaoTombo(json)
        } else {
            const json = this.montaFormularioJsonCadastro(values)
            this.requisitaCadastroTombo(json)
        }
    }

    onEditarTomboComSucesso = response => {
        const { data } = response

        this.encontraAutor(
            data.subfamilias,
            data.subfamiliaInicial,
            'autorSubfamilia'
        )
        this.encontraAutor(data.especies, data.especieInicial, 'autorEspecie')
        this.encontraAutor(
            data.subespecies,
            data.subespecieInicial,
            'autorSubespecie'
        )
        this.encontraAutor(
            data.variedades,
            data.variedadeInicial,
            'autorVariedade'
        )

        this.setState(prevState => ({
            ...prevState,
            loading: false,
            ...data
        }))
        this.insereDadosFormulario(data)

        setTimeout(() => {
            this.verifyCoordenada(data.cidadeInicial)
        }, 500)
    }

    encontraAutor = (lista, valorSelecionado, campoTaxonomiaAutor) => {
        if ((!valorSelecionado && !lista) || Number.isNaN(valorSelecionado)) return

        const itemEncontrado = lista.find(
            item => item.id === Number(valorSelecionado)
        )

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

    defaultRequest = async (
        onFinish,
        requestService,
        successMessage,
        errorMessage,
        successCalback,
        ...params
    ) => {
        try {
            await requestService(response => {
                successCalback(response, params)
                if (successMessage !== '') {
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        successMessage
                    )
                }
            }, ...params)
        } catch (error) {
            console.error(error)
            let message = ''
            if (error) {
                message = `Falha ao carregar os dados do tombo: ${error.message}`
            }
            this.openNotificationWithIcon('warning', 'Falha', message)
        } finally {
            this.setState({
                loading: false
            })
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
            const hcfHerbario = dados.herbarios.find(
                herbario => herbario.sigla === 'HCF'
            )
            const paisBrasil = dados.paises.find(p => p.nome === 'BRASIL')

            this.setState({
                loading: false,
                herbarioInicial: {
                    value: hcfHerbario?.id
                },
                paisInicial: paisBrasil ? String(paisBrasil.id) : ''
            })

            if (paisBrasil) {
                axios
                    .get('/estados', { params: { pais_id: paisBrasil.id } })
                    .then(estadosResponse => {
                        if (
                            estadosResponse.data
                            && estadosResponse.status === 200
                        ) {
                            const estadoParana = estadosResponse.data.find(
                                e => e.nome === 'Paraná'
                            )
                            this.setState({
                                estados: estadosResponse.data,
                                estadoInicial: estadoParana
                                    ? String(estadoParana.id)
                                    : ''
                            })

                            if (estadoParana) {
                                this.requisitaCidades('', estadoParana.id)
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
            reino,
            familia,
            subfamilia,
            genero,
            especie,
            subespecie,
            variedade
        } = this.props.form.getFieldsValue()
        if (
            familia
            || subfamilia
            || genero
            || especie
            || subespecie
            || variedade
        ) {
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
        axios
            .get('/tombos/filtrar_ultimo_numero')
            .then(response => {
                if (response.status === 200) {
                    if (this.props.match.params.tombo_id) {
                        this.setState({
                            numeroHcf: this.props.match.params.tombo_id
                        })
                        this.props.form.setFields({
                            numeroTombo: {
                                value: this.props.match.params.tombo_id
                            }
                        })
                        const date = new Date(response.data.data_tombo)
                        this.props.form.setFields({
                            dataTombo: {
                                value: `${date.getDate()}/${
                                    date.getMonth() + 1
                                }/${date.getFullYear()}`
                            }
                        })
                        this.requisitaCodigoBarras()
                        this.verificaPendencias(
                            this.props.match.params.tombo_id
                        )
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
                                value: `${date.getDate()}/${
                                    date.getMonth() + 1
                                }/${date.getFullYear()}`
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

    requisitaTipos = () => {
        this.setState({
            loading: true
        })
        axios
            .get('/tipos')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.setState({
                        tipos: response.data
                    })
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao buscar os tipos do tombo, tente novamente.'
                    )
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema a listar os tipos, tente novamente.'
                        )
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
        axios
            .post('/tipos', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaTipos()
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo tipo, tente novamente.'
                        )
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
        axios
            .post('/reinos', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaReinos('')
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
                }
                this.props.form.setFields({ campo: { value: "" } }); // eslint-disable-line
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo reino, tente novamente.'
                        )
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
        axios
            .post('/familias', {
                reinoId: this.props.form.getFieldsValue().reino,
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaFamilias('', this.state.reinoInicial)
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar a nova família, tente novamente.'
                        )
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

    requisitaReinos = async (searchText = '') => {
        this.setState({ fetchingReinos: true })

        try {
            const params = {
                limite: 9999999999,
                ...(searchText ? { reino: searchText } : {})
            }

            const response = await axios.get('/reinos', { params })

            if (response.status === 200) {
                this.setState({
                    reinos: response.data.resultado,
                    fetchingReinos: false
                })
            }
        } catch (err) {
            this.setState({ fetchingReinos: false })
            console.error('Erro ao buscar reinos:', err)
        }
    }

    requisitaFamilias = async (searchText = '', reinoId = null) => {
        this.setState({ fetchingFamilias: true })

        try {
            const params = {
                limite: 9999999999,
                ...(searchText ? { familia: searchText } : {}),
                ...(reinoId ? { reino_id: reinoId } : {})
            }

            const response = await axios.get('/familias', { params })

            if (response.status === 200) {
                this.setState({
                    familias: response.data.resultado,
                    fetchingFamilias: false
                })
            }
        } catch (err) {
            this.setState({ fetchingFamilias: false })
            console.error('Erro ao buscar famílias:', err)
        }
    }

    cadastraNovaSubfamilia = () => {
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma família para cadastrar uma subfamília.'
            )
        } else {
            axios
                .post('/subfamilias', {
                    nome: this.props.form.getFieldsValue().campo,
                    familia_id: this.props.form.getFieldsValue().familia
                })
                .then(response => {
                    if (response.status === 204) {
                        this.requisitaSubfamilias(
                            '',
                            this.props.form.getFieldsValue().familia
                        )
                        this.setState({
                            search: {
                                subfamilia: 'validating'
                            }
                        })
                        this.openNotificationWithIcon(
                            'success',
                            'Sucesso',
                            'O cadastro foi realizado com sucesso.'
                        )
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
                        if (
                            response.status === 400
                            || response.status === 422
                        ) {
                            this.openNotificationWithIcon(
                                'warning',
                                'Falha',
                                response.data.error.message
                            )
                        } else {
                            this.openNotificationWithIcon(
                                'error',
                                'Falha',
                                'Houve um problema ao cadastrar a nova subfamília, tente novamente.'
                            )
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

    requisitaSubfamilias = async (searchText = '', familiaId = null) => {
        this.setState({ fetchingSubfamilias: true })

        try {
            const params = {
                limite: 999999999,
                ...(searchText ? { subfamilia: searchText } : {}),
                ...(familiaId ? { familia_id: familiaId } : {})
            }

            const response = await axios.get('/subfamilias', { params })

            if (response.status === 200) {
                this.setState({
                    subfamilias: response.data.resultado,
                    fetchingSubfamilias: false
                })
            }
        } catch (err) {
            this.setState({ fetchingSubfamilias: false })
            console.error('Erro ao buscar subfamílias:', err)
        }
    }

    cadastraNovoGenero = () => {
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma família para cadastrar uma subfamília.'
            )
        } else {
            this.setState({
                loading: true
            })
            axios
                .post('/generos', {
                    nome: this.props.form.getFieldsValue().campo,
                    familia_id: this.props.form.getFieldsValue().familia
                })
                .then(response => {
                    this.setState({
                        loading: false
                    })
                    if (response.status === 204) {
                        this.requisitaGeneros(
                            '',
                            this.props.form.getFieldsValue().familia
                        )
                        this.setState({
                            search: {
                                genero: 'validating'
                            }
                        })
                        this.openNotificationWithIcon(
                            'success',
                            'Sucesso',
                            'O cadastro foi realizado com sucesso.'
                        )
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
                        if (
                            response.status === 400
                            || response.status === 422
                        ) {
                            this.openNotificationWithIcon(
                                'warning',
                                'Falha',
                                response.data.error.message
                            )
                        } else {
                            this.openNotificationWithIcon(
                                'error',
                                'Falha',
                                'Houve um problema ao cadastrar o novo gênero, tente novamente.'
                            )
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

    requisitaGeneros = async (searchText = '', familiaId = null) => {
        this.setState({ fetchingGeneros: true })

        try {
            const params = {
                limite: 9999999999,
                ...(searchText ? { genero: searchText } : {}),
                ...(familiaId ? { familia_id: familiaId } : {})
            }

            const response = await axios.get('/generos', { params })

            if (response.status === 200) {
                this.setState({
                    generos: response.data.resultado,
                    fetchingGeneros: false
                })
            }
        } catch (err) {
            this.setState({ fetchingGeneros: false })
            console.error('Erro ao buscar gêneros:', err)
        }
    }

    cadastraNovaEspecie = () => {
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione um gênero para cadastrar uma subfamília.'
            )
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma família para cadastrar uma subfamília.'
            )
        } else {
            this.setState({
                loading: true
            })
            axios
                .post('/especies', {
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
                        this.requisitaEspecies(
                            '',
                            this.props.form.getFieldsValue().genero
                        )
                        this.setState({
                            search: {
                                especie: 'validating'
                            }
                        })
                        this.openNotificationWithIcon(
                            'success',
                            'Sucesso',
                            'O cadastro foi realizado com sucesso.'
                        )
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
                        if (
                            response.status === 400
                            || response.status === 422
                        ) {
                            this.openNotificationWithIcon(
                                'warning',
                                'Falha',
                                response.data.error.message
                            )
                        } else {
                            this.openNotificationWithIcon(
                                'error',
                                'Falha',
                                'Houve um problema ao cadastrar a nova espécie, tente novamente.'
                            )
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

    requisitaEspecies = async (searchText = '', generoId = null) => {
        this.setState({ fetchingEspecies: true })

        try {
            const params = {
                limite: 9999999999,
                ...(searchText ? { especie: searchText } : {}),
                ...(generoId ? { genero_id: generoId } : {})
            }

            const response = await axios.get('/especies', { params })

            if (response.status === 200) {
                this.setState({
                    especies: response.data.resultado,
                    fetchingEspecies: false
                })
            }
        } catch (err) {
            this.setState({ fetchingEspecies: false })
            console.error('Erro ao buscar espécies:', err)
        }
    }

    cadastraNovaSubespecie = () => {
        if (!this.props.form.getFieldsValue().especie) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma espécie para cadastrar uma subespécie.'
            )
        }
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione um gênero para cadastrar uma subespécie.'
            )
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma família para cadastrar uma subespécie.'
            )
        } else {
            this.setState({
                loading: true
            })
            axios
                .post('/subespecies', {
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
                        this.requisitaSubespecies(
                            '',
                            this.props.form.getFieldsValue().especie
                        )
                        this.setState({
                            search: {
                                subespecie: 'validating'
                            }
                        })
                        this.openNotificationWithIcon(
                            'success',
                            'Sucesso',
                            'O cadastro foi realizado com sucesso.'
                        )
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
                        if (
                            response.status === 400
                            || response.status === 422
                        ) {
                            this.openNotificationWithIcon(
                                'warning',
                                'Falha',
                                response.data.error.message
                            )
                        } else {
                            this.openNotificationWithIcon(
                                'error',
                                'Falha',
                                'Houve um problema ao cadastrar a nova subespécie, tente novamente.'
                            )
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

    requisitaSubespecies = async (searchText = '', especieId = null) => {
        this.setState({ fetchingSubespecies: true })

        try {
            const params = {
                limite: 999999999,
                ...(searchText ? { subespecie: searchText } : {}),
                ...(especieId ? { especie_id: especieId } : {})
            }

            const response = await axios.get('/subespecies', { params })

            if (response.status === 200) {
                this.setState({
                    subespecies: response.data.resultado,
                    fetchingSubespecies: false
                })
            }
        } catch (err) {
            this.setState({ fetchingSubespecies: false })
            console.error('Erro ao buscar subespécies:', err)
        }
    }

    cadastraNovaVariedade = () => {
        if (!this.props.form.getFieldsValue().especie) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma espécie para cadastrar uma variedade.'
            )
        }
        if (!this.props.form.getFieldsValue().genero) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione um gênero para cadastrar uma variedade.'
            )
        }
        if (!this.props.form.getFieldsValue().familia) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Selecione uma família para cadastrar uma variedade.'
            )
        } else {
            this.setState({
                loading: true
            })
            axios
                .post('/variedades', {
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
                        this.requisitaVariedades(
                            '',
                            this.props.form.getFieldsValue().especie
                        )
                        this.setState({
                            search: {
                                variedade: 'validating'
                            }
                        })
                        this.openNotificationWithIcon(
                            'success',
                            'Sucesso',
                            'O cadastro foi realizado com sucesso.'
                        )
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
                        if (
                            response.status === 400
                            || response.status === 422
                        ) {
                            this.openNotificationWithIcon(
                                'warning',
                                'Falha',
                                response.data.error.message
                            )
                        } else {
                            this.openNotificationWithIcon(
                                'error',
                                'Falha',
                                'Houve um problema ao cadastrar a nova variedade, tente novamente.'
                            )
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

    requisitaVariedades = async (searchText = '', especieId = null) => {
        this.setState({ fetchingVariedades: true })

        try {
            const params = {
                limite: 999999999,
                ...(searchText ? { variedade: searchText } : {}),
                ...(especieId ? { especie_id: especieId } : {})
            }

            const response = await axios.get('/variedades', { params })

            if (response.status === 200) {
                this.setState({
                    variedades: response.data.resultado,
                    fetchingVariedades: false
                })
            }
        } catch (err) {
            this.setState({ fetchingVariedades: false })
            console.error('Erro ao buscar variedades:', err)
        }
    }

    cadastraNovoAutor = () => {
        axios
            .post('/autores', {
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
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
                } else if (response.status === 400) {
                    this.openNotificationWithIcon(
                        'warning',
                        'Falha',
                        response.data.error.message
                    )
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao cadastrar o novo autor, tente novamente.'
                    )
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

    requisitaAutores = async (searchText = '') => {
        this.setState({ fetchingAutores: true })

        try {
            const params = {
                limite: 9999999,
                ...(searchText ? { autor: searchText } : {})
            }

            const response = await axios.get('/autores', { params })

            if (response.status === 200) {
                this.setState({
                    autores: response.data.resultado || response.data,
                    fetchingAutores: false
                })
            }
        } catch (err) {
            this.setState({ fetchingAutores: false })
            console.error('Erro ao buscar autores:', err)
        }
    }

    cadastraNovoSolo = () => {
        this.setState({
            loading: true
        })
        axios
            .post('/solos', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                if (response.status === 204) {
                    this.requisitaSolos('')
                    this.setState({
                        search: {
                            solo: 'validating'
                        },
                        loading: false
                    })
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo solo, tente novamente.'
                        )
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
        axios
            .post('/relevos', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaRelevos('')
                    this.setState({
                        search: {
                            relevo: 'validating'
                        }
                    })
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
                } else if (response.status === 400) {
                    this.openNotificationWithIcon(
                        'warning',
                        'Falha',
                        response.data.error.message
                    )
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao cadastrar o novo relevo, tente novamente.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo relevo, tente novamente.'
                        )
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
        axios
            .post('/vegetacoes', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaVegetacoes('')
                    this.setState({
                        search: {
                            vegetacao: 'validating'
                        }
                    })
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar a nova vegetação, tente novamente.'
                        )
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovoIdentificador = () => {
        this.setState({
            loading: true
        })
        axios
            .post('/identificadores', {
                nome: this.props.form.getFieldsValue().campo
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204 || response.status === 201) {
                    this.requisitaIdentificadores('')
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
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
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo identificador, tente novamente.'
                        )
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    cadastraNovaFase = () => {
        this.setState({ loading: true })
        axios.post('/fases-sucessionais', {
            nome: this.props.form.getFieldsValue().campo
        })
            .then(response => {
                this.setState({ loading: false })
                if (response.status === 204 || response.status === 201) {
                    this.requisitaFases('')
                    this.setState({
                        search: {
                            fase: 'validating'
                        }
                    })
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error?.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova fase sucessional, tente novamente.')
                }
                this.props.form.setFields({ campo: { value: '' } })
            })
            .catch(err => {
                this.setState({ loading: false })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', response.data.error?.message)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova fase sucessional, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error?.message)
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
        axios
            .post('/coletores', {
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
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
                }
                this.props.form.setFields({
                    nomeColetor: { value: '' },
                    emailColetor: { value: '' },
                    numeroColetor: { value: '' }
                })
            })
            .catch(err => {
                this.setState({ loading: false })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.openNotificationWithIcon(
                            'warning',
                            'Falha',
                            response.data.error.message
                        )
                    } else {
                        this.openNotificationWithIcon(
                            'error',
                            'Falha',
                            'Houve um problema ao cadastrar o novo coletor, tente novamente.'
                        )
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
            this.openNotificationWithIcon(
                'warning',
                'Atenção',
                'Selecione uma cidade para cadastrar um local de coleta.'
            )
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

        axios
            .post('/locais-coleta', payload)
            .then(response => {
                if (response.status === 201) {
                    this.requisitaLocaisColeta('')
                    this.openNotificationWithIcon(
                        'success',
                        'Sucesso',
                        'O cadastro foi realizado com sucesso.'
                    )
                }
                form.setFields({
                    descricaoLocalColeta: { value: '' }
                })
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        response.data.error?.message
                            || 'Houve um problema ao cadastrar o novo local de coleta.'
                    )
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao cadastrar o novo local de coleta, tente novamente.'
                    )
                }
            })
            .finally(() => {
                this.setState({ loading: false })
            })
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
        axios
            .post('/tombos', { json })
            .then(response => {
                if (response.status === 201) {
                    const tombo = response.data
                    const photoSourceArg = codigo => this.barcodeRef?.getPhotosOfCode?.(codigo) || []
                    this.criarCodigoBarras(
                        tombo.hcf,
                        this.state.codigosBarrasForm,
                        photoSourceArg
                    )
                }
            })
            .then(response => {
                this.setState({
                    loading: false
                })
                this.openNotificationWithIcon(
                    'success',
                    'Sucesso',
                    'O cadastro foi realizado com sucesso.'
                )
                this.props.history.push('/tombos')
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err

                if (response.status === 400) {
                    this.openNotificationWithIcon(
                        'warning',
                        'Falha',
                        response.data.error.message
                    )
                } else {
                    this.openNotificationWithIcon(
                        'error',
                        'Falha',
                        'Houve um problema ao cadastrar o novo tombo tente novamente.'
                    )
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
            onCancel: () => {}
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

        this.requisitaFamilias('', dados.reinoInicial)

        if (dados.familiaInicial) {
            this.requisitaSubfamilias('', dados.familiaInicial)
            this.requisitaGeneros('', dados.familiaInicial)
        }

        if (dados.generoInicial) {
            this.requisitaEspecies('', dados.generoInicial)
        }

        if (dados.especieInicial) {
            this.requisitaSubespecies('', dados.especieInicial)
            this.requisitaVariedades('', dados.especieInicial)
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

        if (
            dados.retorno
            && dados.retorno.identificadores
            && dados.retorno.identificadores.length > 0
        ) {
            const identificadoresParaFormulario = dados.retorno.identificadores
                .sort(
                    (a, b) => a.tombos_identificadores.ordem
                        - b.tombos_identificadores.ordem
                )
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
                value: `${date.getUTCDate()}/${
                    date.getUTCMonth() + 1
                }/${date.getUTCFullYear()}`
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
            this.requisitaLocaisColeta('', dados.cidadeInicial)
        }
    }

    mostraMensagemVerificaPendencia = () => {
        confirm({
            title: 'Pendência',
            content:
                'Este tombo possui pendências não resolvidas, deseja continuar alterando?',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk: () => {},
            onCancel: () => {
                ''

                window.history.go(-1)
            }
        })
    }

    handleSubmit = e => {
        e.preventDefault()
        const { form } = this.props
        form.validateFields((err, values) => {
            if (
                !(
                    form.getFieldsValue().dataColetaDia
                    || form.getFieldsValue().dataColetaMes
                    || form.getFieldsValue().dataColetaAno
                )
            ) {
                this.openNotificationWithIcon(
                    'warning',
                    'Falha',
                    'É necessário pelo menos o dia ou o mês ou o ano da data de coleta para o cadastro.'
                )
                return false
            }
            if (err != null) {
                this.openNotificationWithIcon(
                    'warning',
                    'Falha',
                    'Preencha todos os dados requiridos.'
                )
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
            altitude,
            autorEspecie,
            autorVariedade,
            autoresSubespecie,
            cidade,
            coletores,
            coletoresComplementares,
            complemento,
            dataColetaAno,
            dataColetaDia,
            dataColetaMes,
            dataIdentAno,
            dataIdentDia,
            dataIdentMes,
            especie,
            reino,
            familia,
            fases,
            genero,
            identificador,
            latitude,
            longitude,
            nomePopular,
            numColeta,
            observacoesColecaoAnexa,
            observacoesTombo,
            relevo,
            solo,
            subespecie,
            subfamilia,
            tipo,
            tipoColecaoAnexa,
            variedade,
            vegetacao,
            entidade,
            relevoDescricao,
            unicata,
            dataTombo
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
        const fasesId = extrairId(fases)
        const localColetaId = extrairId(complemento)

        json.principal = {
            entidade_id: parseInt(entidade),
            numero_coleta: parseInt(numColeta)
        }

        json.principal.nome_popular = nomePopular || null
        json.principal.tipo_id = tipo ? parseInt(tipo) : null
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
            latitude: latitude
                ? converteDecimalParaGrausMinutosSegundos(latitude, false, true)
                : null,
            longitude: longitude
                ? converteDecimalParaGrausMinutosSegundos(longitude, true, true)
                : null,
            altitude: altitude ? parseInt(altitude) : null,
            local_coleta_id: localColetaId
        }

        json.paisagem = {
            solo_id: soloId,
            relevo_id: relevoId,
            vegetacao_id: vegetacaoId,
            fase_sucessional_id: fasesId,
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
            altitude,
            autorEspecie,
            autorVariedade,
            autoresSubespecie,
            cidade,
            coletores,
            coletoresComplementares,
            complemento,
            dataColetaAno,
            dataColetaDia,
            dataColetaMes,
            dataIdentAno,
            dataIdentDia,
            dataIdentMes,
            especie,
            reino,
            familia,
            fases,
            genero,
            identificador,
            latitude,
            longitude,
            nomePopular,
            numColeta,
            observacoesColecaoAnexa,
            observacoesTombo,
            relevo,
            solo,
            subespecie,
            subfamilia,
            tipo,
            tipoColecaoAnexa,
            variedade,
            vegetacao,
            entidade,
            relevoDescricao,
            unicata,
            dataTombo
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
        const fasesId = extrairId(fases)
        const localColetaId = extrairId(complemento)

        if (nomePopular) json.principal = { nome_popular: nomePopular }
        json.principal = { ...json.principal, data_tombo: this.normalizaDataTombo(dataTombo) }
        json.principal = { ...json.principal, entidade_id: parseInt(entidade) }
        json.principal.numero_coleta = parseInt(numColeta)
        if (dataColetaDia) json.principal.data_coleta = { dia: dataColetaDia }
        if (dataColetaMes) json.principal.data_coleta = { ...json.principal.data_coleta, mes: dataColetaMes }
        if (dataColetaAno) json.principal.data_coleta = { ...json.principal.data_coleta, ano: dataColetaAno }
        if (tipo) json.principal.tipo_id = tipo
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
        if (localColetaId) {
            json.localidade = {
                ...json.localidade,
                local_coleta_id: localColetaId
            }
        }
        if (solo) json.paisagem = { ...json.paisagem, solo_id: soloId }
        if (relevoDescricao) json.paisagem = { ...json.paisagem, descricao: relevoDescricao }
        if (relevo) json.paisagem = { ...json.paisagem, relevo_id: relevoId }
        if (vegetacao) json.paisagem = { ...json.paisagem, vegetacao_id: vegetacaoId }
        if (fases) json.paisagem = { ...json.paisagem, fase_sucessional_id: fasesId }
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
        if (coletoresComplementares) {
            json.coletor_complementar = {
                complementares: coletoresComplementares
            }
        }
        if (tipoColecaoAnexa) json.colecoes_anexas = { tipo: tipoColecaoAnexa }
        if (observacoesColecaoAnexa) {
            json.colecoes_anexas = {
                ...json.colecoes_anexas,
                observacoes: observacoesColecaoAnexa
            }
        }
        if (observacoesTombo) json.observacoes = observacoesTombo
        if (autorEspecie) json.autores = { especie: autorEspecie }
        if (autoresSubespecie) json.autores = { ...json.autores, subespecie: autoresSubespecie }
        if (autorVariedade) json.autores = { ...json.autores, variedade: autorVariedade }
        if (unicata !== undefined) json.unicata = unicata
        return json
    }

    handleSubmitForm = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {})
    }

    optionEntidades = () => this.state.herbarios.map(item => (
        <Option value={`${item.id}`}>
            {item.sigla}
            {' '}
            -
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
            onOk: () => {},
            onCancel: () => {}
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
            axios
                .get(`/tombos/numeroColetor/${value.key}`)
                .then(response => {
                    if (response.status === 200) {
                        const todosNumeros = response.data
                        todosNumeros.sort(
                            (a, b) => b.numero_coleta - a.numero_coleta
                        )

                        this.props.form.setFields({
                            numColeta: {
                                value:
                                    todosNumeros.length === 0
                                    || todosNumeros[0].numero_coleta === null
                                        ? 1
                                        : todosNumeros[0].numero_coleta + 1
                            }
                        })
                    }
                })
                .catch(this.catchRequestError)
        }
    }

    requisitaColetores = async (searchText = '') => {
        this.setState({ fetchingColetores: true })

        try {
            const response = await axios.get(
                `/coletores-predicao?nome=${searchText || ''}`
            )

            if (response.status === 200) {
                this.setState({
                    coletores: response.data,
                    fetchingColetores: false
                })
            }
        } catch (err) {
            this.setState({ fetchingColetores: false })
            console.error('Erro ao buscar coletores:', err)
        }
    }

    requisitaHerbarios = async (searchText = '') => {
        this.setState({ fetchingHerbarios: true })

        try {
            const params = {
                limite: 9999999999,
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/herbarios', { params })

            if (response.status === 200) {
                this.setState({
                    herbarios: response.data.herbarios || [],
                    fetchingHerbarios: false
                })
            }
        } catch (err) {
            this.setState({ fetchingHerbarios: false })
            console.error('Erro ao buscar herbários:', err)
        }
    }

    requisitaPaises = async (searchText = '') => {
        this.setState({ fetchingPaises: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/paises', { params })

            if (response.status === 200) {
                this.setState({
                    paises: response.data,
                    fetchingPaises: false
                })
            }
        } catch (err) {
            this.setState({ fetchingPaises: false })
            console.error('Erro ao buscar países:', err)
        }
    }

    requisitaEstados = async (searchText = '', paisId = null) => {
        this.setState({ fetchingEstados: true })

        try {
            const params = {
                ...(paisId ? { pais_id: paisId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/estados', { params })

            if (response.status === 200) {
                this.setState({
                    estados: response.data,
                    fetchingEstados: false
                })
            }
        } catch (err) {
            this.setState({ fetchingEstados: false })
            console.error('Erro ao buscar estados:', err)
        }
    }

    requisitaCidades = async (searchText = '', estadoId = null) => {
        this.setState({ fetchingCidades: true })

        try {
            const params = {
                ...(estadoId ? { estado_id: estadoId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/cidades', { params })

            if (response.status === 200) {
                this.setState({
                    cidades: response.data,
                    fetchingCidades: false
                })
            }
        } catch (err) {
            this.setState({ fetchingCidades: false })
            console.error('Erro ao buscar cidades:', err)
        }
    }

    requisitaLocaisColeta = async (searchText = '', cidadeId = null) => {
        const cidade = cidadeId || this.props.form.getFieldValue('cidade')

        if (!cidade) {
            this.openNotificationWithIcon(
                'warning',
                'Atenção',
                'Por favor, selecione uma cidade primeiro.'
            )
            return
        }

        this.setState({ fetchingLocaisColeta: true })

        try {
            const params = {
                getAll: 'true',
                ...(cidade ? { cidade_id: cidade } : {}),
                ...(searchText ? { descricao: searchText } : {})
            }

            const response = await axios.get('/locais-coleta', { params })

            if (response.status === 200) {
                this.setState({
                    locaisColeta: response.data.resultado,
                    fetchingLocaisColeta: false
                })
            }
        } catch (err) {
            this.setState({ fetchingLocaisColeta: false })
            console.error('Erro ao buscar locais de coleta:', err)
        }
    }

    requisitaSolos = async (searchText = '') => {
        this.setState({ fetchingSolos: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/solos', { params })

            if (response.status === 200) {
                this.setState({
                    solos: response.data,
                    fetchingSolos: false
                })
            }
        } catch (err) {
            this.setState({ fetchingSolos: false })
            console.error('Erro ao buscar solos:', err)
        }
    }

    requisitaRelevos = async (searchText = '') => {
        this.setState({ fetchingRelevos: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/relevos', { params })

            if (response.status === 200) {
                this.setState({
                    relevos: response.data,
                    fetchingRelevos: false
                })
            }
        } catch (err) {
            this.setState({ fetchingRelevos: false })
            console.error('Erro ao buscar relevos:', err)
        }
    }

    requisitaVegetacoes = async (searchText = '') => {
        this.setState({ fetchingVegetacoes: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/vegetacoes', { params })

            if (response.status === 200) {
                this.setState({
                    vegetacoes: response.data,
                    fetchingVegetacoes: false
                })
            }
        } catch (err) {
            this.setState({ fetchingVegetacoes: false })
            console.error('Erro ao buscar vegetações:', err)
        }
    }

    requisitaFases = async (searchText = '') => {
        this.setState({ fetchingFases: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/fases-sucessionais', { params })

            if (response.status === 200) {
                this.setState({
                    fases: response.data,
                    fetchingFases: false
                })
            }
        } catch (err) {
            this.setState({ fetchingFases: false })
            console.error('Erro ao buscar fases:', err)
        }
    }

    requisitaIdentificadores = async (searchText = '') => {
        this.setState({ fetchingIdentificadores: true })

        try {
            const response = await axios.get(
                `/identificadores-predicao?nome=${searchText || ''}`
            )

            if (response.status === 200) {
                this.setState({
                    identificadores: response.data,
                    fetchingIdentificadores: false
                })
            }
        } catch (err) {
            this.setState({ fetchingIdentificadores: false })
            console.error('Erro ao buscar identificadores:', err)
        }
    }

    verifyCoordenada = async (cidadeId = null) => {
        try {
            const { form } = this.props;
            
            if (cidadeId == null) {
                cidadeId = form.getFieldValue('cidade');
            }

            const latitude = form.getFieldValue('latitude');
            const longitude = form.getFieldValue('longitude');

            this.setState({
                cidadeStatus: '', 
                cidadeHelp: '',
            });

            const paisId = this.state.paisInicial || form.getFieldValue('pais');
            if (String(paisId) !== '76') return; 

            if (!cidadeId || !latitude || !longitude) return;
            if (Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) return;

            const payload = {
                cidade_id: Number(cidadeId),
                latitude,
                longitude,
            };

            const response = await axios.post('/tombos/verificarCoordenada', payload);

            if (response?.data && response.data.dentro === false) {
                this.setState({
                    cidadeStatus: 'warning', 
                    cidadeHelp: 'A coordenada não pertence à cidade', 
                });
            } else if (response?.data && response.data.dentro === true) {
                this.setState({
                    cidadeStatus: 'success',
                    cidadeHelp: '',
                });
            }

        } catch (err) {
            console.error('Falha ao verificar coordenada:', err);
        }
    };

    validacaoModal = () => {
        if (this.state.formColetor) {
            if (
                !this.props.form.getFieldsValue().nomeColetor
                || !this.props.form.getFieldsValue().numeroColetor
            ) {
                this.openNotificationWithIcon(
                    'warning',
                    'Falha',
                    'O nome e o número do coletor são obrigatórios.'
                )
                return false
            }
            return true
        }
        if (this.state.formLocalColeta) {
            if (!this.props.form.getFieldsValue().descricaoLocalColeta) {
                this.openNotificationWithIcon(
                    'warning',
                    'Falha',
                    'A descrição do local de coleta é obrigatória.'
                )
                return false
            }
            return true
        }
        if (!this.props.form.getFieldsValue().campo) {
            this.openNotificationWithIcon(
                'warning',
                'Falha',
                'Informe o nome para o cadastro.'
            )
            return false
        }
        return true
    }

    renderColetores = (getFieldDecorator, getFieldError) => {
        const {
            coletoresInicial,
            coletores,
            search,
            fetchingColetores,
            valoresColetores
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
                            notFoundContent={
                                fetchingColetores ? <Spin size="small" /> : null
                            }
                            labelInValue
                            value={valoresColetores}
                            placeholder="Selecione os coletores"
                            filterOption={false}
                            onSearch={searchText => {
                                this.requisitaColetores(searchText || '')
                            }}
                            status={getFieldError('coletores') ? 'error' : ''}
                            others={{ allowClear: true }}
                            loading={fetchingColetores}
                            debounceDelay={200}
                        />
                    </Col>

                    <Col span={12}>
                        <Row gutter={8}>
                            <Col span={24}>
                                <span>Coletores complementares:</span>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator(
                                        'coletoresComplementares'
                                    )(<Input placeholder="" type="text" />)}
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
            const { fetchingAutores, autores } = this.state
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
                            <SelectedFormField
                                title=""
                                placeholder="Selecione um autor"
                                fieldName="autor"
                                getFieldDecorator={getFieldDecorator}
                                onSearch={searchText => {
                                    this.requisitaAutores(searchText || '')
                                }}
                                others={{
                                    loading: fetchingAutores,
                                    notFoundContent: fetchingAutores ? (
                                        <Spin size="small" />
                                    ) : (
                                        'Nenhum resultado encontrado'
                                    )
                                }}
                                debounceDelay={200}
                                xs={24}
                                sm={24}
                                md={24}
                                lg={24}
                                xl={24}
                            >
                                {this.optionAutores()}
                            </SelectedFormField>
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
                        onCancel={() => {
                            this.setState({
                                visibleModal: false,
                                formColetor: 0,
                                formComAutor: false
                            })
                        }}
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
            paisInicial,
            estadoInicial,
            cidadeInicial,
            paises,
            estados,
            cidades,
            fetchingPaises,
            fetchingEstados,
            fetchingCidades,
            fetchingLocaisColeta
        } = this.state
        return (
            <div>
                <Row gutter={8}>
                    <LatLongFormField
                        getFieldDecorator={getFieldDecorator}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <PaisFormField
                        initialValue={String(paisInicial)}
                        paises={paises}
                        getFieldDecorator={getFieldDecorator}
                        rules={[
                            {
                                required: true,
                                message: 'Escolha um país'
                            }
                        ]}
                        onChange={value => {
                            if (value) {
                                this.requisitaEstados('', value)
                            } else {
                                this.setState({
                                    estados: [],
                                    cidades: [],
                                    locaisColeta: []
                                })
                                this.props.form.setFields({
                                    estados: { value: undefined },
                                    cidade: { value: undefined },
                                    complemento: { value: undefined }
                                })
                            }
                        }}
                        onSearch={searchText => {
                            this.requisitaPaises(searchText || '')
                        }}
                        loading={fetchingPaises}
                        debounceDelay={200}
                        status={getFieldError('pais') ? 'error' : ''}
                    />
                    <EstadoFormField
                        initialValue={String(estadoInicial)}
                        estados={estados}
                        getFieldDecorator={getFieldDecorator}
                        rules={[
                            {
                                required: true,
                                message: 'Escolha um estado'
                            }
                        ]}
                        disabled={!this.props.form.getFieldValue('pais')}
                        onChange={value => {
                            if (value) {
                                this.requisitaCidades('', value)
                            } else {
                                this.setState({
                                    cidades: [],
                                    locaisColeta: []
                                })
                                this.props.form.setFields({
                                    cidade: { value: undefined },
                                    complemento: { value: undefined }
                                })
                            }
                        }}
                        onSearch={searchText => {
                            const paisSelecionado = this.props.form.getFieldValue('pais')
                            if (paisSelecionado) {
                                this.requisitaEstados(
                                    searchText || '',
                                    paisSelecionado
                                )
                            }
                        }}
                        loading={fetchingEstados}
                        debounceDelay={200}
                        status={getFieldError('estado') ? 'error' : ''}
                    />
                    <CidadeFormField
                        initialValue={String(cidadeInicial)}
                        cidades={cidades}
                        getFieldDecorator={getFieldDecorator}
                        disabled={!this.props.form.getFieldValue('estados')}
                        onChange={value => {
                            const latitude = this.props.form.getFieldValue('latitude')
                            const longitude = this.props.form.getFieldValue('longitude')
                            try {
                                if (value && latitude && longitude) {
                                    this.verifyCoordenada(value)
                                }
                            } catch (err) {
                                console.error('Falha ao verificar coordenada:', err)
                            }
                            if (value) {
                                this.props.form.setFieldsValue({
                                    complemento: undefined
                                })
                                this.requisitaLocaisColeta('', value)
                            } else {
                                this.setState({ locaisColeta: [] })
                                this.props.form.setFields({
                                    complemento: { value: undefined }
                                })
                            }
                        }}
                        onSearch={searchText => {
                            const estadoSelecionado = this.props.form.getFieldValue('estados')
                            if (estadoSelecionado) {
                                this.requisitaCidades(
                                    searchText || '',
                                    estadoSelecionado
                                )
                            }
                        }}
                        loading={fetchingCidades}
                        debounceDelay={200}
                        validateStatus={this.state.cidadeStatus}
                        help={this.state.cidadeHelp}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <LocalColetaFormField
                        getFieldDecorator={getFieldDecorator}
                        initialValue={this.state.complementoInicial}
                        locaisColeta={this.state.locaisColeta}
                        fetchingLocaisColeta={fetchingLocaisColeta}
                        disabled={!this.props.form.getFieldValue('cidade')}
                        filterOption={false}
                        onSearch={searchText => {
                            const cidadeSelecionada = this.props.form.getFieldValue('cidade')
                            if (cidadeSelecionada) {
                                this.requisitaLocaisColeta(
                                    searchText || '',
                                    cidadeSelecionada
                                )
                            }
                        }}
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
                        loading={fetchingLocaisColeta}
                        debounceDelay={200}
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
            reinoInicial,
            familiaInicial,
            reinos,
            familias,
            generoInicial,
            generos,
            search,
            especieInicial,
            especies,
            subespecieInicial,
            subespecies,
            variedadeInicial,
            variedades,
            subfamiliaInicial,
            subfamilias,
            fetchingReinos,
            fetchingFamilias,
            fetchingSubfamilias,
            fetchingGeneros,
            fetchingEspecies,
            fetchingSubespecies,
            fetchingVariedades
        } = this.state

        const { form } = this.props
        const reinoSelecionado = form.getFieldValue('reino')
        const familiaSelecionada = form.getFieldValue('familia')
        const generoSelecionado = form.getFieldValue('genero')
        const especieSelecionada = form.getFieldValue('especie')

        return (
            <div>
                {this.props.match.params.tombo_id && (
                    <Row gutter={8} style={{ fontSize: 16, marginLeft: 5 }}>
                        Editar dados Tombo
                    </Row>
                )}
                <Row justify="end" gutter={8}>
                    <Button type="secondary">
                        <Link to="/tombos">Sair/Cancelar</Link>
                    </Button>
                </Row>
                <Row gutter={8}>
                    <InputFormField
                        name="numeroTombo"
                        title="Numero de Tombo:"
                        disabled
                        getFieldDecorator={getFieldDecorator}
                    />
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Col span={24}>
                            <span>Data do Tombo:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('dataTombo', {
                                    rules: [
                                        { validator: this.validateDataTombo }
                                    ]
                                })(
                                    <Input
                                        placeholder="DD/MM/AAAA"
                                        type="text"
                                        status={
                                            getFieldError
                                            && getFieldError('dataTombo')
                                                ? 'error'
                                                : ''
                                        }
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <br />
                <Row gutter={8}>
                    <ReinoFormField
                        initialValue={String(reinoInicial)}
                        reinos={reinos}
                        getFieldDecorator={getFieldDecorator}
                        onChange={value => {
                            if (value) {
                                this.requisitaFamilias('', value)
                            } else {
                                this.setState({
                                    familias: [],
                                    subfamilias: [],
                                    generos: [],
                                    especies: [],
                                    subespecies: [],
                                    variedades: [],
                                    autorSubfamilia: '',
                                    autorEspecie: '',
                                    autorSubespecie: '',
                                    autorVariedade: ''
                                })
                            }

                            this.props.form.setFields({
                                familia: { value: undefined },
                                subfamilia: { value: undefined },
                                genero: { value: undefined },
                                especie: { value: undefined },
                                subespecie: { value: undefined },
                                variedade: { value: undefined }
                            })
                        }}
                        onSearch={searchText => {
                            this.requisitaReinos(searchText || '')
                        }}
                        loading={fetchingReinos}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo reino',
                                    tipo: 12
                                },
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                    <FamiliaFormField
                        initialValue={String(familiaInicial)}
                        familias={familias}
                        getFieldDecorator={getFieldDecorator}
                        getFieldError={getFieldError}
                        disabled={!reinoSelecionado}
                        onChange={value => {
                            if (value) {
                                this.requisitaSubfamilias('', value)
                                this.requisitaGeneros('', value)
                            } else {
                                this.setState({
                                    subfamilias: [],
                                    generos: [],
                                    especies: [],
                                    subespecies: [],
                                    variedades: [],
                                    autorSubfamilia: '',
                                    autorEspecie: '',
                                    autorSubespecie: '',
                                    autorVariedade: ''
                                })
                            }

                            this.props.form.setFields({
                                subfamilia: { value: undefined },
                                genero: { value: undefined },
                                especie: { value: undefined },
                                subespecie: { value: undefined },
                                variedade: { value: undefined }
                            })
                        }}
                        onSearch={searchText => {
                            const reinoSelecionado = this.props.form.getFieldValue('reino')
                            if (reinoSelecionado) {
                                this.requisitaFamilias(
                                    searchText || '',
                                    reinoSelecionado
                                )
                            }
                        }}
                        loading={fetchingFamilias}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova família',
                                    tipo: 1
                                },
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <SubfamiliaFormField
                        initialValue={String(subfamiliaInicial)}
                        subfamilias={subfamilias}
                        validateStatus={search.subfamilia}
                        getFieldDecorator={getFieldDecorator}
                        disabled={!familiaSelecionada}
                        onChange={value => {
                            if (value) {
                                this.encontraAutor(
                                    subfamilias,
                                    value,
                                    'autorSubfamilia'
                                )
                            } else {
                                this.setState({ autorSubfamilia: '' })
                            }
                        }}
                        autor={this.state.autorSubfamilia}
                        onSearch={searchText => {
                            const familiaSelecionada = this.props.form.getFieldValue('familia')
                            if (familiaSelecionada) {
                                this.requisitaSubfamilias(
                                    searchText || '',
                                    familiaSelecionada
                                )
                            }
                        }}
                        loading={fetchingSubfamilias}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova subfamília',
                                    tipo: 2
                                },
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                    <GeneroFormField
                        initialValue={String(generoInicial)}
                        generos={generos}
                        validateStatus={search.genero}
                        getFieldDecorator={getFieldDecorator}
                        disabled={!familiaSelecionada}
                        onChange={value => {
                            if (value) {
                                this.requisitaEspecies('', value)
                            } else {
                                this.setState({
                                    especies: [],
                                    subespecies: [],
                                    variedades: [],
                                    autorEspecie: '',
                                    autorSubespecie: '',
                                    autorVariedade: ''
                                })
                            }

                            this.props.form.setFields({
                                especie: { value: undefined },
                                subespecie: { value: undefined },
                                variedade: { value: undefined }
                            })
                        }}
                        onSearch={searchText => {
                            const familiaSelecionada = this.props.form.getFieldValue('familia')
                            if (familiaSelecionada) {
                                this.requisitaGeneros(
                                    searchText || '',
                                    familiaSelecionada
                                )
                            }
                        }}
                        loading={fetchingGeneros}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo gênero',
                                    tipo: 3
                                },
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <EspecieFormField
                        initialValue={String(especieInicial)}
                        especies={especies}
                        validateStatus={search.especie}
                        getFieldDecorator={getFieldDecorator}
                        disabled={!generoSelecionado || !familiaSelecionada}
                        autor={this.state.autorEspecie}
                        onChange={value => {
                            if (value) {
                                this.requisitaSubespecies('', value)
                                this.requisitaVariedades('', value)
                                this.encontraAutor(
                                    especies,
                                    value,
                                    'autorEspecie'
                                )
                                this.setState({ formComAutor: true })
                            } else {
                                this.setState({
                                    subespecies: [],
                                    variedades: [],
                                    autorEspecie: '',
                                    autorSubespecie: '',
                                    autorVariedade: ''
                                })
                            }

                            this.props.form.setFields({
                                subespecie: { value: undefined },
                                variedade: { value: undefined }
                            })
                        }}
                        onSearch={searchText => {
                            const generoSelecionado = this.props.form.getFieldValue('genero')
                            if (generoSelecionado) {
                                this.requisitaEspecies(
                                    searchText || '',
                                    generoSelecionado
                                )
                            }
                        }}
                        loading={fetchingEspecies}
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
                        debounceDelay={200}
                    />
                    <SubespecieFormField
                        initialValue={String(subespecieInicial)}
                        subespecies={subespecies}
                        validateStatus={search.subespecie}
                        getFieldDecorator={getFieldDecorator}
                        disabled={
                            !especieSelecionada
                            || !generoSelecionado
                            || !familiaSelecionada
                        }
                        autor={this.state.autorSubespecie}
                        onChange={value => {
                            if (value) {
                                this.encontraAutor(
                                    subespecies,
                                    value,
                                    'autorSubespecie'
                                )
                            } else {
                                this.setState({ autorSubespecie: '' })
                            }
                        }}
                        onSearch={searchText => {
                            const especieSelecionada = this.props.form.getFieldValue('especie')
                            if (especieSelecionada) {
                                this.requisitaSubespecies(
                                    searchText || '',
                                    especieSelecionada
                                )
                            }
                        }}
                        loading={fetchingSubespecies}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova subespécie',
                                    tipo: 5
                                },
                                formComAutor: true,
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <VariedadeFormField
                        initialValue={String(variedadeInicial)}
                        variedades={variedades}
                        validateStatus={search.variedade}
                        getFieldDecorator={getFieldDecorator}
                        disabled={
                            !especieSelecionada
                            || !generoSelecionado
                            || !familiaSelecionada
                        }
                        autor={this.state.autorVariedade}
                        onChange={value => {
                            if (value) {
                                this.encontraAutor(
                                    variedades,
                                    value,
                                    'autorVariedade'
                                )
                            } else {
                                this.setState({ autorVariedade: '' })
                            }
                        }}
                        onSearch={searchText => {
                            const especieSelecionada = this.props.form.getFieldValue('especie')
                            if (especieSelecionada) {
                                this.requisitaVariedades(
                                    searchText || '',
                                    especieSelecionada
                                )
                            }
                        }}
                        loading={fetchingVariedades}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova variedade',
                                    tipo: 6
                                },
                                formComAutor: true,
                                visibleModal: true
                            })
                        }}
                        debounceDelay={200}
                    />
                </Row>
            </div>
        )
    }

    renderTipoSoloTombo = getFieldDecorator => {
        const {
            soloInicial,
            search,
            solos,
            relevos,
            faseInicial,
            relevoInicial,
            vegetacaoInicial,
            vegetacoes,
            fases,
            idSoloInicial,
            idRelevoInicial,
            idVegetacaoInicial,
            idFaseInicial,
            fetchingSolos,
            fetchingRelevos,
            fetchingVegetacoes,
            fetchingFases
        } = this.state

        return (
            <div>
                <Row gutter={8}>
                    <SoloFormField
                        initialValue={
                            idSoloInicial
                                ? {
                                    key: idSoloInicial,
                                    label: soloInicial
                                }
                                : undefined
                        }
                        solos={solos}
                        validateStatus={search.solo}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo solo',
                                    tipo: 8
                                },
                                visibleModal: true
                            })
                        }}
                        onSearch={searchText => {
                            this.requisitaSolos(searchText || '')
                        }}
                        loading={fetchingSolos}
                        debounceDelay={200}
                    />
                    <RelevoFormField
                        initialValue={
                            idRelevoInicial
                                ? {
                                    key: idRelevoInicial,
                                    label: relevoInicial
                                }
                                : undefined
                        }
                        relevos={relevos}
                        validateStatus={search.relevo}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo relevo',
                                    tipo: 9
                                },
                                visibleModal: true
                            })
                        }}
                        onSearch={searchText => {
                            this.requisitaRelevos(searchText || '')
                        }}
                        loading={fetchingRelevos}
                        debounceDelay={200}
                    />
                </Row>
                <br />
                <Row gutter={8}>
                    <VegetacaoFormField
                        initialValue={
                            idVegetacaoInicial
                                ? {
                                    key: idVegetacaoInicial,
                                    label: vegetacaoInicial
                                }
                                : undefined
                        }
                        vegetacoes={vegetacoes}
                        validateStatus={search.vegetacao}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova vegetação',
                                    tipo: 10
                                },
                                visibleModal: true
                            })
                        }}
                        onSearch={searchText => {
                            this.requisitaVegetacoes(searchText || '')
                        }}
                        loading={fetchingVegetacoes}
                        debounceDelay={200}
                    />
                    <FaseFormField
                        initialValue={
                            idFaseInicial
                                ? {
                                    key: idFaseInicial,
                                    label: faseInicial
                                }
                                : undefined
                        }
                        fases={fases}
                        validateStatus={search.fase}
                        getFieldDecorator={getFieldDecorator}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' da nova fase sucessional',
                                    tipo: 14
                                },
                                visibleModal: true
                            })
                        }}
                        onSearch={searchText => {
                            this.requisitaFases(searchText || '')
                        }}
                        loading={fetchingFases}
                        debounceDelay={200}
                    />
                </Row>
            </div>
        )
    }

    renderIdentificador = (getFieldDecorator, getFieldError) => {
        const {
            identificadores,
            identificadorInicial,
            identificadorNome,
            fetchingIdentificadores
        } = this.state
        const initialValue = identificadorInicial
            ? { key: String(identificadorInicial), label: identificadorNome }
            : undefined

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
                        placeholder="Selecione o identificador"
                        getFieldError={getFieldError}
                        onSearch={searchText => {
                            this.requisitaIdentificadores(searchText || '')
                        }}
                        filterOption={false}
                        loading={fetchingIdentificadores}
                        debounceDelay={200}
                        onClickAddMore={() => {
                            this.setState({
                                formulario: {
                                    desc: ' do novo identificador',
                                    tipo: 14
                                },
                                visibleModal: true
                            })
                        }}
                    />
                    <DataIdentificacaoFormField
                        getFieldDecorator={getFieldDecorator}
                        getFieldError={getFieldError}
                    />
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
                        onCancel={() => {
                            this.setState({
                                visibleModal: false,
                                formColetor: 0,
                                formComAutor: false,
                                formLocalColeta: false
                            })
                        }}
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
                                    case 14:
                                        this.cadastraNovoIdentificador()
                                        break
                                    case 15:
                                        this.cadastraNovaFase()
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
                    {this.renderPrincipaisCaracteristicas(
                        getFieldDecorator,
                        getFieldError
                    )}
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
                            ref={el => (this.barcodeRef = el)}
                            barcodePhotos={this.state.barcodePhotosFromServer}
                            barcodeEditList={this.state.codigosBarrasForm}
                            onDeletedBarcode={this.handleDeletedBarcode}
                            onChangeBarcodeList={this.handleChangeBarcodeList}
                            isEditing={this.state.isEditing}
                            onChangeBarcodePhotos={
                                this.handleChangeBarcodePhotos
                            }
                            onInitBarcodePhotos={this.handleInitBarcodePhotos}
                        />
                    </Row>
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
                    <Row type="flex" justify="start" gutter={8}>
                        <Col
                            style={{ marginLeft: 'auto' }}
                            xs={24}
                            sm={8}
                            md={3}
                            lg={3}
                            xl={3}
                        >
                            <ButtonComponent titleButton="Salvar" />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }

    renderPrincipaisCaracteristicas = (getFieldDecorator, getFieldError) => {
        const { fetchingHerbarios, herbarios } = this.state

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
                                    initialValue: String(
                                        this.state.numero_coleta
                                    )
                                })(
                                    <Input
                                        type="text"
                                        placeholder="785"
                                        style={{ width: '100%' }}
                                        status={
                                            getFieldError('numColeta')
                                                ? 'error'
                                                : ''
                                        }
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
                                            rules: [
                                                {
                                                    required: true,
                                                    message:
                                                        'Insira o dia da coleta'
                                                }
                                            ]
                                        })(
                                            <InputNumber
                                                min={1}
                                                max={31}
                                                initialValue={17}
                                                style={{ width: '100%' }}
                                                status={
                                                    getFieldError(
                                                        'dataColetaDia'
                                                    )
                                                        ? 'error'
                                                        : ''
                                                }
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataColetaMes', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message:
                                                        'Insira o mês da coleta'
                                                }
                                            ]
                                        })(
                                            <InputNumber
                                                min={1}
                                                max={12}
                                                initialValue={11}
                                                style={{ width: '100%' }}
                                                status={
                                                    getFieldError(
                                                        'dataColetaMes'
                                                    )
                                                        ? 'error'
                                                        : ''
                                                }
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem>
                                        {getFieldDecorator('dataColetaAno', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message:
                                                        'Insira o ano da coleta'
                                                },
                                                {
                                                    validator:
                                                        this
                                                            .validateAnoNaoFuturo
                                                }
                                            ]
                                        })(
                                            <InputNumber
                                                min={500}
                                                max={5000}
                                                initialValue={2018}
                                                style={{ width: '100%' }}
                                                status={
                                                    getFieldError(
                                                        'dataColetaAno'
                                                    )
                                                        ? 'error'
                                                        : ''
                                                }
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
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
                                    <Input
                                        placeholder="Maracujá Doce"
                                        type="text"
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <HerbarioFormField
                        initialValue={String(
                            !this.props.match.params.tombo_id
                                ? this.state.herbarioInicial?.value || ''
                                : this.state.herbarioInicial
                        )}
                        herbarios={herbarios}
                        getFieldDecorator={getFieldDecorator}
                        onSearch={searchText => {
                            this.requisitaHerbarios(searchText || '')
                        }}
                        loading={fetchingHerbarios}
                        debounceDelay={200}
                        getFieldError={getFieldError}
                    />
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
                                    initialValue: String(
                                        this.state.tipoInicial
                                    )
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
            return <Spin tip="Carregando...">{this.renderPorTipo()}</Spin>
        }
        return this.renderPorTipo()
    }
}

export default Form.create()(NovoTomboScreen)
