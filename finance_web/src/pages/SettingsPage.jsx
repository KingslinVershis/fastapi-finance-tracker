import React, { useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileSaving(true);
    try {
      await api.updateProfile({ full_name: fullName.trim() });
      await refreshUser();
      setProfileMessage('Profile details successfully updated.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordMessage('Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="content-body">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Settings &amp; Security</h2>
          <p className="page-subtitle">Manage your profile credentials and security preferences</p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Profile Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title with-icon">
              <User size={18} /> User Profile
            </h3>
          </div>

          {profileMessage && (
            <div className="alert-banner success">
              <CheckCircle2 size={16} /> {profileMessage}
            </div>
          )}
          {profileError && <div className="alert-banner error">{profileError}</div>}

          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Created</label>
              <p className="settings-created-text">
                {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>

            <button type="submit" disabled={profileSaving} className="btn btn-primary">
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title with-icon">
              <Lock size={18} /> Change Password
            </h3>
          </div>

          {passwordMessage && (
            <div className="alert-banner success">
              <CheckCircle2 size={16} /> {passwordMessage}
            </div>
          )}
          {passwordError && <div className="alert-banner error">{passwordError}</div>}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (Min. 8 characters)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={passwordSaving} className="btn btn-secondary">
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
