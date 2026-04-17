import React, { createContext, useState, useContext } from 'react';
import * as productService from '../services/productService';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt'
  });

  const fetchProducts = async (filterParams = filters) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filterParams);
      setProducts(response.data);
      return response;
    } catch (error) {
      console.error('Fetch products error:', error);
      return { data: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const value = {
    products,
    categories,
    loading,
    filters,
    fetchProducts,
    fetchCategories,
    updateFilters
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
