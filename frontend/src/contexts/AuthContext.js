import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const GOOGLE_OAUTH_BASE_URL = 'https://www.tambvrini.com';
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

  const startGoogleLogin = (callbackPath = '/cuenta') => {
    const safePath = typeof callbackPath === 'string' ? callbackPath : '/cuenta';
    const callbackTarget = `${GOOGLE_OAUTH_BASE_URL}${safePath}`;
    const loginUrl = `${GOOGLE_OAUTH_BASE_URL}/api/login/google?next=${encodeURIComponent(callbackTarget)}`;
    window.location.assign(loginUrl);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, startGoogleLogin, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
