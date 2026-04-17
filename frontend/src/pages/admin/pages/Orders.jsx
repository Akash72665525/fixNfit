import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../services/orderService';
import toast from 'react-hot-toast';

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      console.log('Orders API response:', res);
      
      // Extract orders from response - could be res.data.orders or res.data.data
      const ordersData = res.data?.orders || res.data?.data || res.data || [];
      console.log('Extracted orders:', ordersData);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, orderStatus) => {
    try {
      console.log(`🔄 Updating order ${id} to status: ${orderStatus}`);
      const response = await updateOrderStatus(id, { orderStatus });
      console.log('✅ Update response:', response);
      toast.success('Order updated');
      loadOrders();
    } catch (err) {
      console.error('❌ Failed to update order:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  return (
    <div>
      <h1>Manage Orders</h1>

      <div className="card mt-2">
        {loading ? (
          <div className="loader" />
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px'}}>Order ID</th>
                  <th style={{padding: '8px'}}>User</th>
                  <th style={{padding: '8px'}}>Total</th>
                  <th style={{padding: '8px'}}>Status</th>
                  <th style={{padding: '8px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{borderTop: '1px solid #eee'}}>
                    <td style={{padding: '10px'}}>{o.orderNumber || o._id}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>{o.user?.email || o.user || '-'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>₹{o.total ?? '-'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>{o.orderStatus || 'pending'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>
                      <select value={o.orderStatus || 'pending'} onChange={(e) => changeStatus(o._id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
