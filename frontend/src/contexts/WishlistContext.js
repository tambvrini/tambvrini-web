import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tambvrini_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('tambvrini_wishlist', JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems(prev => {
      if (prev.find(i => i.product_id === product.product_id)) return prev;
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        gender: product.gender
      }];
    });
  };

  const removeItem = (product_id) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id));
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
