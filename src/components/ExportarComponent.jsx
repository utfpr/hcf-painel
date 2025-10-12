import { Component } from 'react'

import {

    Row,
    Col,
    Collapse,
    Tag,
    Checkbox
} from 'antd'

import { Form } from '@ant-design/compatible'

import ButtonExportComponent from './ButtonExportComponent'

const { Panel } = Collapse
const FormItem = Form.Item

export default class ExportarComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {})
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Collapse accordion>
                    <Panel header="Selecione os campos a serem exportados:" key="1">
                        <Row gutter={8}>
                            <Col span={24}>
                                <FormItem>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="magenta">Data da Coleta</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="red">Família</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="red">Subfamília</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="red">Gênero</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="blue">Espécie</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="blue">Subespécie</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="red">Variedade</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="orange">Autor</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="gold">Nº Tombo</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="gold">Sequencia do tombo</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="gold">Codigo de barra</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="purple">Latitude</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="green">Longitude</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="green">Altitude</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="volcano">Nº Coleta</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="geekblue">Coletores</Tag>
                                    </Checkbox>
                                    <Checkbox name="localidade">
                                        {' '}
                                        <Tag color="geekblue">Quantidade de coleta por coletor</Tag>
                                    </Checkbox>
                                </FormItem>
                                <Row type="flex" justify="end">
                                    <ButtonExportComponent />
                                </Row>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>

            </Form>
        )
    }
}
