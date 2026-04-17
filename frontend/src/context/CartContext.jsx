import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react';

import * as userService from '../services/userService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
};

export const CartProvider = ({ children }) => {

  const {
    isAuthenticated,
    loading: authLoading
  } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Main Init
  // ============================
  const initializeCart = useCallback(async () => {

    setLoading(true);

    try {

      const localCart =
        JSON.parse(localStorage.getItem('cart') || '[]');

      // User Logged In
      if (isAuthenticated) {

        // Sync guest cart first
        if (localCart.length > 0) {
          await syncLocalCartToServer(localCart);
          localStorage.removeItem('cart');
        }

        const res = await userService.getCart();

        const serverCart =
          res?.data?.data ||
          res?.data?.cart ||
          res?.data ||
          [];

        setCart(Array.isArray(serverCart) ? serverCart : []);

      }

      // Guest
      else {
        setCart(localCart);
      }

    } catch (err) {
      console.error('Cart init error:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================
  // Init Cart After Auth Ready
  // ============================
  useEffect(() => {

    if (authLoading) return;

    initializeCart();

  }, [isAuthenticated, authLoading, initializeCart]);

  // ============================
  // Sync Guest → Server
  // ============================
  const syncLocalCartToServer = async (localCart) => {

    try {

      for (const item of localCart) {

        // Guest cart items have _id directly, not under product
        const productId = item._id || item.product?._id;

        if (productId) {
          await userService.addToCart(
            productId,
            item.quantity
          );
        }
      }

    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  // ============================
  // Save Local Cart
  // ============================
  const persistLocalCart = (data) => {
    localStorage.setItem('cart', JSON.stringify(data));
  };

  // ============================
  // Add
  // ============================
  const addToCart = async (productOrId, quantity = 1) => {

    try {

      // Handle both product object and product ID string
      const productId = typeof productOrId === 'string' ? productOrId : productOrId?._id;

      if (!productId) {
        toast.error('Invalid product');
        return;
      }

      if (isAuthenticated) {

        const res = await userService.addToCart(
          productId,
          quantity
        );

        const serverCart =
          res?.data?.data ||
          res?.data?.cart ||
          res?.data ||
          [];

        setCart(Array.isArray(serverCart) ? serverCart : []);

      } else {

        // For guest users, store in simple format: { _id, quantity }
        // We'll fetch product details when displaying cart
        const updated = [...cart];

        const existing = updated.find(
          i => i._id === productId
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          updated.push({
            _id: productId,
            quantity
          });
        }

        setCart(updated);
        persistLocalCart(updated);
      }

      toast.success('Added to cart');

    } catch (err) {
      console.error(err);
      toast.error('Add to cart failed');
    }
  };

  // ============================
  // Update
  // ============================
  const updateQuantity = async (productId, quantity) => {

    if (quantity < 1) {
      return removeFromCart(productId);
    }

    try {

      if (isAuthenticated) {

        const res =
          await userService.updateCartItem(
            productId,
            quantity
          );

        const serverCart =
          res?.data?.data ||
          res?.data?.cart ||
          res?.data ||
          [];

        setCart(Array.isArray(serverCart) ? serverCart : []);
        toast.success('Quantity updated');

      } else {

        const updated = cart.map(item =>
          item._id === productId
            ? { ...item, quantity }
            : item
        );

        setCart(updated);
        persistLocalCart(updated);
        toast.success('Quantity updated');
      }

    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Update failed';
      toast.error(errorMsg);
    }
  };

  // ============================
  // Remove
  // ============================
  const removeFromCart = async (productId) => {

    try {

      if (isAuthenticated) {

        const res =
          await userService.removeFromCart(productId);

        const serverCart =
          res?.data?.data ||
          res?.data?.cart ||
          res?.data ||
          [];

        setCart(Array.isArray(serverCart) ? serverCart : []);
        toast.success('Removed from cart');

      } else {

        const updated =
          cart.filter(i => i._id !== productId);

        setCart(updated);
        persistLocalCart(updated);
        toast.success('Removed from cart');
      }

    } catch (err) {
      console.error('Remove error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Remove failed';
      toast.error(errorMsg);
    }
  };

  // ============================
  // Clear
  // ============================
  const clearCart = async () => {

    try {

      if (isAuthenticated) {
        await userService.clearCart();
      }

      setCart([]);
      localStorage.removeItem('cart');

    } catch (err) {
      console.error(err);
    }
  };

  // ============================
  // Helpers (SAFE)
  // ============================
  const getCartTotal = () => {

    if (!Array.isArray(cart)) return 0;

    return cart.reduce(
      (t, i) =>
        t +
        (i.product?.price || 0) *
        (i.quantity || 0),
      0
    );
  };

  const getCartCount = () => {

    if (!Array.isArray(cart)) return 0;

    return cart.reduce(
      (c, i) => c + (i.quantity || 0),
      0
    );
  };

  // ============================
  // UI Loader
  // ============================
  if (loading) {
    return <div>Loading cart...</div>;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,

        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,

        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
