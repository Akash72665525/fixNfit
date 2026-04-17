import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="admin-sidebar">

      <h2 className="logo">FixNFit Admin</h2>

      <nav>

        <NavLink to="/admin">Dashboard</NavLink>
<NavLink to="/admin/products">Products</NavLink>
<NavLink to="/admin/orders">Orders</NavLink>
<NavLink to="/admin/users">Users</NavLink>


      </nav>

    </div>
  );
};

export default Sidebar;
