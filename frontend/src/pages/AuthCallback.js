import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { exchangeSession } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash;
    const sessionId = hash?.split('session_id=')?.[1]?.split('&')?.[0];

    if (sessionId) {
      exchangeSession(sessionId)
        .then(() => {
          navigate('/cuenta', { replace: true });
        })
        .catch((err) => {
          console.error('Auth callback error:', err);
          navigate('/cuenta', { replace: true });
        });
    } else {
      navigate('/cuenta', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="font-montserrat text-xs text-obsidian/60 tracking-wide">Autenticando...</p>
      </div>
    </div>
  );
}
