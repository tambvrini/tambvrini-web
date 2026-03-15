import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const USER_STORAGE_KEY = 'user';
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = useCallback(() => {
    return {};
  }, []);

  const checkAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email) => {
    const userData = {
      email,
      name: email.split('@')[0],
      picture: '',
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  };

  const register = async (email, password, name) => {
    const userData = { email, name, picture: '' };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  };

  const logout = async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return { email };
  };

  const startGoogleLogin = () => {
    window.google?.accounts?.id?.prompt?.();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, startGoogleLogin, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
