import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });
  
  const [otpData, setOtpData] = useState({
    emailOtp: '',
    phoneOtp: ''
  });

  const [verification, setVerification] = useState({
    emailVerified: false,
    phoneVerified: false
  });

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState({ email: false, phone: false });
  const [otpSent, setOtpSent] = useState({ email: false, phone: false });
  const [otpCountdown, setOtpCountdown] = useState({ email: 0, phone: 0 });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Pre-fill email from query params if provided
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // Send OTP to email
  const sendEmailOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter email');
      return;
    }

    setOtpLoading({ ...otpLoading, email: true });
    try {
      const response = await api.post('/auth/send-email-otp', { email: formData.email });
      if (response.data.success) {
        toast.success('OTP sent to email');
        setOtpSent({ ...otpSent, email: true });
        setOtpCountdown({ ...otpCountdown, email: 60 });
        
        // Countdown timer
        const interval = setInterval(() => {
          setOtpCountdown(prev => {
            const newCount = prev.email - 1;
            if (newCount <= 0) {
              clearInterval(interval);
              setOtpSent({ ...otpSent, email: false });
              return { ...prev, email: 0 };
            }
            return { ...prev, email: newCount };
          });
        }, 1000);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setOtpLoading({ ...otpLoading, email: false });
    }
  };

  // Send OTP to phone
  const sendPhoneOtp = async () => {
    if (!formData.phone) {
      toast.error('Please enter phone number');
      return;
    }

    setOtpLoading({ ...otpLoading, phone: true });
    try {
      const response = await api.post('/auth/send-phone-otp', { phone: formData.phone });
      if (response.data.success) {
        toast.success('OTP sent to phone');
        setOtpSent({ ...otpSent, phone: true });
        setOtpCountdown({ ...otpCountdown, phone: 60 });
        
        // Countdown timer
        const interval = setInterval(() => {
          setOtpCountdown(prev => {
            const newCount = prev.phone - 1;
            if (newCount <= 0) {
              clearInterval(interval);
              setOtpSent({ ...otpSent, phone: false });
              return { ...prev, phone: 0 };
            }
            return { ...prev, phone: newCount };
          });
        }, 1000);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send phone OTP');
    } finally {
      setOtpLoading({ ...otpLoading, phone: false });
    }
  };

  // Verify email OTP
  const verifyEmailOtp = async () => {
    if (!otpData.emailOtp) {
      toast.error('Please enter email OTP');
      return;
    }

    try {
      const response = await api.post('/auth/verify-email-otp', {
        email: formData.email,
        otp: otpData.emailOtp
      });
      if (response.data.success) {
        toast.success('Email verified');
        setVerification({ ...verification, emailVerified: true });
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify email OTP');
    }
  };

  // Verify phone OTP
  const verifyPhoneOtp = async () => {
    if (!otpData.phoneOtp) {
      toast.error('Please enter phone OTP');
      return;
    }

    try {
      const response = await api.post('/auth/verify-phone-otp', {
        phone: formData.phone,
        otp: otpData.phoneOtp
      });
      if (response.data.success) {
        toast.success('Phone verified');
        setVerification({ ...verification, phoneVerified: true });
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify phone OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verification.emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    if (!verification.phoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>
              Email {verification.emailVerified && <span style={{color: '#4caf50', marginLeft: '5px'}}>✓</span>}
            </label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={verification.emailVerified}
                required
                style={{flex: '0 0 80%'}}
              />
              {!verification.emailVerified && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={sendEmailOtp}
                  disabled={otpLoading.email || !formData.email || otpCountdown.email > 0}
                  style={{flex: '0 0 20%', whiteSpace: 'nowrap', marginTop: '0'}}
                >
                  {otpLoading.email ? 'Sending...' : otpCountdown.email > 0 ? `Resend (${otpCountdown.email}s)` : 'Send OTP'}
                </button>
              )}
            </div>
            {otpSent.email && !verification.emailVerified && (
              <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="6-digit OTP"
                  value={otpData.emailOtp}
                  onChange={(e) => setOtpData({...otpData, emailOtp: e.target.value})}
                  maxLength="6"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={verifyEmailOtp}
                  style={{whiteSpace: 'nowrap'}}
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>
              Phone {verification.phoneVerified && <span style={{color: '#4caf50', marginLeft: '5px'}}>✓</span>}
            </label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={verification.phoneVerified}
                required
                style={{flex: '0 0 80%'}}
              />
              {!verification.phoneVerified && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={sendPhoneOtp}
                  disabled={otpLoading.phone || !formData.phone || otpCountdown.phone > 0}
                  style={{flex: '0 0 20%', whiteSpace: 'nowrap', marginTop: '0'}}
                >
                  {otpLoading.phone ? 'Sending...' : otpCountdown.phone > 0 ? `Resend (${otpCountdown.phone}s)` : 'Send OTP'}
                </button>
              )}
            </div>
            {otpSent.phone && !verification.phoneVerified && (
              <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="6-digit OTP"
                  value={otpData.phoneOtp}
                  onChange={(e) => setOtpData({...otpData, phoneOtp: e.target.value})}
                  maxLength="6"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={verifyPhoneOtp}
                  style={{whiteSpace: 'nowrap'}}
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {/* Verification Status */}
          {(!verification.emailVerified || !verification.phoneVerified) && (
          <div style={{
            background: '#fff3e0',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p style={{margin: '5px 0'}}>
              {verification.emailVerified ? '✓ Email verified' : '○ Email verification pending'}
            </p>
            <p style={{margin: '5px 0'}}>
              {verification.phoneVerified ? '✓ Phone verified' : '○ Phone verification pending'}
            </p>
          </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !verification.emailVerified || !verification.phoneVerified}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
          Already have an account? <Link to="/login" style={{color: '#ff6b35', textDecoration: 'none', fontWeight: '600'}}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
