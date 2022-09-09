import React, { useMemo, useState } from 'react';

import { Select } from 'antd';
import debounce from 'lodash.debounce';

import useAsync from '../../hooks/use-async';

const searchSelectStyle = {
    width: '100%',
};

const SelectSelect = ({
    request,
    ...props
}) => {
    const [options, setOptions] = useState([]);

    const [isRequestingOptions, requestOptions] = useAsync(async params => {
        const response = await request(params);
        setOptions(response);
    });

    const onSearch = useMemo(() => {
        const onSearchCallback = text => {
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

export default React.memo(SelectSelect);
