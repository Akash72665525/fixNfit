import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const Products = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      const data = res.data;
      setProducts(Array.isArray(data) ? data : (data?.products || []));
    } catch (err) {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin/products/new'}>Create Product</button>
      </div>

      <div className="card mt-2">
        {loading ? (
          <div className="loader" />
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px'}}>Name</th>
                  <th style={{padding: '8px'}}>Price</th>
                  <th style={{padding: '8px'}}>Stock</th>
                  <th style={{padding: '8px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{borderTop: '1px solid #eee'}}>
                    <td style={{padding: '10px'}}>{p.name}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>₹{p.price}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>{p.countInStock ?? p.stock ?? '-'}</td>
                    <td style={{padding: '10px', textAlign: 'center'}}>
                      <button className="btn btn-sm btn-secondary" style={{marginRight: 8}} onClick={() => window.location.href = `/admin/products/${p._id}/edit`}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
