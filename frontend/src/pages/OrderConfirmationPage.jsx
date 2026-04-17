import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const { id } = useParams();

  return (
    <div className="container text-center">
      <div className="success-icon">✓</div>
      <h1>Order Placed Successfully!</h1>
      <p>Your order number is: <strong>{id}</strong></p>
      <p>We'll send you an email with order details.</p>
      <div className="mt-3">
        <Link to="/profile" className="btn btn-primary">View Orders</Link>
        <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
