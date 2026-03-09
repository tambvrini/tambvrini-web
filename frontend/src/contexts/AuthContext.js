import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = useCallback(() => {
    return {};
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post(`${API}/auth/register`, { email, password, name }, { withCredentials: true });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: getHeaders(), withCredentials: true });
    } catch { /* ignore */ }
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${API}/auth/forgot-password`, { email }, { withCredentials: true });
    return res.data;
  };

  const startGoogleLogin = (callbackPath = '/account') => {
    const rawPath = typeof callbackPath === 'string' ? callbackPath.trim() : '/account';
    const pathWithoutQuery = rawPath.split('?', 1)[0];
    const pathnameOnly = pathWithoutQuery.split('#', 1)[0];
    const safePath = pathnameOnly.startsWith('/') && !pathnameOnly.startsWith('//')
      ? pathnameOnly
      : '/account';
    const loginUrl = `/api/login/google?next=${safePath}`;
    window.location.assign(loginUrl);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, startGoogleLogin, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
