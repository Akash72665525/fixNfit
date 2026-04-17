import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// Components
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages (User)
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsPage from './pages/ReturnsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLayout from './pages/admin/Components/AdminLayout';
import AdminDashboard from './pages/admin/pages/Dashboard';
import AdminProducts from './pages/admin/pages/Products';
import AdminOrders from './pages/admin/pages/Orders';
import AdminUsers from './pages/admin/pages/Users';
import ProductForm from './pages/admin/pages/ProductForm';

// Component to conditionally show navbar
function NavbarWrapper() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return (
    <>
      <Header />
      <Navbar />
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <ProductProvider>

            <div className="App">

              {/* Show Header/Navbar only for non-admin routes */}
              <NavbarWrapper />

              <main className="main-content">

                <Routes>

                  {/* ================= USER ROUTES ================= */}

                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />

                  {/* Protected User */}
                  <Route
                    path="/cart"
                    element={
                      <PrivateRoute>
                        <CartPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/order-confirmation/:id"
                    element={
                      <PrivateRoute>
                        <OrderConfirmationPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/orders/:id"
                    element={
                      <PrivateRoute>
                        <OrderTrackingPage />
                      </PrivateRoute>
                    }
                  />

                  {/* ================= ADMIN ROUTES ================= */}

                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminOnly>
                        <AdminLayout />
                      </PrivateRoute>
                    }
                  >

                    {/* /admin */}
                    <Route index element={<AdminDashboard />} />

                    {/* /admin/products */}
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id/edit" element={<ProductForm />} />

                    {/* /admin/orders */}
                    <Route path="orders" element={<AdminOrders />} />

                    {/* /admin/users */}
                    <Route path="users" element={<AdminUsers />} />

                  </Route>

                  {/* ================= 404 ================= */}

                  <Route path="*" element={<NotFoundPage />} />

                </Routes>

              </main>

              <Footer />
              <Toaster position="top-right" />

            </div>

          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
