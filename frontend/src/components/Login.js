import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoImage from '../Logo.jpg';
import '../styles/auth.css';
import config from '../config'; // Updated import path

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${config.API_URL}/api/user/register`, { name, number: phone });
      setMode('login');
      setName('');
      setPhone('');
      alert('Registration successful! Please login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  // Login handler (no OTP)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${config.API_URL}/api/user/login`, { name, number: phone });
      if (res.data && res.data.userId) {
        const userId = res.data.userId;
        // First check the status to determine if all steps are complete
        const statusRes = await axios.get(`${config.API_URL}/api/user/${userId}/status`);
        const appStatus = statusRes.data.status;
        // Fetch user details to check KYC
        const userRes = await axios.get(`${config.API_URL}/api/user/${userId}`);
        const user = userRes.data;
        if (!user.fullName || !user.panNumber || !user.aadhaarNumber || !user.panCardPath || !user.aadhaarCardPath) {
          navigate(`/kyc/${userId}`);
        } else {
          navigate(`/user-dashboard/${userId}`);
        }
      } else {
        setError('Invalid login response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-container">
            <img src={logoImage} alt="Alethemyra Logo" className="auth-logo-img" />
            <div className="brand-text">
              <h1 className="company-name">Alethemyra</h1>
            </div>
          </div>
        </div>
        
        {mode === 'register' ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <h1 className="auth-title">Create Account</h1>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            <div className="auth-switch">
              Already have an account?
              <span onClick={() => { setMode('login'); setError(''); }}>Login</span>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <h1 className="auth-title">Welcome Back</h1>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-switch">
              Don't have an account?
              <span onClick={() => { setMode('register'); setError(''); }}>Register</span>
            </div>
            <div className="auth-switch">
              <button 
                onClick={() => navigate('/admin')} 
                className="admin-login-button"
                type="button"
              >
                Admin Login
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
