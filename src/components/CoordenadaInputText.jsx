import { Component } from 'react'

import {
    Input, Row, Col, Select
} from 'antd'
import masker from 'vanilla-masker'

import dmsToDecimal from '@/helpers/conversoes/CoordenadasParaDecimal'

import decimalParaGrausMinutosSegundos from '../helpers/conversoes/Coordenadas'

class CoordenadaInputText extends Component {
    constructor(props) {
        super(props)

        this.state = {
            valorSaida: '',
            graus: '',
            minutos: '',
            segundos: '',
            pontoCardeal: props.longitude ? 'W' : 'S',
            erroGraus: false,
            erroMinutos: false,
            erroSegundos: false
        }

        this.hasUserEdited = false
    }

    componentDidMount() {
        this.syncFromPropsValue()
    }

    componentDidUpdate(prevProps) {
        const prevValue = prevProps.value
        const nextValue = this.props.value

        if (
            prevValue !== nextValue
            && !this.hasUserEdited
            && nextValue !== undefined
            && nextValue !== null
            && nextValue !== ''
        ) {
            this.syncFromPropsValue()
        }
    }

    syncFromPropsValue = () => {
        if (this.props.value === undefined || this.props.value === null || this.props.value === '') {
            this.setState({
                graus: '',
                minutos: '',
                segundos: '',
                pontoCardeal: this.props.longitude ? 'W' : 'S',
                erroGraus: false,
                erroMinutos: false,
                erroSegundos: false
            })
            return
        }

        const coordenadas = decimalParaGrausMinutosSegundos(Number(this.props.value), this.props.longitude)

        this.setState({
            graus: coordenadas.graus,
            minutos: coordenadas.minutos,
            segundos: coordenadas.segundos,
            pontoCardeal: coordenadas.direcao,
            erroGraus: false,
            erroMinutos: false,
            erroSegundos: false
        })
    }

    getMaxGraus = () => {
        return this.props.longitude ? 180 : 90
    }

    validaGraus = valor => {
        if (valor === '' || valor === undefined) return true
        const num = Number(valor)
        return !isNaN(num) && num >= 0 && num <= this.getMaxGraus()
    }

    validaMinutos = valor => {
        if (valor === '' || valor === undefined) return true
        const num = Number(valor)
        return !isNaN(num) && num >= 0 && num < 60
    }

    validaSegundos = valor => {
        if (valor === '' || valor === undefined) return true
        const num = Number(valor.replace(',', '.'))
        return !isNaN(num) && num >= 0 && num < 60
    }

    aplicaMascaraNoCampo = (campo, mascara, valor) => {
        const valorMascarado = masker.toPattern(valor, mascara)
        this.hasUserEdited = true

        const erroState = {}
        if (campo === 'graus') {
            erroState.erroGraus = !this.validaGraus(valorMascarado)
        } else if (campo === 'minutos') {
            erroState.erroMinutos = !this.validaMinutos(valorMascarado)
        } else if (campo === 'segundos') {
            erroState.erroSegundos = !this.validaSegundos(valorMascarado)
        }

        this.setState({ [campo]: valorMascarado, ...erroState }, () => {
            if (valorMascarado === '') {
                this.props.onChange('')
                return
            }

            const {
                graus, minutos, segundos, pontoCardeal
            } = this.state

            if ([graus, minutos, segundos].some(v => v === '' || v === undefined || v === null)) {
                this.props.onChange('')
                return
            }

            this.props.onChange(
                dmsToDecimal(
                    Number(graus),
                    Number(minutos),
                    Number(segundos.replace(',', '.')),
                    pontoCardeal
                )
            )
        })
    }

    temValorValido = (valor1, valor2) => {
        const invalido = valor1 === undefined || valor1 === null
        return invalido ? valor2 : valor1
    }

    getErroStyle = () => ({
        borderColor: '#ff4d4f',
        boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)'
    })

    render() {
        const { erroGraus, erroMinutos, erroSegundos } = this.state
        const maxGraus = this.getMaxGraus()

        return (
            <div>
                <Row gutter={6}>
                    <Col span={6}>
                        <Input
                            type="text"
                            placeholder="48"
                            style={erroGraus ? this.getErroStyle() : {}}
                            status={erroGraus ? 'error' : undefined}
                            value={this.temValorValido(this.state.graus, this.graus)}
                            onChange={event => {
                                const { value } = event.target
                                this.aplicaMascaraNoCampo('graus', '999', value)
                            }}
                        />
                    </Col>
                    <Col span={6}>
                        <Input
                            type="text"
                            placeholder="56"
                            style={erroMinutos ? this.getErroStyle() : {}}
                            status={erroMinutos ? 'error' : undefined}
                            value={this.temValorValido(this.state.minutos, this.minutos)}
                            onChange={event => {
                                const { value } = event.target
                                this.aplicaMascaraNoCampo('minutos', '99', value)
                            }}
                        />
                    </Col>
                    <Col span={6}>
                        <Input
                            type="text"
                            placeholder="15,5"
                            style={erroSegundos ? this.getErroStyle() : {}}
                            status={erroSegundos ? 'error' : undefined}
                            value={this.temValorValido(this.state.segundos, this.segundos)}
                            onChange={event => {
                                const { value } = event.target
                                this.aplicaMascaraNoCampo('segundos', '99,99', value)
                            }}
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            onChange={value => {
                                this.setState({ pontoCardeal: value }, this.onStateChanged)
                            }}
                            value={this.temValorValido(this.state.pontoCardeal, this.pontoCardeal)}
                            placeholder={this.props.longitude ? 'E' : 'N'}
                            options={this.props.longitude
                                ? [
                                        { value: 'W', label: 'W' },
                                        { value: 'E', label: 'E' }
                                    ]
                                : [
                                        { value: 'N', label: 'N' },
                                        { value: 'S', label: 'S' }
                                    ]}
                        />
                    </Col>
                </Row>
                {(erroGraus || erroMinutos || erroSegundos) && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                        {erroGraus && (
                            <div>
                                Graus inválidos (0-
                                {maxGraus}
                                )
                            </div>
                        )}
                        {erroMinutos && <div>Minutos inválidos (0-59)</div>}
                        {erroSegundos && <div>Segundos inválidos (0-59.99)</div>}
                    </div>
                )}
            </div>
        )
    }
}

// eslint-disable-next-line react-x/no-default-props
CoordenadaInputText.defaultProps = {
    onChange: () => { }
}

export default CoordenadaInputText
