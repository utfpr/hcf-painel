import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    notification, Button, Select, Switch, Collapse
} from 'antd'
import axios from 'axios'
import moment from 'moment'
import { withTranslation } from 'react-i18next'

import { Form } from '@ant-design/compatible'

import HeaderServicesComponent from '../components/HeaderServicesComponent'

const FormItem = Form.Item
const { Option } = Select
const { Panel } = Collapse

class ExportaçãoScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            estaMontado: false,
            executandoDarwinCore: false,
            executandoSplinker: false,
            cancelTokenSource: null
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({ estaMontado: true })
    }

    componentWillUnmount() {
        if (this.state.cancelTokenSource) {
            this.state.cancelTokenSource.cancel(this.props.t('exportacaoScreen:requisicaoCancelada'))
        }
        this.setState({ estaMontado: false })
    }

    exportaDarwinCore = () => {
        const cancelTokenSource = axios.CancelToken.source()
        this.setState({ cancelTokenSource, executandoDarwinCore: true })

        axios.get('/darwincore', {
            responseType: 'blob',
            cancelToken: cancelTokenSource.token
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'hcf_darwincore.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
        })
            .finally(() => {
                this.setState({ executandoDarwinCore: false, cancelTokenSource: null })
            })
            .catch(err => {
                console.error(this.props.t('exportacaoScreen:erroAcessarDarwinCore'), err)
            })
    }

    exportaSplinker = () => {
        const cancelTokenSource = axios.CancelToken.source()
        this.setState({ cancelTokenSource, executandoSplinker: true })

        axios.get('/splinker', {
            responseType: 'blob',
            cancelToken: cancelTokenSource.token
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'hcf_splinker.txt')
            document.body.appendChild(link)
            link.click()
            link.remove()
        })
            .finally(() => {
                this.setState({ executandoSplinker: false, cancelTokenSource: null })
            })
            .catch(err => {
                console.error(this.props.t('exportacaoScreen:erroAcessarSplinker'), err)
            })
    }

    renderPainel() {
        return (
            <Card title={this.props.t('exportacaoScreen:opcoesExportacao')}>
                <Row gutter={6}>
                    <Col span={6} style={{ textAlign: 'center' }}>
                        {!this.state.executandoDarwinCore ? <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.exportaDarwinCore}>{this.props.t('exportacaoScreen:darwinCore')}</Button> : <span style={{ fontWeight: 'bold' }}>{this.props.t('exportacaoScreen:exportandoAguarde')}</span>}
                    </Col>
                    <Col span={6} style={{ textAlign: 'center' }}>
                        {!this.state.executandoSplinker ? <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.exportaSplinker}>{this.props.t('exportacaoScreen:splinker')}</Button> : <span style={{ fontWeight: 'bold' }}>{this.props.t('exportacaoScreen:exportandoAguarde')}</span>}
                    </Col>
                </Row>
            </Card>
        )
    }

    render() {
        return (
            <Form>
                <HeaderServicesComponent title={this.props.t('exportacaoScreen:exportacoes')} />
                <Divider dashed />
                {this.renderPainel()}
                <Divider dashed />
            </Form>
        )
    }
}
const ExportaçãoScreenWithForm = Form.create()(ExportaçãoScreen)

export default withTranslation()(ExportaçãoScreenWithForm)
