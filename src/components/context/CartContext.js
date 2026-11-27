import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      localStorage.removeItem('cartItems');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const maxQty = Number(product.countInStock);
      if (Number.isFinite(maxQty) && maxQty <= 0) return prevItems;

      const existingItem = prevItems.find(
        (item) => item._id === product._id
          && (item.size || '') === (product.size || '')
          && (item.color || '') === (product.color || '')
      );
      const nextQty = Math.max(1, (existingItem?.qty || 0) + qty);
      const boundedQty = maxQty > 0 ? Math.min(nextQty, maxQty) : nextQty;

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            && (item.size || '') === (product.size || '')
            && (item.color || '') === (product.color || '')
            ? { ...item, qty: boundedQty }
            : item
        );
      } else {
        return [...prevItems, { ...product, qty: boundedQty }];
      }
    });
  };

  const removeFromCart = (id, size = '', color = '') => {
    setCartItems((items) => items.filter(
      (item) => item._id !== id
        || (item.size || '') !== size
        || (item.color || '') !== color
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const loadCart = (items) => {
    setCartItems(Array.isArray(items) ? items : []);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);