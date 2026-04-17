import api from './api';

export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

export const getMyOrders = (params) => {
  return api.get('/orders/my-orders', { params });
};

export const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};

export const getInvoice = (id) => {
  return api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
};

export const updatePaymentStatus = (id, paymentData) => {
  return api.put(`/orders/${id}/payment`, paymentData);
};

export const cancelOrder = (id, reason) => {
  return api.delete(`/orders/${id}`, { data: { reason } });
};

// Admin only
export const getAllOrders = (params) => {
  return api.get('/admin/orders', { params });
};

export const updateOrderStatus = (id, statusData) => {
  return api.put(`/admin/orders/${id}`, statusData);
};
