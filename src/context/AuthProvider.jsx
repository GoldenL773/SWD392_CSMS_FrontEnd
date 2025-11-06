import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/authApi.jsx';
import { STORAGE_KEYS } from '../utils/constants.jsx';

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user with username and password
   */
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiLogin(username, password);

      // Backend returns flat structure: { token, type, id, username, fullName, roles }
      // Create user object from response
      const userData = {
        id: response.id,
        username: response.username,
        fullName: response.fullName,
        roles: Array.isArray(response.roles)
          ? response.roles.map(role => ({ name: role }))
          : Object.values(response.roles || {}).map(role => ({ name: role }))
      };

      // Store token and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      setUser(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      
      // Clear storage and state
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
