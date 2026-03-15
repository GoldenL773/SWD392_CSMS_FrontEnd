import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Button from '../components/common/Button/index.jsx';
import { ROUTES } from '../utils/constants.jsx';
import './LoginPage.css';

/**
 * LoginPage Component
 * User authentication page
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, user, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated() && user) {
      // Navigate to dashboard after login
      navigate(ROUTES.DASHBOARD);
    }
  }, [user, isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const userData = await login(formData.username, formData.password);
      
      // Navigate to dashboard after login
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-logo">CSMS</h1>
          <p className="login-subtitle">Coffee Shop Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {(loginError || error) && (
            <div className="login-error">
              {loginError || error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            Login
          </Button>

       
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
