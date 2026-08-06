import { Component } from 'react'

import { Modal, Button } from 'antd'

import i18n from '@/i18n'

export default class ModalCadastroComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <Modal
                visible={this.props.visibleModal}
                title={this.props.title}
                onOk={this.props.onOk}
                onCancel={this.props.onCancel}
                footer={[
                    <Button key="back" onClick={this.props.onCancel}>{i18n.t('common:cancelar')}</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={this.props.loadingModal}
                        onClick={this.props.onOk}
                    >
                        {this.props.title}
                    </Button>
                ]}
            >
                {this.props.children}
            </Modal>
        )
    }
}
