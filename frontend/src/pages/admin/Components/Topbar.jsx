import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const Topbar = () => {

  const { user, logout } = useAuth();

  return (
    <div className="admin-topbar">

      <h3>Welcome, {user?.name}</h3>

      <button onClick={logout} className="btn btn-sm btn-danger">
        Logout
      </button>

    </div>
  );
};

export default Topbar;
