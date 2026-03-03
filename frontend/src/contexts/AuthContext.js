import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const googleAuthPromiseRef = useRef(null);
  const googleScriptPromiseRef = useRef(null);

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

  const loadGoogleIdentityScript = () => {
    if (window.google?.accounts?.oauth2) {
      return Promise.resolve();
    }
    if (googleScriptPromiseRef.current) {
      return googleScriptPromiseRef.current;
    }
    googleScriptPromiseRef.current = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-identity-service');
      if (existingScript) {
        if (existingScript.dataset.loaded === 'true' && window.google?.accounts?.oauth2) {
          googleScriptPromiseRef.current = null;
          resolve();
          return;
        }
        if (existingScript.dataset.error === 'true') {
          googleScriptPromiseRef.current = null;
          reject(new Error('No se pudo cargar Google Identity Services.'));
          return;
        }
        existingScript.addEventListener('load', () => {
          existingScript.dataset.loaded = 'true';
          googleScriptPromiseRef.current = null;
          resolve();
        }, { once: true });
        existingScript.addEventListener(
          'error',
          () => {
            existingScript.dataset.error = 'true';
            googleScriptPromiseRef.current = null;
            reject(new Error('No se pudo cargar Google Identity Services.'));
          },
          { once: true }
        );
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-service';
      script.onload = () => {
        script.dataset.loaded = 'true';
        googleScriptPromiseRef.current = null;
        resolve();
      };
      script.onerror = () => {
        script.dataset.error = 'true';
        googleScriptPromiseRef.current = null;
        reject(new Error('No se pudo cargar Google Identity Services.'));
      };
      document.head.appendChild(script);
    });
    return googleScriptPromiseRef.current;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: getHeaders(), withCredentials: true });
    } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const loginWithGoogle = async () => {
    if (googleAuthPromiseRef.current) {
      return googleAuthPromiseRef.current;
    }
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID no configurado');
    }
    await loadGoogleIdentityScript();
    googleAuthPromiseRef.current = new Promise((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (response) => {
          const finalize = () => {
            googleAuthPromiseRef.current = null;
          };
          if (response?.error || !response?.access_token) {
            const errorMessage = response?.error === 'access_denied'
              ? 'Autenticación con Google cancelada.'
              : 'No se pudo iniciar sesión con Google.';
            finalize();
            reject(new Error(errorMessage));
            return;
          }
          try {
            const res = await axios.post(
              `${API}/auth/google`,
              { access_token: response.access_token },
              { withCredentials: true }
            );
            setToken(res.data.token);
            localStorage.setItem('auth_token', res.data.token);
            setUser(res.data.user);
            finalize();
            resolve(res.data);
          } catch (err) {
            finalize();
            reject(err);
          }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
    return googleAuthPromiseRef.current;
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, loginWithGoogle, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
