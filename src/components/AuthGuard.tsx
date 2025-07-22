import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  if (state.loading) {
    // Có thể hiển thị spinner loading trong khi kiểm tra auth
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default AuthGuard; 