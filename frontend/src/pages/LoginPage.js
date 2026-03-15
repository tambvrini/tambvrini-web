import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredentialResponse = useCallback((response) => {
    try {
      const token = response?.credential;
      if (!token) {
        throw new Error('No se recibió credencial de Google');
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      localStorage.setItem('user', JSON.stringify(googleUser));
      window.location.href = '/account';
    } catch (error) {
      console.error('Google credential processing error:', error);
      toast.error('No se pudo iniciar sesión con Google');
    }
  }, []);

  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id?.initialize) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });
  }, [googleClientId, handleGoogleCredentialResponse]);

  const handleGoogleLoginClick = () => {
    window.google?.accounts?.id?.prompt?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Bienvenido de vuelta');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-center font-cinzel text-4xl tracking-[0.12em] text-[#9b2c2c]">INICIAR SESIÓN</h1>
        <p className="text-center mt-4 mb-12 font-montserrat text-xs tracking-wide text-obsidian/50">
          Introduce tus datos para iniciar sesión
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 rounded-full border border-black/10 px-5 font-montserrat text-sm focus:outline-none focus:border-black/30"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50">Contraseña</label>
              <Link to="/forgot-password" className="font-montserrat text-[10px] text-obsidian/60 hover:text-obsidian">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 rounded-full border border-black/10 px-5 pr-12 font-montserrat text-sm focus:outline-none focus:border-black/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/50 hover:text-obsidian"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-[#1f3b2f] hover:bg-[#152a21] text-white font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-60"
          >
            {submitting ? 'Procesando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center gap-3">
          <div className="h-px bg-black/10 flex-1" />
          <span className="font-montserrat text-[10px] text-obsidian/40">o continuar con</span>
          <div className="h-px bg-black/10 flex-1" />
        </div>

        <button
          data-testid="google-login-btn"
          type="button"
          onClick={handleGoogleLoginClick}
          className="w-full h-12 rounded-full border border-black/15 bg-white font-montserrat text-[11px] tracking-[0.15em] text-obsidian/70 hover:border-black/30 transition-colors flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div className="mt-10 text-center">
          <p className="font-montserrat text-xs text-obsidian/50 mb-3">¿No tienes cuenta?</p>
          <Link
            to="/register"
            className="inline-flex h-11 px-8 items-center justify-center rounded-full border border-black/15 font-montserrat text-[11px] tracking-[0.2em] uppercase text-obsidian/70 hover:border-black/30"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
