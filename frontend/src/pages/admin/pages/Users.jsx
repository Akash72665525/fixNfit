import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const Users = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      const data = res.data;
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <h1>Manage Users</h1>

      <div className="card mt-2">
        {loading ? (
          <div className="loader" />
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px'}}>Name</th>
                  <th style={{padding: '8px'}}>Email</th>
                  <th style={{padding: '8px'}}>Admin</th>
                  <th style={{padding: '8px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{borderTop: '1px solid #eee'}}>
                    <td style={{padding: '10px'}}>{u.name || u.username || '-'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>{u.email}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>{u.role === 'admin' ? 'Yes' : 'No'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
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

export default Users;
