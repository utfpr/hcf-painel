import { Component } from 'react'

import {

    Checkbox,
    Row,
    Col,
    Divider,
    Tag
} from 'antd'

import { Form } from '@ant-design/compatible'
import { withTranslation } from 'react-i18next'
import ButtonExportComponent from '../components/ButtonExportComponent'

const FormItem = Form.Item

export class LivroTomboScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => { })
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={24}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('livroTombo:tituloLivroTombo')}</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col span={8}>
                        <span>{this.props.t('livroTombo:dataInicialColeta')}</span>
                    </Col>
                    <Col span={8}>
                        <span>{this.props.t('livroTombo:dataFinalColeta')}</span>
                    </Col>
                    <Col span={8}>
                        <span>{this.props.t('livroTombo:genero')}</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={8} />
                    <Col span={8} />
                    <Col span={8} />
                </Row>

                <Row gutter={8}>
                    <Col span={8}>
                        <span>{this.props.t('livroTombo:especie')}</span>
                    </Col>
                    <Col span={8}>
                        <span>{this.props.t('livroTombo:familia')}</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={8} />
                    <Col span={8} />
                </Row>

                <Row gutter={8}>
                    <Col span={24}>
                        <span>{this.props.t('livroTombo:selecaoCamposExportacao')}</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={24}>
                        <FormItem>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="geekblue">{this.props.t('livroTombo:codFamilia')}</Tag>
                            </Checkbox>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="magenta">{this.props.t('livroTombo:dataColeta')}</Tag>
                            </Checkbox>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="red">{this.props.t('livroTombo:familiaOpcao')}</Tag>
                            </Checkbox>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="blue">{this.props.t('livroTombo:especieOpcao')}</Tag>
                            </Checkbox>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="orange">{this.props.t('livroTombo:generoOpcao')}</Tag>
                            </Checkbox>
                            <Checkbox name="localidade">
                                {' '}
                                <Tag color="purple">{this.props.t('livroTombo:quantidade')}</Tag>
                            </Checkbox>
                        </FormItem>
                    </Col>
                </Row>
                <Divider dashed />
                <Row type="flex" justify="end">
                    <ButtonExportComponent />
                </Row>
            </Form>
        )
    }
}


const LivroTomboScreenWithForm = Form.create()(LivroTomboScreen)

export default withTranslation()(LivroTomboScreenWithForm)
