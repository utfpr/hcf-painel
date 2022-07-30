import { useEffect } from 'react';

/**
 * @param {function} callback
 */
const useDidMount = callback => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(callback, []);
};

export default useDidMount;
