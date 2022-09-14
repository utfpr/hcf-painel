import React, { useCallback, useMemo, useState } from 'react';

import { Form, Select, SelectProps } from 'antd';
import debounce from 'lodash.debounce';
import { useFormContext } from 'react-hook-form';

import useAsync from '../../hooks/use-async';
import styles from './SearchSelect.module.scss';
import { TOption, TRequestFn } from './types';

export type TSearchSelectProps<ValueType> = SelectProps<ValueType, TOption> & {
    request: TRequestFn;
    onChange?: (value?: TOption | TOption[]) => void;
};

const SearchSelect = React.memo(<ValueType, >({
    request,
    onChange,
    ...props
}: TSearchSelectProps<ValueType>) => {
    const [options, setOptions] = useState<TOption[]>([]);

    const [isRequestingOptions, requestOptions] = useAsync(async (params: Parameters<TRequestFn>[0]) => {
        const response = await request(params);
        setOptions(response);
    });

    const handleSearch = useMemo<(text: string) => void>(() => {
        const onSearchCallback = (text: string) => {
            requestOptions({ limit: 10, page: 1, text });
        };
        return debounce(onSearchCallback, 500);
    }, [requestOptions]);

    const handleChange = useCallback<(_: unknown, option: TOption | TOption[]) => void>((_, option) => {
        onChange?.(option);
    }, [onChange]);

    return (
        <Select
            {...props}
            showSearch
            showArrow
            allowClear
            filterOption={false}
            options={options}
            loading={isRequestingOptions}
            onSearch={handleSearch}
            onChange={handleChange}
            className={styles.select}
        />
    );
});

export type TSearchSelectFieldProps<ValueType> = TSearchSelectProps<ValueType> & {
    name: string;
    label: string;
};

export const SearchSelectField = React.memo(<ValueType, >({
    name,
    label,
    ...props
}: TSearchSelectFieldProps<ValueType>) => {
    const { register, setValue, formState } = useFormContext<{ [property: string]: unknown }>();
    const { errors } = formState;

    const { onBlur: handleBlur } = register(name, {

    });

    const handleChange = useCallback<(value: TOption) => void>(value => {
        setValue(name, value);
    }, [name, setValue]);

    const fieldError = errors && errors[name];
    const validateStatus = fieldError ? 'error' : '';
    const helpText = fieldError // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        // @ts-ignore
        ? fieldError.message as string
        : undefined;

    return (
        <Form.Item
            label={label}
            validateStatus={validateStatus}
            help={helpText}
        >
            <SearchSelect
                {...props}
                // @ts-ignore
                onChange={handleChange}
                onFocus={handleBlur}
            />
        </Form.Item>
    );
});

export default SearchSelect;
