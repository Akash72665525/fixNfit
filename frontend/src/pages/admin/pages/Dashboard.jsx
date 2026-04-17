import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

const AdminDashboard = () => {

  const [stats, setStats] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      console.log('Stats response:', res);
      
      // Extract stats from nested response
      const statsData = res.data.stats || res.data;
      console.log('Stats data:', statsData);
      
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: '#ff6b35'}}>{stats.users || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: '#ff6b35'}}>{stats.products || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: '#ff6b35'}}>{stats.orders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: '#ff6b35'}}>₹{(stats.revenue || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
