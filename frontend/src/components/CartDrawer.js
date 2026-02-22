import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Sheet, SheetContent, SheetClose } from '../components/ui/sheet';
import axios from 'axios';
import { useState } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { getHeaders } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
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
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" hideClose className="w-full sm:w-[420px] bg-[#F5F2EA] border-l border-black/5 p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-obsidian/60" />
            <h2 className="font-cinzel text-sm tracking-[0.2em] uppercase text-obsidian">Carrito</h2>
          </div>
          <SheetClose asChild>
            <button data-testid="cart-close-btn">
              <X size={20} className="text-obsidian/50 hover:text-obsidian" />
            </button>
          </SheetClose>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} className="text-marble/15 mb-4" />
              <p className="font-montserrat text-sm text-marble/40">Tu carrito está vacío</p>
              <Link
                to="/tienda"
                onClick={() => setIsOpen(false)}
                className="mt-6 btn-luxury text-xs"
              >
                Explorar Tienda
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4">
                  <Link
                    to={`/producto/${item.product_id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-20 h-28 bg-obsidian flex-shrink-0 overflow-hidden"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.product_id}`}
                      onClick={() => setIsOpen(false)}
                      className="font-playfair text-sm text-marble block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="font-montserrat text-[10px] text-marble/40 mt-1 tracking-wide">
                      {item.size} {item.color && `/ ${item.color}`}
                    </p>
                    <p className="font-montserrat text-xs text-marble/60 mt-1">
                      {item.price.toLocaleString('es-ES')} &euro;
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                        className="w-6 h-6 border border-white/10 flex items-center justify-center text-marble/50 hover:text-marble hover:border-white/30"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-montserrat text-xs text-marble/80 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                        className="w-6 h-6 border border-white/10 flex items-center justify-center text-marble/50 hover:text-marble hover:border-white/30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    data-testid={`remove-item-${item.product_id}`}
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="text-marble/30 hover:text-marble/60 self-start"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-6">
              <span className="font-montserrat text-xs tracking-widest uppercase text-marble/50">Subtotal</span>
              <span className="font-playfair text-lg text-marble">
                {totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} &euro;
              </span>
            </div>
            <button
              data-testid="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-marble text-obsidian font-montserrat text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Finalizar Compra'}
            </button>
            <Link
              to="/carrito"
              onClick={() => setIsOpen(false)}
              className="block text-center mt-3 font-montserrat text-[10px] tracking-widest uppercase text-marble/40 hover:text-marble transition-colors duration-300"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
