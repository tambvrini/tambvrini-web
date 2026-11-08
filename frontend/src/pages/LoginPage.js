import { useCallback, useEffect, useRef, useState } from 'react';
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
  const googleButtonContainerRef = useRef(null);
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
    const buttonContainer = googleButtonContainerRef.current;
    if (!buttonContainer || !window.google?.accounts?.id?.renderButton) return;
    buttonContainer.innerHTML = '';
    window.google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 380,
    });
  }, [googleClientId, handleGoogleCredentialResponse]);

  const handleGoogleLoginClick = () => {
    const renderedGoogleButton = googleButtonContainerRef.current?.querySelector('[role="button"]');
    renderedGoogleButton?.click();
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
          className="w-full rounded-full border border-black/15 bg-white font-montserrat text-[11px] tracking-[0.15em] text-obsidian/70 hover:border-black/30 transition-colors p-0 overflow-hidden"
        >
          <div
            id="google-login-button"
            ref={googleButtonContainerRef}
            className="w-full min-h-12 flex items-center justify-center"
          />
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
