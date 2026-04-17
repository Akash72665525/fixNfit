import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const categories = [
    'Cooling Pads',
    'Water Pumps',
    'Motors',
    'Fans & Blowers'
  ];

  return (
    <nav className="navbar">
      <div className="nav-content">

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Menu */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>All Products</Link>

          {categories.map(cat => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {cat}
            </Link>
          ))}

          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
