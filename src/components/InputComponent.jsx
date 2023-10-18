import React from 'react';
import { Form, Input, Checkbox } from 'antd';

import { MailOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'

const validateMessages = {
    required: '${label} is required!',
    types: {
        email: 'is not a valid email!',
        number: '${label} is not a valid number!',
    },
    number: {
        range: '${label} must be between ${min} and ${max}',
    },
};

const InputComponent = ({ type, label, name, rules, formStyle, placeholder, text }) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);


    const renderInput = () => {
        switch (type) {
            case "select":
                break;
            case "password":
                return (
                    <Input.Password
                        size="large"
                        type="password"
                        placeholder={placeholder}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                )
            case "email":
                return (
                    <Input
                        style={formStyle}
                        size="large"
                        placeholder={placeholder}
                    />
                )
            case "checkbox":
                return (
                    <Checkbox>{text}</Checkbox>
                )
            default:
                break;
        }
    }

    const getRules = () => {
        if (type == "email") {
            return [{ type: 'email' }]
        }

        return rules
    }

    return (
        <Form.Item
            label={label}
            name={name}
            rules={getRules()}
            type={type}
            validateMessages={validateMessages}
        >
            {renderInput()}
        </Form.Item>
    );
}

export default InputComponent;
