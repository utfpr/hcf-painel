import React, { Component } from 'react';
import { Button } from 'antd';

export default class ButtonExportComponent extends Component {

    render() {
        return (
            <Button
                type="primary"
                icon="export"
                style={{ backgroundColor: "#FF7F00", borderColor: "#FF7F00" }}
            >
                Exportar
      </Button>
        );
    }
}
