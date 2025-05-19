import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for role-based access control
 * Can be used for routes that require authentication and specific roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} [props.allowedRoles] - Array of roles allowed to access the route
 * @returns {React.ReactNode} Either the children components or a redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state if authentication is still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required or user has the required role, render children
  if (
    allowedRoles.length === 0 || 
    allowedRoles.includes(user.role)
  ) {
    return children;
  }

  // If user doesn't have the required role, redirect to home
  return <Navigate to="/" replace />;
};

export default ProtectedRoute; 