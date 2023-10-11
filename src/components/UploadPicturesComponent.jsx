import { Component } from 'react'

import { Upload, Button, Icon } from 'antd'

export default class UploadPicturesComponent extends Component {
    render() {
        return (
            <Upload
                multiple
                {...this.props}
            >
                <Button style={{ width: '100%' }}>
                    <Icon type="upload" />
                    {' '}
                    upload
                </Button>
            </Upload>
        )
    }
}
