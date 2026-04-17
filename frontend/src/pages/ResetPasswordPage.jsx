import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(!!token);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [validating, setValidating] = useState(!!token); // Show loading while validating

  // Validate token on mount and get remaining time from server
  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        const response = await api.post('/auth/validate-reset-token', { token });
        
        if (response.data.success && response.data.valid) {
          // Token is valid, set remaining time from server
          setTimeRemaining(response.data.remainingSeconds);
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
        setTimeRemaining(0);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (!token || !tokenValid || validating) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTokenValid(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, tokenValid, validating]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!token) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1>Invalid Reset Link</h1>
          <div style={{
            background: '#ffebee',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{margin: 0, color: '#c62828', fontSize: '16px'}}>
              ✗ The password reset link is missing or invalid.
            </p>
          </div>
          <p style={{textAlign: 'center', marginBottom: '20px'}}>
            Please request a new password reset link.
          </p>
          <Link to="/forgot-password" className="btn btn-primary btn-block">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully!');
        
        setSubmitted(true);
        
        // Redirect to user home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
        if (response.data.message.includes('expired')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMsg);
      if (errorMsg.includes('expired')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1>Password Reset Successful</h1>
          <div style={{
            background: '#e8f5e9',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{margin: 0, color: '#2e7d32', fontSize: '16px'}}>
              ✓ Your password has been reset successfully
            </p>
          </div>
          <p style={{textAlign: 'center', marginBottom: '20px'}}>
            You can now login with your new password.
          </p>
          <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#666'}}>
            Redirecting to home page in 3 seconds...
          </p>
          <Link to="/" className="btn btn-primary btn-block">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1>Reset Link Expired</h1>
          <div style={{
            background: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{margin: 0, color: '#e65100', fontSize: '16px'}}>
              ⚠ The password reset link has expired.
            </p>
          </div>
          <p style={{textAlign: 'center', marginBottom: '20px'}}>
            Please request a new password reset link.
          </p>
          <Link to="/forgot-password" className="btn btn-primary btn-block">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="auth-container">
        <h1>Reset Password</h1>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
          Enter your new password below.
        </p>

        {/* Validating Token */}
        {validating && (
          <div style={{
            background: '#e3f2fd',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            <p style={{margin: 0, color: '#2196f3', fontSize: '16px'}}>
              ⏳ Validating reset link...
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        {!validating && (
        <div style={{
          background: timeRemaining < 120 ? '#fff3e0' : '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '25px',
          border: `2px solid ${timeRemaining < 120 ? '#ff9800' : '#2196f3'}`
        }}>
          <p style={{margin: '0 0 8px 0', fontSize: '14px', color: '#666'}}>
            Reset link expires in:
          </p>
          <p style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: timeRemaining < 120 ? '#ff6b35' : '#2196f3',
            fontFamily: 'monospace'
          }}>
            {formatTime(timeRemaining)}
          </p>
          {timeRemaining < 120 && (
            <p style={{margin: '8px 0 0 0', fontSize: '12px', color: '#ff6b35'}}>
              ⚠ Link expires soon. Please hurry!
            </p>
          )}
        </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
          Remember your password?{' '}
          <Link to="/login" style={{color: '#ff6b35', textDecoration: 'none', fontWeight: '600'}}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
