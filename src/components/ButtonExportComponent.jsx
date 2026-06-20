import { Component } from 'react'

import { Button } from 'antd'
import { withTranslation } from 'react-i18next'

import { ExportOutlined } from '@ant-design/icons'

class ButtonExportComponent extends Component {
    render() {
        return (
            <Button
                type="primary"
                icon={<ExportOutlined />}
                style={{ backgroundColor: '#FF7F00', borderColor: '#FF7F00' }}
            >
                {this.props.t('tombo:export')}
            </Button>
        )
    }
}

export default withTranslation()(ButtonExportComponent)
