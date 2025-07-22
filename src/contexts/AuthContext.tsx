import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api.ts';

// Types
interface User {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOADING' };

// Context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Khi khởi tạo, nếu có token thì lấy lại thông tin user
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'LOADING' });
          const user = await authAPI.getMe();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } catch (err) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login thực tế
  const login = async (email: string, password: string) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      dispatch({ type: 'LOADING' });
      const data = await authAPI.login(email, password);
      // data: { user, token }
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: data.token },
      });
    } catch (err: any) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err?.response?.data?.message || 'Đăng nhập không thành công',
      });
    }
  };

  // Register thực tế
  const register = async (email: string, password: string) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      dispatch({ type: 'LOADING' });
      await authAPI.register(email, password);
      dispatch({ type: 'REGISTER_SUCCESS' });
    } catch (err: any) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err?.response?.data?.message || 'Đăng ký không thành công',
      });
    }
  };

  // Logout
  const logout = async () => {
    // Nếu backend có endpoint logout, gọi ở đây, ví dụ:
    // await authAPI.logout();
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 