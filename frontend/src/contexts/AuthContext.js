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

  const startGoogleLogin = () => {
    if (!window?.location?.origin) {
      throw new Error('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
    }
    const callbackTarget = `${window.location.origin}/cuenta`;
    const loginUrl = `${API}/login/google?next=${encodeURIComponent(callbackTarget)}`;
    window.location.assign(loginUrl);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, startGoogleLogin, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
