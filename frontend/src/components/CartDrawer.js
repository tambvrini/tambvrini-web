import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Sheet, SheetContent, SheetClose } from '../components/ui/sheet';
import { useState } from 'react';
import { toast } from 'sonner';
import { redirectToStripeCheckout } from '../utils/stripeCheckout';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const { user, getHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const freeShippingThreshold = 75;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      toast.error('Inicia sesión para finalizar la compra');
      setIsOpen(false);
      navigate('/cuenta');
      return;
    }
    setLoading(true);
    try {
      await redirectToStripeCheckout({
        items,
        headers: getHeaders(),
      });
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" hideClose className="w-full sm:w-[420px] bg-white border-l border-black/5 p-0 flex flex-col">
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
              <ShoppingBag size={40} className="text-obsidian/15 mb-4" />
              <p className="font-montserrat text-sm text-obsidian/50">Tu carrito está vacío</p>
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
                    className="w-20 h-28 bg-black/5 flex-shrink-0 overflow-hidden flex items-center justify-center"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-auto max-h-full object-contain object-center" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.product_id}`}
                      onClick={() => setIsOpen(false)}
                      className="font-playfair text-sm text-obsidian block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="font-montserrat text-[10px] text-obsidian/50 mt-1 tracking-wide">
                      {item.size} {item.color && `/ ${item.color}`}
                    </p>
                    <p className="font-montserrat text-xs text-obsidian/60 mt-1">
                      {item.price.toLocaleString('es-ES')} &euro;
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                        className="w-6 h-6 border border-black/10 flex items-center justify-center text-obsidian/50 hover:text-obsidian hover:border-black/30"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-montserrat text-xs text-obsidian/80 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                        className="w-6 h-6 border border-black/10 flex items-center justify-center text-obsidian/50 hover:text-obsidian hover:border-black/30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    data-testid={`remove-item-${item.product_id}`}
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="text-obsidian/30 hover:text-obsidian/60 self-start"
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
          <div className="p-6 border-t border-black/5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-montserrat text-xs tracking-widest uppercase text-obsidian/50">Subtotal</span>
              <span className="font-playfair text-lg text-obsidian">
                {totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} &euro;
              </span>
            </div>
            <p
              data-testid="cart-drawer-free-shipping-message"
              className="font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 mb-6"
            >
              Envío gratuito en pedidos superiores a 75 €
            </p>
            <button
              data-testid="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-white text-obsidian font-montserrat text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : (user ? 'Finalizar Compra' : 'Inicia sesión para pagar')}
            </button>
            <Link
              to="/carrito"
              onClick={() => setIsOpen(false)}
              className="block text-center mt-3 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/50 hover:text-obsidian transition-colors duration-300"
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
