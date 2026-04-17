import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as productService from '../services/productService';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const loadProduct = useCallback(async () => {
    try {
      const response = await productService.getProductById(id);
      // Extract product from nested response
      const productData = response.data.data || response.data;
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - FixNFit`;
      setMeta('description', product.description ? product.description.substring(0, 160) : `Buy ${product.name} on FixNFit.`);
      setMetaProperty('og:title', product.name);
      setMetaProperty('og:description', product.description ? product.description.substring(0, 200) : `Buy ${product.name} on FixNFit.`);
      setMetaProperty('og:image', product.images?.[0] || `${window.location.origin}/placeholder.svg`);
      setCanonical(window.location.href);
    }
  }, [product]);

  const setMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setMetaProperty = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setCanonical = (href) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container">Product not found</div>;

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-images">
          <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} />
        </div>
        <div className="product-details">
          <h1>{product.name}</h1>
          <div className="product-category">{product.category}</div>
          <div className="product-price">₹{product.price}</div>
          <p>{product.description}</p>
          <button 
            onClick={() => addToCart(product)} 
            className="btn btn-primary btn-lg"
          >
            Add to Cart
          </button>
          {product.specifications && (
            <div className="specifications">
              <h3>Specifications</h3>
              {Object.entries(product.specifications).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
