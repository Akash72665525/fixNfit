import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
  try {
    const response = await productService.getFeaturedProducts();

    // Handle backend format
    if (response.data && Array.isArray(response.data.data)) {
      setFeaturedProducts(response.data.data);
    } else {
      setFeaturedProducts([]);
    }

  } catch (error) {
    console.error('Error loading featured products:', error);
    setFeaturedProducts([]);
  } finally {
    setLoading(false);
  }
};


  const categories = [
    { name: 'Cooling Pads', icon: '❄️', link: '/products?category=Cooling Pads' },
    { name: 'Water Pumps', icon: '💧', link: '/products?category=Water Pumps' },
    { name: 'Motors', icon: '⚙️', link: '/products?category=Motors' },
    { name: 'Fans & Blowers', icon: '🌀', link: '/products?category=Fans & Blowers' },
  ];

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Premium Air Cooler Spare Parts</h1>
          <p>Quality replacement parts for all major air cooler brands</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now
          </Link>
        </div>
      </section>

      <div className="container">

        {/* Categories */}
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="category-card"
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-section">
          <h2 className="section-title">Featured Products</h2>

          {loading ? (
            <div className="loader"></div>
          ) : (
            <div className="products-grid">

              {Array.isArray(featuredProducts) &&
                featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              }

            </div>
          )}
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders above ₹500</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Cash on Delivery</h3>
              <p>Available across India</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Quality Assured</h3>
              <p>Genuine spare parts</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>24/7 Support</h3>
              <p>Always here to help</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
