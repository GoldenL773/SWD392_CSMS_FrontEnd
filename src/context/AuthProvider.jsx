import React, { createContext, useState, useEffect, useMemo } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/authApi.jsx';
import { getEmployeeForUser } from '../api/employeeApi.jsx';
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
          // Normalize stored user data so roles are consistently objects with a `name` property
          const parsed = JSON.parse(userData);
          
          console.log('AuthProvider: Initializing user from localStorage:', {
            username: parsed.username,
            rawRoles: parsed.roles,
            rolesType: typeof parsed.roles,
            isArray: Array.isArray(parsed.roles)
          });

          // central normalize helper: uppercase and strip ROLE_ prefix
          const normalize = (r) => (r || '').toString().toUpperCase().replace(/^ROLE_/, '');

          // Handle roles - might be array, object, or missing
          let rolesArray = [];
          if (Array.isArray(parsed?.roles)) {
            rolesArray = parsed.roles;
          } else if (parsed?.roles && typeof parsed.roles === 'object') {
            rolesArray = Object.values(parsed.roles);
          }

          const normalizedRoles = rolesArray.map(role => {
            if (!role) return { name: '' };
            if (typeof role === 'string') return { name: role };
            // If object, prefer `name` or `role` or `authority` fields
            return { name: role.name || role.role || role.authority || '' };
          }).filter(r => r.name); // Remove empty role names

          // derived, easy-to-check list of role names (uppercased, without ROLE_ prefix)
          const roleNames = normalizedRoles
            .map(r => normalize(typeof r === 'string' ? r : r.name))
            .filter(Boolean);

          console.log('AuthProvider: Normalized roles:', { normalizedRoles, roleNames });

          // Restore employeeId if it was stored
          const userWithRoles = { ...parsed, roles: normalizedRoles, roleNames };
          if (parsed.employeeId) {
            userWithRoles.employeeId = parsed.employeeId;
          }
          setUser(userWithRoles);
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
      // Create normalized user object from response and derive roleNames
      const normalize = (r) => (r || '').toString().toUpperCase().replace(/^ROLE_/, '');

      console.log('Login response roles:', response.roles);
      
      // Handle roles - might be array, object, or missing
      let rolesArray = [];
      if (Array.isArray(response.roles)) {
        rolesArray = response.roles;
      } else if (response.roles && typeof response.roles === 'object') {
        rolesArray = Object.values(response.roles);
      }

      const userData = {
        id: response.id,
        username: response.username,
        fullName: response.fullName,
        roles: rolesArray.map(role => {
          if (typeof role === 'string') return { name: role };
          return { name: role.name || role.role || role.authority || '' };
        }).filter(r => r.name) // Remove empty role names
      };

      // attach derived normalized roleNames for fast checks
      userData.roleNames = userData.roles.map(r => normalize(r.name)).filter(Boolean);

      console.log('Login successful - User data:', userData);
      console.log('User roles:', userData.roles);
      console.log('User roleNames:', userData.roleNames);

      // Fetch employee profile to get employeeId
      try {
        const employeeProfile = await getEmployeeForUser();
        if (employeeProfile && employeeProfile.id) {
          userData.employeeId = employeeProfile.id;
          console.log('Employee profile fetched - employeeId:', userData.employeeId);
        }
      } catch (err) {
        console.warn('Failed to fetch employee profile:', err.message);
        // Continue without employeeId - some roles may not have an employee profile
      }

      // Store token and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      setUser(userData);
      return userData;
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
    if (!user) return false;

    // Normalize comparison: strip ROLE_ and uppercase
    const normalize = (r) => (r || '').toString().toUpperCase().replace(/^ROLE_/, '');
    const target = normalize(roleName);

    // Fast path: if we have derived roleNames use them
    if (Array.isArray(user.roleNames) && user.roleNames.length > 0) {
      return user.roleNames.includes(target);
    }

    if (!user.roles) return false;
    return user.roles.some(role => normalize(typeof role === 'string' ? role : role.name) === target);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleNames) => {
    if (!user) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated
  }), [user, loading, error, login, logout, hasRole, hasAnyRole, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
