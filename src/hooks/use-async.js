import { useCallback, useState } from 'react';

const useAsync = callback => {
    const [loading, setLoading] = useState(false);

    const func = useCallback(async data => {
        try {
            setLoading(true);
            const response = await callback(data);
            return response;
        } finally {
            setLoading(false);
        }
    }, [callback]);

    return [loading, func];
};

export default useAsync;
