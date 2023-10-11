import { Component } from 'react'

import { Input, Row, Col } from 'antd'
import masker from 'vanilla-masker'

import decimalParaGrausMinutosSegundos from '../helpers/conversoes/Coordenadas'

class CoordenadaInputText extends Component {
    constructor(props) {
        super(props)

        this.state = {
            valorSaida: ''
        }
    }

    aplicaMascaraNoCampo = (campo, mascara, valor) => {
        const valorMascarado = masker.toPattern(valor, mascara)
        this.setState({ [campo]: valorMascarado }, this.onStateChanged)
    }

    onStateChanged = () => {
        const {
            graus, minutos, segundos, pontoCardeal
        } = this.state
        this.props.onChange(`${graus}°${minutos}'${segundos}"${pontoCardeal}`)
    }

    temValorValido = (valor1, valor2) => {
        const invalido = valor1 === undefined || valor1 === null
        return invalido ? valor2 : valor1
    }

    render() {
        const semValoresEmPropriedades = !this.graus && !this.minutos && !this.segundos
        const semValoresEmEstados = !this.state.graus && !this.state.minutos && !this.state.graus
        if (this.props.value && semValoresEmPropriedades && semValoresEmEstados) {
            const coordenadas = decimalParaGrausMinutosSegundos(this.props.value, true)

            this.graus = coordenadas.graus
            this.minutos = coordenadas.minutos
            this.segundos = coordenadas.segundos
            this.pontoCardeal = coordenadas.direcao
        }

        return (
            <Row gutter={6}>
                <Col span={6}>
                    <Input
                        type="text"
                        placeholder="48"
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
                        value={this.temValorValido(this.state.segundos, this.segundos)}
                        onChange={event => {
                            const { value } = event.target
                            this.aplicaMascaraNoCampo('segundos', '99,99', value)
                        }}
                    />
                </Col>
                <Col span={6}>
                    <Input
                        type="text"
                        placeholder="W"
                        value={this.temValorValido(this.state.pontoCardeal, this.pontoCardeal)}
                        maxLength="1"
                        onChange={event => {
                            const { value } = event.target
                            const pontoCardeal = value.replace(/[^WENS]+/i, '')
                                .toUpperCase()

                            this.setState({ pontoCardeal }, this.onStateChanged)
                        }}
                    />
                </Col>
            </Row>
        )
    }
}

CoordenadaInputText.defaultProps = {
    onChange: () => { }
}

export default CoordenadaInputText
