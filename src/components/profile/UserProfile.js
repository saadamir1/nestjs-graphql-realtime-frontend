import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#dc3545';
      case 'user':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        </div>
        <div className="profile-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p className="profile-email">{user.email}</p>
          <span 
            className="profile-role"
            style={{ backgroundColor: getRoleColor(user.role) }}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Information
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <div className="tab-content">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  <span>{user.firstName}</span>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <span>{user.lastName}</span>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <span className="role-badge" style={{ color: getRoleColor(user.role) }}>
                    {user.role}
                  </span>
                </div>
                <div className="info-item">
                  <label>User ID</label>
                  <span>#{user.id}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Account Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">🔔</div>
                  <div className="stat-info">
                    <span className="stat-label">Notifications</span>
                    <span className="stat-note">Check notification center</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <span className="stat-label">Chat Rooms</span>
                    <span className="stat-note">Active conversations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Email Notifications</label>
                  <p>Receive notifications via email</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Real-time Updates</label>
                  <p>Show live notifications and messages</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Sound Notifications</label>
                  <p>Play sound for new messages</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Display</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Theme</label>
                  <p>Choose your preferred theme</p>
                </div>
                <div className="setting-control">
                  <select className="theme-select">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-content">
            <div className="security-section">
              <h3>Account Security</h3>
              
              <div className="security-item">
                <div className="security-info">
                  <h4>Password</h4>
                  <p>Last changed: Not available</p>
                </div>
                <button className="security-button">
                  Change Password
                </button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="security-button secondary">
                  Enable 2FA
                </button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Active Sessions</h4>
                  <p>Manage your active login sessions</p>
                </div>
                <button className="security-button secondary">
                  View Sessions
                </button>
              </div>
            </div>

            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-item">
                <div className="danger-info">
                  <h4>Logout</h4>
                  <p>Sign out of your account on this device</p>
                </div>
                <button className="danger-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;