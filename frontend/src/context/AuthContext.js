import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import toastService from '../services/toastService';
import { ROLES, hasPermission } from '../utils/roles';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        const response = await authAPI.getCurrentUser();
        // Extract user data from the new API format { success: true, data: {...} }
        const userData = response.data?.data || response.data;
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authAPI.register(userData);
      localStorage.setItem('token', res.data.token);
      
      const userRes = await authAPI.getCurrentUser();
      // Extract user data from the new API format { success: true, data: {...} }
      const currentUserData = userRes.data?.data || userRes.data;
      setUser(currentUserData);
      setIsAuthenticated(true);
      toastService.success('Registration successful! Welcome to our hotel.');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      toastService.error(errorMsg);
      return false;
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authAPI.login(credentials);
      localStorage.setItem('token', res.data.token);
      
      const userRes = await authAPI.getCurrentUser();
      // Extract user data from the new API format { success: true, data: {...} }
      const userData = userRes.data?.data || userRes.data;
      setUser(userData);
      setIsAuthenticated(true);
      toastService.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials';
      setError(errorMsg);
      toastService.error(errorMsg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toastService.info('You have been logged out.');
  };

  /**
   * Check if user has one of the specified roles
   * @param {Array<string>} roles - Array of allowed roles
   * @returns {boolean} Whether user has one of the roles
   */
  const hasRole = (roles = []) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user is an admin
   * @returns {boolean} Whether user is an admin
   */
  const isAdmin = () => {
    return user?.role === ROLES.ADMIN;
  };

  /**
   * Check if user is a staff member
   * @returns {boolean} Whether user is staff or admin
   */
  const isStaff = () => {
    return user?.role === ROLES.STAFF || user?.role === ROLES.ADMIN;
  };

  /**
   * Check if user has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean} Whether user has the permission
   */
  const checkPermission = (permission) => {
    return hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        hasRole,
        isAdmin,
        isStaff,
        checkPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 