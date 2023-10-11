import { Component } from 'react'

import {
    Divider, Card, Row, Col, Form, Button, Collapse, Upload, notification, Select, Icon
} from 'antd'
import axios from 'axios'

import HeaderServicesComponent from '../components/HeaderServicesComponent'

const { Panel } = Collapse
const { Option } = Select
/**
 * Instanciamos o axios dessa forma diferente, para evitar problemas no back end.
 * Esse problema no back end, está relacionado ao CORS, então por isso adicionamos
 * um parâmetro no cabeçalho que será utilizado na requisição.
 */
const AXIOS = axios.create({
    baseURL: 'http://localhost:3003/api',
    headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3003/api'
    }
})

class ServicosSpeciesLinkScreen extends Component {
    /**
     * O constructor é aqui que herda as características do pai, que no caso é
     * o Component, além disso, é inicializado as varáveis de estados.
     * @param {*} props, que herda as caracterísitcas da classe extendida Componente.
     */
    constructor(props) {
        super(props)
        this.state = {
            estaMontado: false,
            arquivo: null,
            statusExecucao: false,
            nomeLog: [],
            horarioUltimaAtualizacao: '',
            duracaoAtualizacao: '',
            saidaLOG: []
        }
    }

    /**
     * A função componentWillMount, ela é invocada quando os componentes estão prestes
     * a serem montados. Nessa função mudamos o valor da variável de estado permitindo
     * assim que futuramente sejam mudado os valores das demais variáveis de estado.
     */
    componentWillMount() {
        this.setState({ estaMontado: true })
    }

    /**
     * A função componentDidMount, ela é invocada logo após os componentes serem montados.
     * Nessa função invocamos funções que realizam requisições ao backend de tempos em tempos,
     * e também realizamos requisições para obter informações, como a hora da última atualização,
     * a duração dessa última atualização e todos os logs relacionados ao herbário virtual.
     */
    componentDidMount() {
        this.informacoesSpeciesLink()
        this.statusExecucao()
    }

    /**
     * A função componentWillUnmount, ela é invocada quando os componentes serão desmontados,
     * por exemplo quando você troca de funcionalidades. Nela muda o valor da variável de estado
     * que é uma variável que verifica se os componentes do front end estão montados ou não.
     * É necessário mudar o valor dessa variável de estado para evitar que seja mudados
     * os valores de variáveis de estados que não estejam montados. Além disso, ela é
     * utilizada pausar o setInterval que foram iniciados em outras funções. Essa função é
     * de extrema importância, pois evita problemas, pois se você não pausa o setInterval
     * ele vai tentar ficar mudando o valor de uma variável de estado que não está montada.
     */
    componentWillUnmount() {
        clearInterval(this.timerStatusExecucao)
        this.setState({ estaMontado: false })
    }

    /**
     * A função informacoesSpeciesLink, ela envia como parâmetro de requisição speciesLink
     * e é retornado informações de speciesLink que são: os logs que existem relacionado
     * ao speciesLink, o horário da última atualização e a duração da última atualização.
     */
    informacoesSpeciesLink = () => {
        const params = {
            herbarioVirtual: 'specieslink'
        }
        AXIOS.get('/specieslink-todoslogs', { params }).then(response => {
            if (response.status === 200) {
                const logs = response.data.logs.sort()
                const { duracao } = response.data
                if (this.state.estaMontado) {
                    this.setState({ nomeLog: logs })
                    this.setState({ horarioUltimaAtualizacao: logs[logs.length - 1] })
                    this.setState({ duracaoAtualizacao: duracao })
                }
            }
        })
    }

    /**
     * A função statusExecucao, ela realizar requisições ao back end de cinco
     * em cinco segundos. Nesse tempo, ela verifica se o resultado retornado
     * pelo back end é true ou false. Se é retornado true, mudamos o
     * valor de uma variável de estado para true, caso seja false mudamos o valor da variável
     * de estado para false. A mudança desses valores afeta se vai ficar habilitado
     * ou desabilitado os botões de upload e de enviar esse upload.
     */
    statusExecucao = () => {
        this.timerStatusExecucao = setInterval(() => {
            AXIOS.get('/specieslink-status-execucao').then(response => {
                if (response.status === 200) {
                    if (response.data.result) {
                        if (this.state.estaMontado) {
                            this.setState({ statusExecucao: true })
                        }
                    } else if (this.state.estaMontado) {
                        this.setState({ statusExecucao: false })
                    }
                }
            })
        }, 5000)
    }

    /**
     * A função conteudoLogSelecionado, ela recebe como parâmetro o nome do
     * log na qual se deseja saber saber o conteúdo desse arquivo. Então
     * durante a requisição é passado o nome do arquivo e o conteúdo retornado
     * é atribuído a uma variável de estado.
     * @param {*} log, é o nome do arquivo de log na qual se deseja saber o seu conteúdo.
     */
    conteudoLogSelecionado = log => {
        const params = {
            herbarioVirtual: 'specieslink',
            nomeLog: log
        }
        AXIOS.get('/specieslink-log', { params }).then(response => {
            if (this.state.estaMontado) {
                this.setState({ saidaLOG: response.data.log })
            }
        })
    }

    /**
     * A função enviaArquivo, é invocada quando o botão de enviar arquivo é clicado
     * na qual é pego o valor da variável de estado, é definido os parâmetros de cabeçalho
     * da requisição, e é feito a requisição ao back end. A partir do resultado feito dá
     * requisição, é mudado o valor da variável de estado e é mostrado uma notificação
     * dependendo do valor do resultado da requisição.
     */
    enviaArquivo = () => {
        const dadosArquivo = new FormData()
        dadosArquivo.append('arquivoSpeciesLink', this.state.arquivo)
        const cabecalhoRequisicao = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        AXIOS.post('/specieslink-executa', dadosArquivo, cabecalhoRequisicao).then(response => {
            if (response.status === 200) {
                if (response.data.result === 'error_file') {
                    this.exibeNotificacao('error', 'Falha', 'O arquivo não é o esperado.')
                } else if (response.data.result === 'failed') {
                    this.exibeNotificacao('error', 'Falha', 'Atualização já está ocorrendo.')
                } else {
                    if (this.state.estaMontado) {
                        this.setState({ statusExecucao: true })
                    }
                    this.exibeNotificacao('success', 'Sucesso', 'Atualização iniciará em breve.')
                }
            }
        })
    }

    /**
     * A função exibeNotificacao, renderiza no canto superior direito uma mensagem
     * que é passa por parâmetro, e uma descrição dela que também é passada por parâmetro.
     * Ela é utiliza quando conseguiu sucesso ou erro na hora de realizar o upload
     * do arquivo no speciesLink.
     * @param {*} type, é o tipo de notificação que irá aparecer.
     * @param {*} message, é a mensagem que irá ser renderizada.
     * @param {*} description, é a descrição que será renderizada.
     */
    exibeNotificacao = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    /**
     * A função renderPainelEnviarInformacoes, renderiza na interface do species Link
     * o botão de upload (Nesse botão é definido algumas propriedades do upload, como a de
     * atribuir o arquivo que foi feito o upload na variável de estado), o botão para submeter
     * o arquivo que foi feito o upload, label de quanto foi realizada a última atualização e
     * a duração dela, a lista de todos os logs existem, e um campo que exibe o log selecionado.
     */
    renderPainelEnviarInformacoes() {
        const { arquivo } = this.state
        const props = {
            onRemove: f => {
                if (this.state.estaMontado) {
                    this.setState({ arquivo: f })
                }
            },
            beforeUpload: f => {
                if (this.state.estaMontado) {
                    this.setState({ arquivo: f })
                }
                return false
            },
            arquivo
        }
        return (
            <Card title="Buscar informações no speciesLink">
                <Row gutter={8}>
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <Upload {...props}>
                            <Button htmlType="submit" className="login-form-button" disabled={this.state.statusExecucao}>
                                <Icon type="upload" />
                                {' '}
                                Insira o arquivo do speciesLink
                            </Button>
                        </Upload>
                    </Col>
                    {this.state.statusExecucao
                        ? (
                            <Col span={6} style={{ textAlign: 'center', top: '6px' }}>
                                <span style={{ fontWeight: 'bold' }}>EXECUTANDO!!! AGUARDE...</span>
                            </Col>
                        )
                        : (
                            <Col span={6}>
                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.enviaArquivo} disabled={this.state.statusExecucao}>
                                    Enviar
                                </Button>
                            </Col>
                        )}
                    <Col span={6} style={{ textAlign: 'center', top: '6px' }}>
                        <span style={{ fontWeight: 'bold' }}>
                            A última atualização foi feita
                            {this.state.horarioUltimaAtualizacao}
                            {' '}
                            e durou
                            {this.state.duracaoAtualizacao}
                            .
                        </span>
                    </Col>
                    <Col span={6}>
                        <Select placeholder="Selecione o LOG desejado" onChange={this.conteudoLogSelecionado}>
                            {this.state.nomeLog.map((saida, chave) => {
                                return <Option key={chave} value={saida}>{saida}</Option>
                            })}
                        </Select>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 20 }} gutter={6} />
                <Row gutter={6}>
                    <Col span={24}>
                        <Collapse accordion>
                            <Panel header="Verificar LOG de saída" key={this.state.escondeResultadoLog}>
                                {this.state.saidaLOG.map((saida, chave) => {
                                    if (saida.includes('Erro')) {
                                        return <p key={chave} style={{ fontFamily: 'Courier New', color: 'red' }}>{saida}</p>
                                    }
                                    return <p key={chave} style={{ fontFamily: 'Courier New', color: 'green' }}>{saida}</p>
                                })}
                            </Panel>
                        </Collapse>
                    </Col>
                </Row>
            </Card>
        )
    }

    /**
     * A função render, renderiza o cabeçalho da interface e invoca
     * a outra função renderPainelEnviarInformacoes, que tem os demais
     * componentes como botão de upload e enviar arquivo, listar
     * os logs e as suas saídas.
     */
    render() {
        return (
            <Form>
                <HeaderServicesComponent title="SpeciesLink" />
                <Divider dashed />
                {this.renderPainelEnviarInformacoes()}
                <Divider dashed />
            </Form>
        )
    }
}

// Exportar essa classe como padrão
export default Form.create()(ServicosSpeciesLinkScreen)
