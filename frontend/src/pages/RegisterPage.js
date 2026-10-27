import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
      toast.success('Cuenta creada con éxito');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-center font-cinzel text-4xl tracking-[0.12em] text-[#9b2c2c]">CREAR CUENTA</h1>
        <p className="text-center mt-4 mb-12 font-montserrat text-xs tracking-wide text-obsidian/50">
          Regístrate para vivir la experiencia TAMBVRINI
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 rounded-full border border-black/10 px-5 font-montserrat text-sm focus:outline-none focus:border-black/30"
            />
          </div>
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
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Contraseña</label>
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
          <div>
            <label className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 block mb-2">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-12 rounded-full border border-black/10 px-5 pr-12 font-montserrat text-sm focus:outline-none focus:border-black/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/50 hover:text-obsidian"
                aria-label="Mostrar u ocultar confirmación de contraseña"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-[#1f3b2f] hover:bg-[#152a21] text-white font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-60"
          >
            {submitting ? 'Procesando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="font-montserrat text-xs text-obsidian/50 mb-3">¿Ya tienes cuenta?</p>
          <Link
            to="/login"
            className="inline-flex h-11 px-8 items-center justify-center rounded-full border border-black/15 font-montserrat text-[11px] tracking-[0.2em] uppercase text-obsidian/70 hover:border-black/30"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
