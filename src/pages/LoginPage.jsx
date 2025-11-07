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
  const { login, loading, error } = useAuth();
  
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
      
      // Redirect based on user role - normalize role checks to support both string and object shapes
      const hasRole = (r) => {
        if (!userData?.roles) return false;
        const normalize = (x) => (x || '').toString().toUpperCase().replace(/^ROLE_/, '');
        const target = normalize(r);
        return userData.roles.some(role => normalize(typeof role === 'string' ? role : role.name) === target);
      };

      if (hasRole('STAFF')) {
        navigate(ROUTES.ATTENDANCE);
      } else if (hasRole('BARISTA')) {
        navigate(ROUTES.ORDERS);
      } else if (hasRole('FINANCE')) {
        navigate(ROUTES.FINANCE);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
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
