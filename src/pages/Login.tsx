import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { state, login, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (state.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 justify-center items-center p-2 sm:p-4">
      <div className="w-full max-w-xs sm:max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo192.png" alt="Logo" className="h-16 w-16 mb-2 drop-shadow-lg" />
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-white mb-2 tracking-tight">Đăng nhập</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl px-4 py-8 sm:px-8 sm:py-10 transition-all">
          {state.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-xl mb-4 relative text-sm">
              <span className="block sm:inline">{state.error}</span>
              <button 
                className="absolute top-0 bottom-0 right-0 px-3 py-2"
                onClick={clearError}
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-5 py-4 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400"
                type="email"
                id="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1" htmlFor="password">
                Mật khẩu
              </label>
              <input
                className="w-full px-5 py-4 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400"
                type="password"
                id="password"
                placeholder="Mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <button
                className="w-full py-4 text-lg rounded-full shadow-lg active:scale-95 transition-transform bg-primary-500 text-white font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2"
                type="submit"
                disabled={state.loading}
              >
                {state.loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
          <div className="text-center text-gray-700 dark:text-gray-300 mt-6 text-base">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 