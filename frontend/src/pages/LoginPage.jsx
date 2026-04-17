import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();


  // ✅ Redirect after login (BEST PRACTICE)
  useEffect(() => {

    if (user) {

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    }

  }, [user, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await login(
      formData.email,
      formData.password
    );

    setLoading(false);
  };


  return (
    <div className="container">
      <div className="auth-container">

        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
              required
            />
          </div>


          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              required
            />
          </div>


          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

        </form>

        <p className="text-center mt-2">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <p className="text-center mt-2">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
