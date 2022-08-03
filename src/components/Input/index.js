import React, { memo, useCallback } from 'react';

import { Form, Input as InputAntd } from 'antd';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

const Input = memo(({
    type, name, label, pattern,
    validate, required, min, max, minLength,
    maxLength, ...others
}) => {
    const { register, setValue, formState } = useFormContext();
    const { errors } = formState;

    const onChange = useCallback(event => {
        setValue(name, event.target.value);
    }, [name, setValue]);

    const inputProps = register(name, {
        required,
        min,
        max,
        minLength,
        maxLength,
        pattern,
        validate,
    });

    const renderPassword = () => {
        return (
            <InputAntd.Password
                {...others}
                {...inputProps}
                onChange={onChange}
            />
        );
    };

    const renderInputs = () => {
        if (type === 'password') {
            return renderPassword();
        }
        return (
            <InputAntd
                {...others}
                {...inputProps}
                onChange={onChange}
            />
        );
    };

    const fieldError = errors && errors[name];
    const validateStatus = fieldError ? 'error' : '';
    const helpText = fieldError ? fieldError.message : undefined;

    return (
        <Form.Item
            label={label}
            validateStatus={validateStatus}
            help={helpText}
        >
            {renderInputs()}
        </Form.Item>
    );
});

Input.propTypes = {
    type: PropTypes.oneOf([
        'text',
        'password',
    ]),
    name: PropTypes.string.isRequired,
    label: PropTypes.elementType,
};

Input.defaultProps = {
    type: 'text',
    label: null,
};

export default Input;
