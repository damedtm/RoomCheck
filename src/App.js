// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import AdminPage from './components/admin/AdminPage';
import RAPage from './components/ra/RAPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* RA only */}
          <Route
            path="/ra"
            element={
              <ProtectedRoute requiredRole="ra">
                <RAPage />
              </ProtectedRoute>
            }
          />

          {/* Default and catch-all */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;