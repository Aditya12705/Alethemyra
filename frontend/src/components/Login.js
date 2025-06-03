import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

const Login = () => {
  const [isUser, setIsUser] = useState(true); // Toggle between User and Admin
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register for users
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState(''); // For admin login

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/user/login', {
        name,
        number
      });
      
      if (response.data.success) {
        const userId = response.data.userId;
        // After login, fetch user details to check if KYC is already done
        // const userRes = await axios.get(`http://localhost:5000/api/user/${userId}`);
        // const user = userRes.data;
        
        // If KYC is done (all fields and docs present), go to dashboard, else go to KYC
        // if (
        //   user.fullName && user.panNumber && user.aadhaarNumber &&
        //   user.panCardPath && user.aadhaarCardPath
        // ) {
          navigate(`/user-dashboard/${userId}`);
        // } else {
        //   navigate(`/kyc/${userId}`);
        // }
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/user/register', {
        name,
        number
      });
      
      if (response.data.success) {
        setIsLogin(true);
        setName('');
        setNumber('');
        // setPassword(''); // Password is for admin only
        setError('Registration successful! Please login.');
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        username: name,
        password,
      });
      if (response.data.success) {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{flexDirection:'column'}}>
      <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32}}>
        <img src="alethemyra-logo.jpg" alt="Alethemyra Logo" style={{height:48,marginRight:16}} />
        <div>
          <div style={{fontWeight:700,fontSize:22,color:'#7C6A4E',letterSpacing:1}}>Alethemyra</div>
          <div style={{fontWeight:500,fontSize:16,color:'#C2A66C'}}>Cred-Mod-I</div>
        </div>
      </div>
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <div className="role-toggle">
          <button
            className={isUser ? 'role-button active' : 'role-button'}
            onClick={() => {
              setIsUser(true);
              setError('');
              setName('');
              setNumber('');
              setPassword('');
            }}
          >
            User
          </button>
          <button
            className={!isUser ? 'role-button active' : 'role-button'}
            onClick={() => {
              setIsUser(false);
              setError('');
              setName('');
              setNumber('');
              setPassword('');
            }}
          >
            Admin
          </button>
        </div>

        {isUser ? (
          <>
            <h2 className="form-title">{isLogin ? 'User Login' : 'User Register'}</h2>
            <form onSubmit={isLogin ? handleUserLogin : handleUserRegister}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="number" className="form-label">Phone Number</label>
                <input
                  id="number"
                  name="number"
                  type="text"
                  className="form-input"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>
            <p className="toggle-link">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setName('');
                  setNumber('');
                  setPassword('');
                }}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="form-title">Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Login'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
