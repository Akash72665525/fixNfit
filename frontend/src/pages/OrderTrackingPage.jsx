import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as orderService from '../services/orderService';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const loadOrder = useCallback(async () => {
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (!order) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Order #{order.orderNumber}</h1>
      <div className="order-status">
        <div className="status-badge">{order.orderStatus}</div>
      </div>
      <div className="order-details">
        <h2>Items</h2>
        {order.items.map(item => (
          <div key={item._id} className="order-item">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="order-total">
          <span>Total:</span>
          <span>₹{order.total}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
