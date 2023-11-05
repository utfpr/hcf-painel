import { Component } from 'react'

import { Button } from 'antd'

import { ExportOutlined } from '@ant-design/icons'

export default class ButtonExportComponent extends Component {
    render() {
        return (
            <Button
                type="primary"
                icon={<ExportOutlined />}
                style={{ backgroundColor: '#FF7F00', borderColor: '#FF7F00' }}
            >
                Exportar
            </Button>
        )
    }
}
