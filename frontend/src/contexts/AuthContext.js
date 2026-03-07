import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: getHeaders(), withCredentials: true });
    } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const loadGoogleIdentityScript = () => {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }
    if (googleScriptPromiseRef.current) {
      return googleScriptPromiseRef.current;
    }
    googleScriptPromiseRef.current = new Promise((resolve, reject) => {
      let settled = false;
      const resolveOnce = () => {
        if (settled) return;
        settled = true;
        googleScriptPromiseRef.current = null;
        resolve();
      };
      const rejectOnce = () => {
        if (settled) return;
        settled = true;
        googleScriptPromiseRef.current = null;
        reject(new Error(GOOGLE_AUTH_ERROR_MESSAGE));
      };
      const existingScript = document.getElementById('google-identity-service');
      if (existingScript) {
        if (existingScript.dataset.loaded === 'true' && window.google?.accounts?.id) {
          resolveOnce();
          return;
        }
        if (existingScript.dataset.error === 'true') {
          rejectOnce();
          return;
        }
        const handleLoad = () => {
          existingScript.dataset.loaded = 'true';
          resolveOnce();
        };
        const handleError = () => {
          existingScript.dataset.error = 'true';
          rejectOnce();
        };
        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        if (window.google?.accounts?.id) {
          handleLoad();
        }
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-service';
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolveOnce();
      };
      script.onerror = () => {
        script.dataset.error = 'true';
        rejectOnce();
      };
      document.head.appendChild(script);
    });
    return googleScriptPromiseRef.current;
  };

  const loginWithGoogle = async () => {
    if (googleAuthPromiseRef.current) {
      return googleAuthPromiseRef.current;
    }
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID no configurado en variables de entorno');
    }
    await loadGoogleIdentityScript();
    googleAuthPromiseRef.current = new Promise((resolve, reject) => {
      let settled = false;
      const finalize = () => {
        if (settled) return;
        settled = true;
        googleAuthPromiseRef.current = null;
      };
      const rejectWithError = (error) => {
        finalize();
        reject(error);
      };
      const handleCredential = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
          rejectWithError(new Error(GOOGLE_AUTH_ERROR_MESSAGE));
          return;
        }
        try {
          const res = await axios.post(
            `${API}/auth/google`,
            { id_token: credentialResponse.credential },
            { withCredentials: true }
          );
          setToken(res.data.token);
          localStorage.setItem('auth_token', res.data.token);
          setUser(res.data.user);
          finalize();
          resolve(res.data);
        } catch (err) {
          rejectWithError(err);
        }
      };
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          ux_mode: 'popup',
          context: 'signin',
        });
        window.google.accounts.id.prompt((notification) => {
          if (
            notification?.isNotDisplayed?.() ||
            notification?.isSkippedMoment?.() ||
            notification?.isDismissedMoment?.()
          ) {
            rejectWithError(new Error(GOOGLE_AUTH_ERROR_MESSAGE));
          }
        });
      } catch (err) {
        rejectWithError(err);
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
