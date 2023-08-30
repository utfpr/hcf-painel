import { Upload, Button, Icon } from 'antd';
import React, { Component } from 'react';

export default class UploadPicturesComponent extends Component {

	render() {
		return (
			<Upload
				multiple
				{...this.props}
			>
				<Button style={{ width: "100%" }}>
					<Icon type="upload" /> upload
        		</Button>
			</Upload>
		);
	}
}
