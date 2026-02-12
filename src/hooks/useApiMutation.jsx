import { useState, useCallback } from 'react';
import { useToast } from './useToast.jsx';

/**
 * Hook for handling API mutations (POST, PUT, DELETE)
 * @param {Function} apiFunc - The API function to call
 * @param {Object} options - Options object
 * @param {string} options.successMessage - Message to show on success
 * @param {string} options.errorMessage - Message to show on error
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 */
export const useApiMutation = (apiFunc, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      
      if (options.successMessage) {
        showToast(options.successMessage, 'success');
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || options.errorMessage || 'Operation failed';
      setError(msg);
      
      if (options.errorMessage !== false) { // Pass false to suppress toast
        showToast(msg, 'error');
      }
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, options, showToast]);

  return { mutate, loading, error, reset: () => setError(null) };
};
