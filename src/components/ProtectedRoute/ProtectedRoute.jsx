// src/components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 20,
        background: '#f5f5f5'
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e0e0e0',
          borderTop: '3px solid #1a73e8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  
  if (requiredRole && userRole !== requiredRole) {
    const correctPath = userRole === 'admin' ? '/admin' : '/ra';
    return <Navigate to={correctPath} replace />;
  }

  
  return children;
}
