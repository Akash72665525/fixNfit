import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-placeholder">📦</div>
          )}
        </div>
      </Link>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price">₹{product.price}</div>
        {product.ratings?.average > 0 && (
          <div className="product-rating">
            {'⭐'.repeat(Math.round(product.ratings.average))} ({product.ratings.count})
          </div>
        )}
        <button 
          className="btn btn-primary btn-block"
          onClick={() => addToCart(product._id)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
