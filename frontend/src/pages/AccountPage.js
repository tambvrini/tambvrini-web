import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Package, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
              onClick={() => navigate('/tienda')}
              className="w-full flex items-center gap-3 py-4 px-5 border border-black/5 text-left hover:border-black/15 transition-colors duration-300"
            >
              <Package size={16} className="text-obsidian/30" />
              <span className="font-montserrat text-xs tracking-wide text-obsidian/60">Mis Pedidos</span>
            </button>
            <button
              onClick={() => navigate('/favoritos')}
              className="w-full flex items-center gap-3 py-4 px-5 border border-black/5 text-left hover:border-black/15 transition-colors duration-300"
            >
              <Heart size={16} className="text-obsidian/30" />
              <span className="font-montserrat text-xs tracking-wide text-obsidian/60">Mis Favoritos</span>
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
