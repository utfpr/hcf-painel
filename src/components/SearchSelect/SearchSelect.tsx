import React, { useMemo, useState } from 'react';

import { Select } from 'antd';
import debounce from 'lodash.debounce';

import useAsync from '../../hooks/use-async';
import { TOption, TRequestFn } from './types';

const searchSelectStyle = {
    width: '100%',
};

export type TSearchSelectProps = {
    request: TRequestFn;
};

const SearchSelect = ({
    request,
    ...props
}: TSearchSelectProps) => {
    const [options, setOptions] = useState<TOption[]>([]);

    const [isRequestingOptions, requestOptions] = useAsync(async (params: Parameters<TRequestFn>[0]) => {
        const response = await request(params);
        setOptions(response);
    });

    const onSearch = useMemo(() => {
        const onSearchCallback = (text: string) => {
            requestOptions({ limit: 10, page: 1, text });
        };
        return debounce(onSearchCallback, 500);
    }, [requestOptions]);

    return (
        <Select
            {...props}
            showSearch
            showArrow
            allowClear
            filterOption={false}
            options={options}
            loading={isRequestingOptions}
            onSearch={onSearch}
            style={searchSelectStyle}
        />
    );
};

export default React.memo(SearchSelect);
