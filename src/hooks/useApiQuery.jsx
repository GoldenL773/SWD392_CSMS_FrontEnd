import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API queries with loading and error states
 * Simplifies data fetching in components
 */
export const useApiQuery = (apiFunction, params = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(params);
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Query Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Refetch data manually
   */
  const refetch = () => {
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
