import { Button } from 'antd';
import React, { Component } from 'react';

export default class ButtonComponent extends Component {

	render() {
		return (
			<Button type="primary" htmlType="submit" style={{ width: "100%" }} >
				{this.props.titleButton}
			</Button>
		);
	}
}
