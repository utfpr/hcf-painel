import { Component } from 'react'

import { Button } from 'antd'

export default class ButtonComponent extends Component {
    render() {
        return (
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                {this.props.titleButton}
            </Button>
        )
    }
}
