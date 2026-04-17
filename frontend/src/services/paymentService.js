import api from './api';

export const createRazorpayOrder = (amount, currency = 'INR') => {
  return api.post('/payment/razorpay/create-order', { amount, currency });
};

export const verifyRazorpayPayment = (paymentData) => {
  return api.post('/payment/razorpay/verify', paymentData);
};

export const createStripeIntent = (amount, currency = 'inr') => {
  return api.post('/payment/stripe/create-intent', { amount, currency });
};

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
