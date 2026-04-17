import api from './api';

export const getProducts = (params) => {
  return api.get('/products', { params });
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const getCategories = () => {
  return api.get('/products/categories');
};

export const getFeaturedProducts = () => {
  return api.get('/products/featured');
};

export const suggest = (q) => {
  return api.get('/products/suggest', { params: { q } });
};

export const addReview = (productId, reviewData) => {
  return api.post(`/products/${productId}/reviews`, reviewData);
};

// Admin only
export const createProduct = (productData) => {
  return api.post('/products', productData);
};

export const updateProduct = (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
