import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success('Si el correo existe, enviamos un enlace de recuperación');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'No se pudo procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-center font-cinzel text-4xl tracking-[0.12em] text-[#9b2c2c]">RECUPERAR ACCESO</h1>
        <p className="text-center mt-4 mb-12 font-montserrat text-xs tracking-wide text-obsidian/50">
          Introduce tu correo y te enviaremos un enlace de recuperación
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-[#1f3b2f] hover:bg-[#152a21] text-white font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex h-11 px-8 items-center justify-center rounded-full border border-black/15 font-montserrat text-[11px] tracking-[0.2em] uppercase text-obsidian/70 hover:border-black/30"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
