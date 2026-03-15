import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CHECKOUT_PENDING_STORAGE_KEY = 'stripe_checkout_pending';
const CHECKOUT_PENDING_VALUE = 'true';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionStorage.getItem(CHECKOUT_PENDING_STORAGE_KEY) === CHECKOUT_PENDING_VALUE) {
      clearCart();
      sessionStorage.removeItem(CHECKOUT_PENDING_STORAGE_KEY);
    }
  }, [clearCart]);

  return (
    <div data-testid="checkout-success-page" className="min-h-screen pt-32 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 border-2 border-gold flex items-center justify-center mx-auto mb-8">
          <Check size={28} className="text-gold" />
        </div>
        <h1 className="font-cinzel text-2xl tracking-[0.15em] text-marble mb-4">Gracias por su Compra</h1>
        <p className="font-montserrat text-xs text-marble/40 mb-10 leading-relaxed">
          Su pedido ha sido confirmado. Recibirá un email con los detalles de su compra.
        </p>
        <Link to="/tienda" className="btn-luxury btn-gold inline-block">Continuar Comprando</Link>
      </div>
    </div>
  );
}
