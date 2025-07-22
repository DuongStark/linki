import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import ThemeProvider from './contexts/ThemeContext.tsx';
import AuthProvider from './contexts/AuthContext.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import VocabManager from './pages/VocabManager.tsx';
import Study from './pages/Study.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Stats from './pages/Stats.tsx';
import Settings from './pages/Settings.tsx';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// Bảo vệ trang khi chưa đăng nhập
const RequireAuth = () => {
  const { state } = useAuth();
  
  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Trang Dashboard
const DashboardPage = () => <Dashboard />;

// Trang đăng ký
const RegisterPage = () => {
  const { register, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Nếu đã đăng nhập, chuyển hướng đến dashboard
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setPasswordError('');
    register(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Nhập lại mật khẩu của bạn"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          {state.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}
          <button 
            type="submit" 
            className="btn-primary w-full"
          >
            Đăng ký
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Trang học từ
const StudyPage = () => <Study />;

// Trang quản lý từ vựng
const VocabManagerPage = () => <VocabManager />;

// Trang thống kê
const StatsPage = () => <Stats />;

// Trang cài đặt
const SettingsPage = () => <Settings />;

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Trang công khai */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Trang được bảo vệ - yêu cầu đăng nhập */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/vocab" element={<VocabManagerPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            
            {/* Chuyển hướng */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
