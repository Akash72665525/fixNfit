import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id); // Start with loading true if id exists
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: 0,
    brand: '',
    category: 'Cooling Pads',
    stock: '',
    sku: '',
    images: [],
    warranty: 'No warranty',
    compatibility: []
  });

  const categories = [
    'Cooling Pads',
    'Water Pumps',
    'Motors',
    'Fans & Blowers',
    'Remote Controls',
    'Castor Wheels',
    'Filters',
    'Water Level Indicators',
    'Switches & Buttons',
    'Cooler Bodies',
    'Ice Chambers',
    'Other Parts'
  ];

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      
      // Extract actual product from nested response
      const product = res.data.data;
      
      if (!product) {
        toast.error('Product not found');
        setLoading(false);
        return;
      }

      // Convert to strings for number inputs
      const updatedData = {
        name: product.name || '',
        description: product.description || '',
        price: product.price ? String(product.price) : '',
        originalPrice: product.originalPrice ? String(product.originalPrice) : '',
        discount: product.discount || 0,
        brand: product.brand || '',
        category: product.category || 'Cooling Pads',
        stock: (product.stock !== undefined && product.stock !== null) ? String(product.stock) : (product.countInStock ? String(product.countInStock) : ''),
        sku: product.sku || '',
        images: Array.isArray(product.images) ? product.images : [],
        warranty: product.warranty || 'No warranty',
        compatibility: Array.isArray(product.compatibility) ? product.compatibility : []
      };
      
      setFormData(updatedData);
    } catch (err) {
      console.error('Error loading product:', err);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'discount' || name === 'originalPrice' 
        ? parseFloat(value) || '' 
        : value
    }));
  };

  const handleImagesChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      images: value.split(',').map(img => img.trim()).filter(img => img)
    }));
  };

  const handleCompatibilityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      compatibility: value.split(',').map(c => c.trim()).filter(c => c)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price || !formData.category || formData.stock === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: parseInt(formData.discount) || 0,
        brand: formData.brand,
        category: formData.category,
        stock: parseInt(formData.stock),
        sku: formData.sku,
        images: formData.images,
        warranty: formData.warranty,
        compatibility: formData.compatibility
      };

      if (id) {
        await api.put(`/admin/products/${id}`, submitData);
        toast.success('Product updated');
      } else {
        await api.post(`/admin/products`, submitData);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Product' : 'Create Product'}</h1>

      <div className="card mt-2">
        {loading && id ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="loader" style={{margin: '0 auto'}} />
            <p>Loading product details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Original Price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                className="form-control"
                value={formData.originalPrice}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                name="discount"
                className="form-control"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                name="stock"
                className="form-control"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              name="sku"
              className="form-control"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., CP-001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URLs (comma separated)</label>
            <textarea
              name="images"
              className="form-control"
              rows="2"
              value={formData.images.join(', ')}
              onChange={handleImagesChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty</label>
            <input
              type="text"
              name="warranty"
              className="form-control"
              value={formData.warranty}
              onChange={handleChange}
              placeholder="e.g., 1 Year Warranty"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Compatibility (comma separated)</label>
            <textarea
              name="compatibility"
              className="form-control"
              rows="2"
              value={formData.compatibility.join(', ')}
              onChange={handleCompatibilityChange}
              placeholder="Compatible models separated by commas"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/products')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
