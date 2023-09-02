import { Upload, Button } from 'antd';
import React, { Component } from 'react';

import { UploadOutlined } from '@ant-design/icons';
export default class UploadPicturesComponent extends Component {

	render() {
		return (
			<Upload
				multiple
				{...this.props}
			>
				<Button icon={<UploadOutlined />} style={{ width: "100%" }} />
			</Upload>
		);
	}
}
