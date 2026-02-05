import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }
      attempts++;
      try {
        const res = await axios.get(`${API}/checkout/status/${sessionId}`);
        setPaymentData(res.data);
        if (res.data.payment_status === 'paid') {
          setStatus('success');
          clearCart();
          return;
        } else if (res.data.status === 'expired') {
          setStatus('expired');
          return;
        }
        setTimeout(poll, pollInterval);
      } catch {
        setTimeout(poll, pollInterval);
      }
    };

    poll();
  }, [sessionId]);

  return (
    <div data-testid="checkout-success-page" className="min-h-screen pt-32 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {status === 'checking' && (
          <>
            <Loader2 size={40} className="text-gold animate-spin mx-auto mb-6" />
            <h1 className="font-cinzel text-xl tracking-[0.15em] text-marble mb-4">Verificando Pago</h1>
            <p className="font-montserrat text-xs text-marble/40">Por favor espere mientras confirmamos su pago...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 border-2 border-gold flex items-center justify-center mx-auto mb-8">
              <Check size={28} className="text-gold" />
            </div>
            <h1 className="font-cinzel text-2xl tracking-[0.15em] text-marble mb-4">Gracias por su Compra</h1>
            <p className="font-montserrat text-xs text-marble/40 mb-10 leading-relaxed">
              Su pedido ha sido confirmado. Recibirá un email con los detalles de su compra.
            </p>
            <Link to="/tienda" className="btn-luxury btn-gold inline-block">Continuar Comprando</Link>
          </>
        )}
        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <>
            <h1 className="font-cinzel text-xl tracking-[0.15em] text-marble mb-4">
              {status === 'timeout' ? 'Verificación en Proceso' : 'Error de Pago'}
            </h1>
            <p className="font-montserrat text-xs text-marble/40 mb-10">
              {status === 'timeout'
                ? 'La verificación está tardando más de lo esperado. Recibirá un email de confirmación.'
                : 'Ha ocurrido un error. Por favor contacte con atención al cliente.'}
            </p>
            <Link to="/tienda" className="btn-luxury inline-block">Volver a la Tienda</Link>
          </>
        )}
      </div>
    </div>
  );
}
