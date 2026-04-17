import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as orderService from '../services/orderService';

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      console.log('Orders response:', response);
      
      // Extract orders from response
      const ordersData = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <h1 style={{marginBottom: '30px'}}>My Profile</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px'}}>
        {/* Profile Info */}
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{marginTop: 0, color: '#ff6b35'}}>Account Information</h2>
          <div style={{lineHeight: '1.8'}}>
            <p><strong>Name:</strong> {user?.name || '-'}</p>
            <p><strong>Email:</strong> {user?.email || '-'}</p>
            <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
            <p><strong>Role:</strong> {user?.role === 'admin' ? 'Admin' : 'Customer'}</p>
          </div>
        </div>

        {/* Account Stats */}
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{marginTop: 0, color: '#ff6b35'}}>Account Stats</h2>
          <div style={{fontSize: '18px', lineHeight: '2'}}>
            <p><strong>Total Orders:</strong> {orders.length}</p>
            <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <h2 style={{color: '#ff6b35', marginBottom: '20px'}}>Order History</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: '#f5f5f5',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{fontSize: '16px', color: '#666'}}>No orders yet</p>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '15px'}}>
            {orders.map(order => (
              <React.Fragment key={order._id}>
                <div 
                  style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #ff6b35'
                  }}
                >
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px'}}>
                  <div>
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#999'}}>Order ID</p>
                    <p style={{margin: 0, fontWeight: 'bold'}}>{order.orderNumber || order._id}</p>
                  </div>
                  <div>
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#999'}}>Date</p>
                    <p style={{margin: 0}}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#999'}}>Status</p>
                    <p style={{
                      margin: 0, 
                      fontWeight: 'bold',
                      color: order.orderStatus === 'delivered' ? '#4caf50' : 
                             order.orderStatus === 'cancelled' ? '#f44336' : '#ff6b35',
                      textTransform: 'capitalize'
                    }}>
                      {order.orderStatus}
                    </p>
                  </div>
                  <div>
                    <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#999'}}>Total</p>
                    <p style={{margin: 0, fontWeight: 'bold', fontSize: '16px'}}>₹{order.total}</p>
                  </div>
                  </div>
                </div>
                <div style={{marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                  {order.orderStatus === 'delivered' ? (
                    <button
                      onClick={async () => {
                        try {
                          const { getInvoice } = await import('../services/orderService');
                          const res = await getInvoice(order._id);
                          const blob = new Blob([res.data], { type: res.headers['content-type'] || 'text/html' });
                          const url = window.URL.createObjectURL(blob);
                          const win = window.open(url, '_blank');
                          if (!win) {
                            // Fallback: force download
                            const a = document.createElement('a');
                            const filename = (res.headers['content-disposition'] || '').match(/filename="?(.*)"?/)?.[1] || `invoice-${order.orderNumber}.html`;
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          }
                          setTimeout(() => window.URL.revokeObjectURL(url), 60 * 1000);
                        } catch (err) {
                          console.error('Invoice download error:', err);
                          alert('Failed to download invoice. Please try again.');
                        }
                      }}
                      title="Download Invoice"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ) : (
                    <div style={{color: '#666', fontSize: '14px', padding: '8px 12px', borderRadius: '6px', background: '#fffaf0'}}>
                      Invoice will be generated once product is delivered
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
