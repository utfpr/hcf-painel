import React from 'react';
import { Row, Col, Alert } from 'antd';

interface ErrorMessageProps {
    message: string | null;
    onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
    if (!message) {
        return null;
    }

    return (
        <Row justify="center">
            <Col span={24}>
                <Alert
                    type="error"
                    closable
                    message={message}
                    onClose={onClose}
                />
            </Col>
        </Row>
    );
};

export default ErrorMessage;