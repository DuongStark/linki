import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  const { state, register, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.loading && !state.error && state.error !== null) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [state.loading, state.error, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu nhập lại không khớp');
      return;
    }
    
    setPasswordError('');
    await register(email, password);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 justify-center items-center p-2 sm:p-4">
      <div className="w-full max-w-xs sm:max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo192.png" alt="Logo" className="h-16 w-16 mb-2 drop-shadow-lg" />
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-white mb-2 tracking-tight">Đăng ký</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl px-4 py-8 sm:px-8 sm:py-10 transition-all">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-xl mb-4 text-center text-sm font-semibold">
              Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...
            </div>
          )}
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
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1" htmlFor="confirmPassword">
                Nhập lại mật khẩu
              </label>
              <input
                className="w-full px-5 py-4 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400"
                type="password"
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
              )}
            </div>
            <div>
              <button
                className="w-full py-4 text-lg rounded-full shadow-lg active:scale-95 transition-transform bg-primary-500 text-white font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2"
                type="submit"
                disabled={state.loading}
              >
                {state.loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>
          <div className="text-center text-gray-700 dark:text-gray-300 mt-6 text-base">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 