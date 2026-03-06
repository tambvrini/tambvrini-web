import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Package, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, login, register, logout, loginWithGoogle, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Bienvenido de vuelta');
      } else {
        await register(email, password, name);
        toast.success('Cuenta creada con éxito');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error de autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Bienvenido de vuelta');
      if (location.pathname !== '/cuenta') {
        navigate('/cuenta');
      }
    } catch (err) {
      toast.error('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div data-testid="account-page" className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="font-cinzel text-3xl md:text-4xl tracking-[0.1em] text-obsidian mb-16">Mi Cuenta</h1>
          <div className="border border-black/5 p-8 md:p-12 mb-8">
            <div className="flex items-center gap-5 mb-8">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-14 h-14 rounded-full object-contain object-center" />
              ) : (
                <div className="w-14 h-14 bg-gold/10 flex items-center justify-center">
                  <User size={24} className="text-gold/50" />
                </div>
              )}
              <div>
                <p className="font-playfair text-lg text-obsidian">{user.name}</p>
                <p className="font-montserrat text-xs text-obsidian/50 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/favoritos')}
                className="w-full flex items-center gap-3 py-4 px-5 border border-black/5 text-left hover:border-black/15 transition-colors duration-300"
              >
                <Heart size={16} className="text-obsidian/30" />
                <span className="font-montserrat text-xs tracking-wide text-obsidian/60">Mis Favoritos</span>
              </button>
              <button
                onClick={() => navigate('/tienda')}
                className="w-full flex items-center gap-3 py-4 px-5 border border-black/5 text-left hover:border-black/15 transition-colors duration-300"
              >
                <Package size={16} className="text-obsidian/30" />
                <span className="font-montserrat text-xs tracking-wide text-obsidian/60">Mis Pedidos</span>
              </button>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 hover:text-obsidian transition-colors"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="account-page" className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-md mx-auto px-6">
        <h1 className="font-cinzel text-3xl md:text-4xl tracking-[0.1em] text-obsidian text-center mb-4">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        <p className="font-montserrat text-xs text-obsidian/50 text-center mb-12 tracking-wide">
          {isLogin ? 'Bienvenido de vuelta a la Casa TAMBVRINI' : 'Únase a la Casa TAMBVRINI'}
        </p>

        {/* Google login */}
        <button
          data-testid="google-login-btn"
          onClick={handleGoogleLogin}
          className="w-full py-4 border border-black/10 font-montserrat text-[11px] tracking-[0.15em] uppercase text-obsidian/70 hover:border-black/30 hover:text-obsidian transition-colors duration-300 mb-8 flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-black/10" />
          <span className="font-montserrat text-[10px] text-obsidian/30 tracking-widest uppercase">o</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Nombre</label>
              <input
                data-testid="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-black/10 pb-3 font-montserrat text-sm text-obsidian focus:outline-none focus:border-gold placeholder:text-obsidian/20"
                placeholder="Su nombre"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Email</label>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-black/10 pb-3 font-montserrat text-sm text-obsidian focus:outline-none focus:border-gold placeholder:text-obsidian/20"
              placeholder="su@email.com"
              required
            />
          </div>
          <div>
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Contraseña</label>
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-black/10 pb-3 font-montserrat text-sm text-obsidian focus:outline-none focus:border-gold placeholder:text-obsidian/20"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            data-testid="auth-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-white text-obsidian font-montserrat text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 disabled:opacity-50"
          >
            {submitting ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <button
          data-testid="toggle-auth-mode"
          onClick={() => setIsLogin(!isLogin)}
          className="block mx-auto mt-8 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 hover:text-obsidian transition-colors"
        >
          {isLogin ? '¿No tiene cuenta? Crear cuenta' : '¿Ya tiene cuenta? Iniciar sesión'}
        </button>
      </div>
    </div>
  );
}
