// CSMS API Client - Base HTTP client for API communication

import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants.jsx';

/**
 * Base API client with authentication support
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get default headers including auth token
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    // Normalize baseURL and endpoint to avoid duplicate path segments like '/api/api/...'
    const base = (this.baseURL || '').toString().replace(/\/+$/, ''); // remove trailing slashes
    let endpointNormalized = endpoint || '';

    // Ensure endpoint starts with a single '/'
    endpointNormalized = endpointNormalized.toString().replace(/^\/*/, '/');

    // If base already ends with '/api' and endpoint also begins with '/api', strip the leading '/api' from endpoint
    if (base.toLowerCase().endsWith('/api') && endpointNormalized.toLowerCase().startsWith('/api')) {
      endpointNormalized = endpointNormalized.replace(/^\/api/i, '');
      // ensure single leading slash
      endpointNormalized = endpointNormalized.replace(/^\/*/, '/');
    }

    const url = `${base}${endpointNormalized}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      },
      credentials: 'include' // Enable sending cookies and credentials
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      // Parse JSON response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      // Log the final URL to help debug duplicate-prefix issues
      console.error('API Request Error:', error, 'Request URL:', url);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    // Remove undefined/null values to avoid sending "undefined" as string
    const cleanedParams = Object.fromEntries(
      Object.entries(params || {}).filter(([key, value]) => value !== undefined && value !== null)
    );
    const queryString = new URLSearchParams(cleanedParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    // Handle query params if provided in options
    let url = endpoint;
    if (options.params) {
      const cleanedParams = Object.fromEntries(
        Object.entries(options.params || {}).filter(([key, value]) => value !== undefined && value !== null)
      );
      const queryString = new URLSearchParams(cleanedParams).toString();
      url = queryString ? `${endpoint}?${queryString}` : endpoint;
    }
    
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

// Export singleton instance
export default new ApiClient();
