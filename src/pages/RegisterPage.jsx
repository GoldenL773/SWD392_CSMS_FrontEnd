import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi.jsx';
import Button from '../components/common/Button/index.jsx';
import { ROUTES, ROLES } from '../utils/constants.jsx';
import './RegisterPage.css';

/**
 * RegisterPage Component
 * New user registration page
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    roles: ['ROLE_STAFF']
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      setFormData({
        ...formData,
        roles: [value]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Prepare request data matching Backend RegisterRequest
      const registerData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        roles: formData.roles
      };

      await register(registerData);
      setSuccess(true);
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-logo">CSMS</h1>
          <p className="register-subtitle">Create New Account</p>
        </div>

        {success ? (
          <div className="register-success">
            Registration successful! Redirecting to login...
          </div>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="roles">Initial Role</label>
              <select
                id="roles"
                name="roles"
                value={formData.roles[0]}
                onChange={handleChange}
              >
                <option value="ROLE_STAFF">Staff</option>
                <option value="ROLE_BARISTA">Barista</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              Register Account
            </Button>

            <div className="register-footer">
              Already have an account? <Link to={ROUTES.LOGIN}>Login here</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
