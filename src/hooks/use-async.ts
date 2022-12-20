import { useCallback, useState } from 'react';

type TAsyncFn = (...args: any[]) => Promise<unknown>;

function useAsync<T extends TAsyncFn>(callback: T): [boolean, T] {
  const [loading, setLoading] = useState(false);

  const func = useCallback(async (...args: Parameters<T>) => {
    try {
      setLoading(true);
      const result = await callback(...args);
      return result;
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [loading, func as unknown as T];
}

export default useAsync;
