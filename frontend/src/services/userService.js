import api from './api';

/* ============================
   Profile
============================ */

export const getProfile = async () => {
  return await api.get('/users/profile');
};

export const updateProfile = async (profileData) => {
  return await api.put('/users/profile', profileData);
};


/* ============================
   Cart
============================ */

export const getCart = async () => {
  return await api.get('/users/cart');
};

export const addToCart = async (productId, quantity = 1) => {
  return await api.post('/users/cart', {
    productId,
    quantity
  });
};

export const updateCartItem = async (productId, quantity) => {
  return await api.put(`/users/cart/${productId}`, {
    quantity
  });
};

export const removeFromCart = async (productId) => {
  return await api.delete(`/users/cart/${productId}`);
};

export const clearCart = async () => {
  return await api.delete('/users/cart');
};
