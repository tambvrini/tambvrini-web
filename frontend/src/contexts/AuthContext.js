import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config/google';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);
const GOOGLE_AUTH_ERROR_MESSAGE = 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const googleAuthPromiseRef = useRef(null);
  const googleAuthCallbacksRef = useRef(null);

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

  const finalizeGoogleAuth = () => {
    googleAuthPromiseRef.current = null;
    googleAuthCallbacksRef.current = null;
  };

  const handleUnexpectedGoogleAuthState = () => {
    const error = new Error(GOOGLE_AUTH_ERROR_MESSAGE);
    const callbacks = googleAuthCallbacksRef.current;
    if (callbacks && typeof callbacks.reject === 'function') {
      callbacks.reject(error);
    } else {
      console.error(error);
    }
    finalizeGoogleAuth();
  };

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    prompt: 'select_account',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      const callbacks = googleAuthCallbacksRef.current;
      if (!callbacks) {
        handleUnexpectedGoogleAuthState();
        return;
      }
      const { resolve, reject } = callbacks;
      if (!tokenResponse?.access_token) {
        const error = new Error(GOOGLE_AUTH_ERROR_MESSAGE);
        finalizeGoogleAuth();
        reject(error);
        return;
      }
      try {
        const res = await axios.post(
          `${API}/auth/google`,
          { access_token: tokenResponse.access_token },
          { withCredentials: true }
        );
        setToken(res.data.token);
        localStorage.setItem('auth_token', res.data.token);
        setUser(res.data.user);
        finalizeGoogleAuth();
        resolve(res.data);
      } catch (err) {
        finalizeGoogleAuth();
        reject(err);
      }
    },
    onError: () => {
      const callbacks = googleAuthCallbacksRef.current;
      if (!callbacks) {
        handleUnexpectedGoogleAuthState();
        return;
      }
      const { reject } = callbacks;
      const error = new Error(GOOGLE_AUTH_ERROR_MESSAGE);
      finalizeGoogleAuth();
      reject(error);
    },
  });

  const loginWithGoogle = async () => {
    if (googleAuthPromiseRef.current) {
      return googleAuthPromiseRef.current;
    }
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID no configurado en variables de entorno');
    }
    googleAuthPromiseRef.current = new Promise((resolve, reject) => {
      try {
        googleAuthCallbacksRef.current = { resolve, reject };
        googleLogin();
      } catch (err) {
        finalizeGoogleAuth();
        reject(err);
      }
    });
    return googleAuthPromiseRef.current;
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, loginWithGoogle, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
