import { Component } from 'react'

import { Upload, Button } from 'antd'

import { UploadOutlined } from '@ant-design/icons'

export default class UploadPicturesComponent extends Component {
    render() {
        return (
            <Upload
                multiple
                {...this.props}
            >
                <Button style={{ width: '100%' }}>
                    <UploadOutlined />
                    {' '}
                    upload
                </Button>
            </Upload>
        )
    }
}
