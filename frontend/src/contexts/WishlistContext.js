import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'tambvrini_wishlist';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading, getHeaders } = useAuth();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const didInitialLoadRef = useRef(false);
  const prevUserIdRef = useRef(null);

  // Guest persistence
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  useEffect(() => {
    const sync = async () => {
      if (authLoading) return;

      // Guest (never logged or after logout): keep existing localStorage wishlist.
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

      try {
        const guestRaw = localStorage.getItem(STORAGE_KEY);
        const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
        prevUserIdRef.current = user.user_id;

        const serverRes = await axios.get(`${API}/wishlist`, {
          headers: getHeaders(),
          withCredentials: true
        });
        const serverItems = serverRes.data.items || [];

        if (!didInitialLoadRef.current) {
          didInitialLoadRef.current = true;

          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const mergedRes = await axios.post(
              `${API}/wishlist/merge`,
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
        // ignore
      }
    };

    sync();
  }, [user, authLoading, getHeaders]);

  const persistServerWishlist = async (nextItems) => {
    if (!user) return;
    try {
      await axios.put(
        `${API}/wishlist`,
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
      persistServerWishlist(next);
      return next;
    });
  };

  const addItem = (product) => {
    setAndPersist(prev => {
      if (prev.find(i => i.product_id === product.product_id)) return prev;
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.thumbnail_image || product.images?.[0],
        gender: product.gender
      }];
    });
  };

  const removeItem = (product_id) => {
    setAndPersist(prev => prev.filter(i => i.product_id !== product_id));
  };

  const toggleItem = (product) => {
    if (items.find(i => i.product_id === product.product_id)) {
      removeItem(product.product_id);
    } else {
      addItem(product);
    }
  };

  const isInWishlist = (product_id) => items.some(i => i.product_id === product_id);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
