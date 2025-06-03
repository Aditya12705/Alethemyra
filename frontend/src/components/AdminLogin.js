import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../Logo.jpg';
import '../styles/auth.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple credential check
    if (credentials.username === 'admin' && credentials.password === 'password123') {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-container">
            <img src={logoImage} alt="Alethemyra Logo" className="auth-logo-img" />
            <div className="brand-text">
              <h1 className="company-name">Alethemyra</h1>
              {/* Removed Cred-Mod-I from admin panel */}
            </div>
          </div>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">Admin Login</h1>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={e => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter password"
              required
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="auth-switch">
            <span onClick={() => navigate('/')}>Back to User Login</span>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;