import { Component } from 'react'

import { Row, Col, Button } from 'antd'
import { Link } from 'react-router-dom'

import { PlusOutlined } from '@ant-design/icons'

import {
    isCuradorOuOperador
} from '../helpers/usuarios'

export default class HeaderListComponent extends Component {
    renderButton() {
        if (this.props.add === undefined && isCuradorOuOperador()) {
            return (
                <Link to={this.props.link || '/'}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{
                            backgroundColor: '#5CB85C',
                            borderColor: '#5CB85C',
                            width: '100%'
                        }}
                    >
                        Adicionar
                    </Button>
                </Link>
            )
        }
    }

    render() {
        return (
            <Row gutter={24} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={12} md={16} lg={20} xl={20}>
                    <h2 style={{ fontWeight: 200 }}>{this.props.title}</h2>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                    {this.renderButton()}
                </Col>
            </Row>
        )
    }
}
