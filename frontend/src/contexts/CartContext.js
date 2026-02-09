import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'tambvrini_cart';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading, getHeaders } = useAuth();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  const didInitialLoadRef = useRef(false);
  const prevUserIdRef = useRef(null);

  // Guest persistence: keep using localStorage until user is logged.
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  // When auth resolves, sync cart.
  useEffect(() => {
    const sync = async () => {
      if (authLoading) return;

      // Guest (never logged or after logout): keep existing localStorage cart.
      if (!user) {
        if (prevUserIdRef.current) {
          // Real logout transition (user -> null): reset to empty guest.
          didInitialLoadRef.current = false;
          prevUserIdRef.current = null;
          setItems([]);
          localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }

      // Logged in: load from server, then merge any guest leftovers once.
      try {
        const guestRaw = localStorage.getItem(STORAGE_KEY);
        const guestItems = guestRaw ? JSON.parse(guestRaw) : [];

        // Always fetch server cart first.
        const serverRes = await axios.get(`${API}/cart`, {
          headers: getHeaders(),
          withCredentials: true
        });
        const serverItems = serverRes.data.items || [];

        // First time after login: merge guest -> server if guest has items.
        if (!didInitialLoadRef.current) {
          didInitialLoadRef.current = true;

          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const mergedRes = await axios.post(
              `${API}/cart/merge`,
              { guest_items: guestItems },
              { headers: getHeaders(), withCredentials: true }
            );
            setItems(mergedRes.data.items || []);
            localStorage.removeItem(STORAGE_KEY);
            return;
          }
        }

        setItems(serverItems);
      } catch {
        // If any failure, just keep current state in memory.
      }
    };

    sync();
  }, [user, authLoading, getHeaders]);

  const persistServerCart = async (nextItems) => {
    if (!user) return;
    try {
      await axios.put(
        `${API}/cart`,
        { items: nextItems },
        { headers: getHeaders(), withCredentials: true }
      );
    } catch {
      // ignore
    }
  };

  const setAndPersist = (updater) => {
    setItems(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistServerCart(next);
      return next;
    });
  };

  const addItem = (product, size, color, quantity = 1) => {
    setAndPersist(prev => {
      const existing = prev.find(
        i => i.product_id === product.product_id && i.size === size && i.color === color
      );
      if (existing) {
        return prev.map(i =>
          i.product_id === product.product_id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.thumbnail_image || product.images?.[0],
        size, color, quantity
      }];
    });
    setIsOpen(true);
  };

  const removeItem = (product_id, size, color) => {
    setAndPersist(prev => prev.filter(
      i => !(i.product_id === product_id && i.size === size && i.color === color)
    ));
  };

  const updateQuantity = (product_id, size, color, quantity) => {
    if (quantity <= 0) return removeItem(product_id, size, color);
    setAndPersist(prev => prev.map(i =>
      i.product_id === product_id && i.size === size && i.color === color
        ? { ...i, quantity }
        : i
    ));
  };

  const clearCart = () => setAndPersist([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen, addItem, removeItem,
      updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
