import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import { formatDate } from '../utils/formatters.jsx';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert('Password change functionality will be implemented');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="settings-grid">
        <Card title="Profile Information">
          <div className="profile-info">
            <div className="info-row">
              <label>Username</label>
              <span>{user?.username || 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Roles</label>
              <div className="roles-list">
                {user?.roles?.map((role) => (
                  <span key={role.id} className="role-badge">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="info-row">
              <label>Last Login</label>
              <span>{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </Card>

        <Card title="Change Password">
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={errors.currentPassword ? 'error' : ''}
              />
              {errors.currentPassword && (
                <span className="error-message">{errors.currentPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={errors.newPassword ? 'error' : ''}
              />
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </form>
        </Card>

        <Card title="Application Preferences">
          <div className="preferences">
            <div className="preference-item">
              <div className="preference-info">
                <strong>Theme</strong>
                <p>Dark mode is currently active</p>
              </div>
              <Button variant="secondary" size="small">Change Theme</Button>
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <strong>Notifications</strong>
                <p>Receive system notifications</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
