import React, { Component } from 'react';
import { Modal, Button } from 'antd';


export default class ModalCadastroComponent extends Component {

    state = {};

    render() {
        return (
            <Modal
                visible={this.props.visibleModal}
                title={this.props.title}
                onOk={this.props.onOk}
                onCancel={this.props.onCancel}
                footer={[
                    <Button key="back" onClick={this.props.onCancel}>Cancelar</Button>,
                    <Button key="submit" type="primary"
                        loading={this.props.loadingModal} onClick={this.props.onOk}>
                        Cadastrar
                     </Button>
                ]}
            >
                {this.props.children}
            </Modal>
        );
    }
}
