import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
      };
      const response = await productService.getProducts(params);
      
      // Extract products array from response
      const productsData = response.data.data || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const setMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
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

  useEffect(() => {
    const q = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    if (q) {
      document.title = `Search results for "${q}" - FixNFit`;
      setMeta('description', `Search results for ${q} on FixNFit. Find spare parts, accessories and replacement items.`);
    } else if (category) {
      document.title = `${category} - FixNFit`;
      setMeta('description', `Browse ${category} products on FixNFit.`);
    } else {
      document.title = 'Products - FixNFit';
      setMeta('description', 'Browse products on FixNFit. Find spare parts, accessories and replacement items.');
    }

    // update canonical link
    setCanonical(window.location.href);
  }, [searchParams]);

  return (
    <div className="container">
      <h1 className="section-title">Products</h1>
      {loading ? (
        <Loader />
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
