import { useCallback, useState } from 'react';

/**
 *
 * @param {Function} callback
 * @returns {[boolean, Function]}
 */
const useAsync = callback => {
  const [loading, setLoading] = useState(false);

  const func = useCallback(async (...args) => {
    try {
      setLoading(true);
      const response = await callback(...args);
      return response;
    } finally {
      setLoading(false);
    }
  }, [callback]);

  return [loading, func];
};

export default useAsync;
