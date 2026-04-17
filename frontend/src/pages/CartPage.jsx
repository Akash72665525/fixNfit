import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as productService from '../services/productService';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = React.useState({});

  // Fetch product details for all cart items
  React.useEffect(() => {
    const fetchProductDetails = async () => {
      const products = {};
      for (const item of cart) {
        const productId = item._id || item.product?._id;
        if (productId && !products[productId]) {
          try {
            const res = await productService.getProductById(productId);
            const productData = res.data.data || res.data;
            products[productId] = productData;
          } catch (err) {
            console.error('Error fetching product:', err);
            products[productId] = null;
          }
        }
      }
      setCartProducts(products);
    };

    if (cart.length > 0) {
      fetchProductDetails();
    }
  }, [cart]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="container text-center">
        <h1>Your Cart is Empty</h1>
        <Link to="/products" className="btn btn-primary mt-3">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.map((item, idx) => {
              // Cart items return only _id (product ID) and quantity
              const productId = item._id || item.product?._id;
              const quantity = Number(item?.quantity) || 0;
              
              // Get fetched product details
              const product = cartProducts[productId] || {};
              const name = product?.name || 'Product';
              const image = (product?.images && product.images.length > 0) ? product.images[0] : '/placeholder.svg';
              const price = Number(product?.price) || 0;

              if (!productId) {
                console.warn('Cart item missing ID:', item);
                return null;
              }

              return (
                <div key={productId} className="cart-item">
                  <img src={image} alt={name} />
                  <div className="cart-item-details">
                    <h3>{name}</h3>
                    <p className="price">₹{price}</p>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(productId, quantity - 1)}
                        className="qty-btn qty-minus"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <input 
                        type="text" 
                        value={quantity} 
                        readOnly 
                        className="qty-input"
                      />
                      <button 
                        onClick={() => updateQuantity(productId, quantity + 1)}
                        className="qty-btn qty-plus"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <p className="subtotal">₹{price * quantity}</p>
                    <button 
                      onClick={() => removeFromCart(productId)} 
                      className="btn-remove"
                      title="Remove from cart"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{getCartTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>{getCartTotal() >= 500 ? 'FREE' : '₹50'}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{getCartTotal() + (getCartTotal() >= 500 ? 0 : 50)}</span>
          </div>
          <button onClick={handleCheckout} className="btn btn-primary btn-block">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
