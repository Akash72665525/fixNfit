import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import cartIcon from '../../images/cart-logo.png';
import './Header.css';
import * as productService from '../../services/productService';


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productService.suggest(searchQuery.trim());
        const data = res.data?.data || res.data || [];
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        const name = suggestions[selectedIndex].name;
        setSearchQuery(name);
        setShowSuggestions(false);
        navigate(`/products?search=${encodeURIComponent(name)}`);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(name)}`);
    setMobileSearchOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">

        {/* Desktop Logo */}
        <Link to="/" className="logo logo-desktop">
  FixNFit
</Link>
{/* Mobile Logo */}
<Link to="/" className="logo logo-mobile">
  FixNFit
</Link>


        {/* Desktop Search */}
        <form className="search-bar desktop-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for spare parts..."
            value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={inputRef}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-suggestions" role="listbox">
              {suggestions.map((s, idx) => (
                <li
                  key={s._id}
                  role="option"
                  aria-selected={selectedIndex === idx}
                  className={selectedIndex === idx ? 'selected' : ''}
                  onMouseDown={() => handleSuggestionClick(s.name)}
                >
                  <div className="s-name">{s.name}</div>
                  <div className="s-price">{s.price ? `₹${s.price}` : ''}</div>
                </li>
              ))}
            </ul>
          )}

        {/* Actions */}
        <div className="header-actions">

          {/* Mobile Search Icon */}
          <button
            className="mobile-search-btn"
            onClick={() => setMobileSearchOpen(true)}
          >
            🔍
          </button>

          {isAuthenticated && (
            <Link to="/profile" className="profile-icon" title="My Profile">
              👤
            </Link>
          )}

          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-secondary">Login</Link>
          ) : (
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          )}

          <Link to="/cart" className="cart-icon">
            <img
    src={cartIcon}
    alt="Cart"
    className="cart-img"
  />
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="mobile-search-overlay">
          <form className="mobile-search-bar" onSubmit={handleSearch}>
            <input
              autoFocus
              type="text"
              placeholder="Search for spare parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
            <button
              type="button"
              className="close-search"
              onClick={() => setMobileSearchOpen(false)}
            >
              ✕
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
