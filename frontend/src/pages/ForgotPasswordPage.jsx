import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [notRegisteredError, setNotRegisteredError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRateLimitError(null);
    setNotRegisteredError(null);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        toast.success('Password reset link sent to your email');
        setSubmitted(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Handle not registered error
        if (response.data.notRegistered) {
          setNotRegisteredError(email);
          toast.error(response.data.message);
        } else if (response.data.rateLimited) {
          setRateLimitError({
            type: response.data.type,
            message: response.data.message,
            requestsUsed: response.data.requestsUsed,
            requestsLimit: response.data.requestsLimit
          });
          toast.error(response.data.message);
        } else {
          toast.error(response.data.message || 'Failed to send reset link');
        }
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle not registered error from catch block
      if (errorData?.notRegistered) {
        setNotRegisteredError(email);
        toast.error(errorData.message);
      } else if (errorData?.rateLimited) {
        setRateLimitError({
          type: errorData.type,
          message: errorData.message,
          requestsUsed: errorData.requestsUsed,
          requestsLimit: errorData.requestsLimit
        });
        toast.error(errorData.message);
      } else {
        const errorMsg = errorData?.message || 'Failed to send reset link';
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1>Check Your Email</h1>
          <div style={{
            background: '#e8f5e9',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{margin: 0, color: '#2e7d32', fontSize: '16px'}}>
              ✓ Password reset link has been sent to <strong>{email}</strong>
            </p>
          </div>
          <p style={{textAlign: 'center', marginBottom: '20px'}}>
            Please check your email and follow the link to reset your password.
          </p>
          <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#666'}}>
            Redirecting to login page in 3 seconds...
          </p>
          <Link to="/login" className="btn btn-primary btn-block">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="auth-container">
        <h1>Forgot Password?</h1>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Not Registered Error */}
        {notRegisteredError && (
          <div style={{
            background: '#ffebee',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ef5350'
          }}>
            <p style={{margin: '0 0 8px 0', color: '#c62828', fontSize: '14px', fontWeight: '600'}}>
              ❌ Email Not Registered
            </p>
            <p style={{margin: '0 0 12px 0', color: '#c62828', fontSize: '14px'}}>
              This email is not associated with any account. Please create an account first.
            </p>
            <button
              onClick={() => navigate(`/register?email=${encodeURIComponent(notRegisteredError)}`)}
              style={{
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Rate Limit Error Messages */}
        {rateLimitError && (
          <div style={{
            background: rateLimitError.type === 'active_link_exists' ? '#fff3e0' : '#ffebee',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${rateLimitError.type === 'active_link_exists' ? '#ffb74d' : '#ef5350'}`
          }}>
            <p style={{margin: '0 0 8px 0', color: rateLimitError.type === 'active_link_exists' ? '#e65100' : '#c62828', fontSize: '14px', fontWeight: '600'}}>
              {rateLimitError.type === 'active_link_exists' ? '⏳ Active Link Exists' : '❌ Too Many Requests'}
            </p>
            <p style={{margin: 0, color: rateLimitError.type === 'active_link_exists' ? '#e65100' : '#c62828', fontSize: '14px'}}>
              {rateLimitError.message}
            </p>
            {rateLimitError.type === 'daily_limit_exceeded' && (
              <p style={{margin: '8px 0 0 0', color: rateLimitError.type === 'active_link_exists' ? '#e65100' : '#c62828', fontSize: '12px'}}>
                Requests used: {rateLimitError.requestsUsed}/{rateLimitError.requestsLimit}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center mt-2">
          Remember your password?{' '}
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
