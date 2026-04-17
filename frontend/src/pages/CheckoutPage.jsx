import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import * as orderService from '../services/orderService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Handle both authenticated cart structure (with _id directly) and guest cart (with product object)
      const items = cart.map(item => ({
        product: item.product?._id || item._id,
        quantity: item.quantity
      }));

      console.log('Creating order with items:', items);

      const orderData = {
        items,
        shippingAddress: formData,
        paymentMethod
      };
      
      const response = await orderService.createOrder(orderData);
      console.log('Order response:', response);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${response.data._id || response.data.data._id}`);
    } catch (error) {
      console.error('Order error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">
          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" className="form-control" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" className="form-control" value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})} required />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>City</label>
                <input type="text" className="form-control" value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" className="form-control" value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input type="text" className="form-control" value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})} required />
            </div>
            
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)} />
                Cash on Delivery
              </label>
              <label>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)} />
                Razorpay
              </label>
            </div>
          </div>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            {cart.map(item => {
              const productId = item.product?._id || item._id;
              const productName = item.product?.name || 'Product';
              const productPrice = item.product?.price || 0;
              return (
                <div key={productId} className="summary-item">
                  <span>{productName} x {item.quantity}</span>
                  <span>₹{productPrice * item.quantity}</span>
                </div>
              );
            })}
            <div className="summary-total">
              <span>Total:</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
