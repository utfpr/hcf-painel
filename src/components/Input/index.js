/* eslint-disable no-unused-vars */
import React, { memo, useCallback } from 'react';

import {
    Form, Input as InputAntd, InputNumber, Radio,
} from 'antd';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import useClassNames from '../../hooks/use-classnames';
import styles from './Input.module.scss';

const RadioGroup = Radio.Group;
const Input = memo(({
    type, name, label, pattern, children,
    validate, required, min, max, minLength,
    maxLength, className, ...others
}) => {
    const { register, setValue, formState } = useFormContext();
    const { errors } = formState;
    // const inputStyle = useClassNames([styles.content, className]);

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

    const renderInputNumber = () => {
        return (
            <InputNumber
                {...others}
                {...inputProps}
                onChange={onChange}
                // className={inputStyle}
            />
        );
    };

    const renderRadioGroup = () => {
        return (
            <RadioGroup
                {...others}
                {...inputProps}
                onChange={onChange}
            >
                {children}
            </RadioGroup>
        );
    };

    const renderInputs = () => {
        if (type === 'password') {
            return renderPassword();
        }
        if (type === 'number') {
            return renderInputNumber();
        }
        if (type === 'radioGroup') {
            return renderRadioGroup();
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
