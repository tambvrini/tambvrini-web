import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GOOGLE_CLIENT_ID } from '../config/google';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);
const GOOGLE_AUTH_ERROR_MESSAGE = 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  const getHeaders = useCallback(() => {
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }, [token]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: getHeaders(),
        withCredentials: true
      });
      setUser(res.data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    setToken(res.data.token);
    localStorage.setItem('auth_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post(`${API}/auth/register`, { email, password, name });
    setToken(res.data.token);
    localStorage.setItem('auth_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: getHeaders(), withCredentials: true });
    } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const loginWithGoogle = async (credential) => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID no configurado en variables de entorno');
    }
    if (!credential) {
      throw new Error(GOOGLE_AUTH_ERROR_MESSAGE);
    }
    const res = await axios.post(
      `${API}/auth/google`,
      { credential },
      { withCredentials: true }
    );
    setToken(res.data.token);
    localStorage.setItem('auth_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, loginWithGoogle, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
