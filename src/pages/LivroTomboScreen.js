import React, { Component } from 'react';
import {
    Form,
    Checkbox,
    Row,
    Col,
    Divider,
    Tag,
} from 'antd';
import ButtonExportComponent from '../components/ButtonExportComponent';

const FormItem = Form.Item;

export default class LivroTomboScreen extends Component {

    state = {};

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log("Received values of form: ", values);
            }
        });
    };

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={24}>
                        <h2 style={{ fontWeight: 200 }}>Livro Tombo</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col span={8}>
                        <span>Data inicial da coleta:</span>
                    </Col>
                    <Col span={8}>
                        <span>Data final de coleta:</span>
                    </Col>
                    <Col span={8}>
                        <span>Gênero:</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={8}>
                    </Col>
                    <Col span={8}>
                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>

                <Row gutter={8}>
                    <Col span={8}>
                        <span>Espécie:</span>
                    </Col>
                    <Col span={8}>
                        <span>Família:</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={8}>

                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>

                <Row gutter={8}>
                    <Col span={24}>
                        <span>Selecione os campos a serem exportados:</span>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col span={24}>
                        <FormItem>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="geekblue">Cód. Família</Tag>
                            </Checkbox>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="magenta">Data da Coleta</Tag>
                            </Checkbox>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="red">Família</Tag>
                            </Checkbox>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="blue">Espécie</Tag>
                            </Checkbox>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="orange">Gênero</Tag>
                            </Checkbox>
                            <Checkbox name={"localidade"}>
                                {" "}
                                <Tag color="purple">Quantidade</Tag>
                            </Checkbox>
                        </FormItem>
                    </Col>
                </Row>
                <Divider dashed />
                <Row type="flex" justify="end">
                    <ButtonExportComponent />
                </Row>
            </Form>
        );
    }
}
