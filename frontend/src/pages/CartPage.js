import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user, getHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const freeShippingThreshold = 75;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      toast.error('Inicia sesión para finalizar la compra');
      navigate('/cuenta');
      return;
    }
    setLoading(true);
    try {
      const checkoutItems = items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        size: i.size,
        color: i.color
      }));
      const res = await axios.post(`${API}/checkout/create-session`, {
        items: checkoutItems,
        origin_url: window.location.origin
      }, { headers: getHeaders(), withCredentials: true });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="cart-page" className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <h1 className="font-cinzel text-3xl md:text-4xl tracking-[0.1em] text-obsidian mb-16">Carrito</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-xl text-obsidian/50 mb-6">Tu carrito está vacío</p>
            <Link to="/tienda" className="btn-luxury inline-block">Explorar Tienda</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="border-b border-black/5 pb-4 mb-8 hidden md:grid grid-cols-12 gap-4">
                <span className="col-span-6 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40">Producto</span>
                <span className="col-span-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40">Cantidad</span>
                <span className="col-span-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 text-right">Precio</span>
                <span className="col-span-2" />
              </div>
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="border-b border-black/5 py-6 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-4">
                  <div className="col-span-6 flex gap-5">
                    <Link to={`/producto/${item.product_id}`} className="w-24 h-32 bg-black/5 flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div>
                      <Link to={`/producto/${item.product_id}`} className="font-playfair text-sm text-obsidian hover:text-obsidian transition-colors">{item.name}</Link>
                      <p className="font-montserrat text-[10px] text-obsidian/40 mt-1 tracking-wide">Talla: {item.size}</p>
                      {item.color && <p className="font-montserrat text-[10px] text-obsidian/40 tracking-wide">Color: {item.color}</p>}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-0 border border-black/10 inline-flex self-start">
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-obsidian/40 hover:text-obsidian">
                      <Minus size={12} />
                    </button>
                    <span className="w-9 h-9 flex items-center justify-center font-montserrat text-xs text-obsidian">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-obsidian/40 hover:text-obsidian">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-montserrat text-sm text-obsidian">{(item.price * item.quantity).toLocaleString('es-ES')} &euro;</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button onClick={() => removeItem(item.product_id, item.size, item.color)} className="text-obsidian/20 hover:text-obsidian/50 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:border-l lg:border-black/5 lg:pl-16">
              <h3 className="font-cinzel text-xs tracking-[0.2em] uppercase text-obsidian/50 mb-8">Resumen del Pedido</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="font-montserrat text-xs text-obsidian/50">Subtotal</span>
                  <span className="font-montserrat text-sm text-obsidian">{totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} &euro;</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-montserrat text-xs text-obsidian/50">Envío</span>
                  <span className="font-montserrat text-xs text-obsidian/50">{totalPrice >= freeShippingThreshold ? 'Gratuito' : 'Se calcula al finalizar'}</span>
                </div>
                <p
                  data-testid="cart-page-free-shipping-message"
                  className="font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40"
                >
                  Envío gratuito en pedidos superiores a 75 €
                </p>
              </div>
              <div className="border-t border-black/5 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-montserrat text-xs tracking-widest uppercase text-obsidian/50">Total</span>
                  <span className="font-playfair text-2xl text-obsidian">{totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} &euro;</span>
                </div>
              </div>
              <button
                data-testid="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-white text-obsidian font-montserrat text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Procesando...' : (user ? (<>Finalizar Compra <ArrowRight size={14} /></>) : 'Inicia sesión para pagar')}
              </button>
              <Link to="/tienda" className="block text-center mt-4 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 hover:text-obsidian transition-colors">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
