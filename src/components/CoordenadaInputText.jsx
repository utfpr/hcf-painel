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

        console.log('props', props)

        this.state = {
            valorSaida: '',
            graus: '',
            minutos: '',
            segundos: '',
            pontoCardeal: ''
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

        this.props.onChange(dmsToDecimal(Number(graus), Number(minutos), Number(segundos.replace(',', '.')), pontoCardeal))
    }

    temValorValido = (valor1, valor2) => {
        const invalido = valor1 === undefined || valor1 === null
        return invalido ? valor2 : valor1
    }

    render() {
        const semValoresEmPropriedades = !this.graus && !this.minutos && !this.segundos
        const semValoresEmEstados = !this.state.graus && !this.state.minutos && !this.state.graus
        if (this.props.value && semValoresEmPropriedades && semValoresEmEstados) {
            const coordenadas = decimalParaGrausMinutosSegundos(this.props.value, this.props.longitude)

            this.state.graus = coordenadas.graus
            this.state.minutos = coordenadas.minutos
            this.state.segundos = coordenadas.segundos
            this.state.pontoCardeal = coordenadas.direcao
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
        )
    }
}

CoordenadaInputText.defaultProps = {
    onChange: () => { }
}

export default CoordenadaInputText
