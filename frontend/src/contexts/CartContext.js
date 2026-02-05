import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tambvrini_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tambvrini_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, color, quantity = 1) => {
    setItems(prev => {
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
        image: product.images[0],
        size, color, quantity
      }];
    });
    setIsOpen(true);
  };

  const removeItem = (product_id, size, color) => {
    setItems(prev => prev.filter(
      i => !(i.product_id === product_id && i.size === size && i.color === color)
    ));
  };

  const updateQuantity = (product_id, size, color, quantity) => {
    if (quantity <= 0) return removeItem(product_id, size, color);
    setItems(prev => prev.map(i =>
      i.product_id === product_id && i.size === size && i.color === color
        ? { ...i, quantity }
        : i
    ));
  };

  const clearCart = () => setItems([]);

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
