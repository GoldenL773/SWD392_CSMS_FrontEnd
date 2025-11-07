import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API queries with loading and error states
 * Simplifies data fetching in components
 * @param {Function} apiFunction - API function to call
 * @param {Object} params - Parameters to pass to API function
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Additional options (enabled: boolean, retry: number, retryDelay: number)
 */
export const useApiQuery = (apiFunction, params = {}, dependencies = [], options = {}) => {
  const { enabled = true, retry = 0, retryDelay = 1000 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const paramsRef = useRef(params);
  const apiFunctionRef = useRef(apiFunction);

  // Update refs when params or apiFunction change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stable fetch function that reads the latest apiFunction and params from refs
  const fetchData = async (isRetry = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Prevent infinite retries
    if (isRetry && retryCountRef.current >= retry) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fn = apiFunctionRef.current;
      const result = await fn(paramsRef.current);

      if (mountedRef.current) {
        setData(result);
        retryCountRef.current = 0; // Reset retry count on success
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      console.error('API Query Error:', err);

      // Retry logic
      if (retry > 0 && retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(true);
          }
        }, retryDelay);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    retryCountRef.current = 0; // Reset retry count when dependencies change
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, retry, retryDelay, ...dependencies]);

  /**
   * Refetch data manually
   */
  const refetch = () => {
    retryCountRef.current = 0;
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Custom hook for API mutations (create, update, delete)
 */
export const useApiMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
};
