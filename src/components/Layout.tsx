import React, { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { HomeIcon, BookOpenIcon, FolderIcon, ChartBarSquareIcon, CogIcon } from '@heroicons/react/24/outline';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../slide-transition.css';

const Layout: React.FC = () => {
  const { state, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const nodeRef = useRef(null);

  const navigation = [
    { name: 'Tổng quan', href: '/' },
    { name: 'Học từ', href: '/study' },
    { name: 'Quản lý từ vựng', href: '/vocab' },
    { name: 'Thống kê', href: '/stats' },
    { name: 'Cài đặt', href: '/settings' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-primary-50 dark:bg-neutral-900">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="absolute inset-0 bg-primary-900 opacity-60"></div>
      </div>

      {/* Sidebar chỉ hiện trên PC */}
      <div className="hidden md:block md:relative md:translate-x-0 w-60 bg-white dark:bg-neutral-800 shadow-card border-r border-primary-100">
        <div className="flex items-center justify-between h-16 px-4 bg-primary-500 dark:bg-primary-700">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">Anki Vocab</span>
          </div>
        </div>
        <div className="px-2 py-4">
          <nav className="mt-5 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-white font-semibold'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base rounded-lg transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between h-16 px-4 bg-white dark:bg-neutral-800 shadow">
          {/* Nút menu chỉ hiện trên PC */}
          <button
            className="hidden md:block text-primary-500 dark:text-primary-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div></div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-primary-500 dark:text-primary-200 focus:outline-none hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            {state.isAuthenticated ? (
              <button
                onClick={logout}
                className="ml-4 btn-primary text-sm px-4 py-2"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 btn-primary text-sm px-4 py-2"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
        <main className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-7xl">
            <SwitchTransition>
              <CSSTransition
                key={location.pathname}
                classNames="slide"
                timeout={300}
                nodeRef={nodeRef}
                unmountOnExit
              >
                <div ref={nodeRef}>
                  <Outlet />
                </div>
              </CSSTransition>
            </SwitchTransition>
          </div>
        </main>
      </div>
      {/* Bottom navbar cho mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary-500 border-t border-primary-600 flex justify-between items-center px-2 py-1 shadow-lg" style={{minHeight: '60px'}}>
        <Link to="/dashboard" className={`flex flex-col items-center flex-1 py-1 transition-all duration-200 ${location.pathname === '/dashboard' ? 'text-primary-500 font-bold shadow-lg scale-110 bg-white/80 rounded-xl' : 'text-primary-100'}`}> <HomeIcon className="h-7 w-7 mb-0.5" /> <span className="text-xs">Tổng quan</span> </Link>
        <Link to="/study" className={`flex flex-col items-center flex-1 py-1 transition-all duration-200 ${location.pathname === '/study' ? 'text-primary-500 font-bold shadow-lg scale-110 bg-white/80 rounded-xl' : 'text-primary-100'}`}> <BookOpenIcon className="h-7 w-7 mb-0.5" /> <span className="text-xs">Học từ</span> </Link>
        <Link to="/vocab" className={`flex flex-col items-center flex-1 py-1 transition-all duration-200 ${location.pathname === '/vocab' ? 'text-primary-500 font-bold shadow-lg scale-110 bg-white/80 rounded-xl' : 'text-primary-100'}`}> <FolderIcon className="h-7 w-7 mb-0.5" /> <span className="text-xs">Từ vựng</span> </Link>
        <Link to="/stats" className={`flex flex-col items-center flex-1 py-1 transition-all duration-200 ${location.pathname === '/stats' ? 'text-primary-500 font-bold shadow-lg scale-110 bg-white/80 rounded-xl' : 'text-primary-100'}`}> <ChartBarSquareIcon className="h-7 w-7 mb-0.5" /> <span className="text-xs">Thống kê</span> </Link>
        <Link to="/settings" className={`flex flex-col items-center flex-1 py-1 transition-all duration-200 ${location.pathname === '/settings' ? 'text-primary-500 font-bold shadow-lg scale-110 bg-white/80 rounded-xl' : 'text-primary-100'}`}> <CogIcon className="h-7 w-7 mb-0.5" /> <span className="text-xs">Cài đặt</span> </Link>
      </div>
    </div>
  );
};

export default Layout; 