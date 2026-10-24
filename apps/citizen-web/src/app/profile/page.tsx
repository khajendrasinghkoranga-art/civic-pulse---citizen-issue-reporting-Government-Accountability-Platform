'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Navbar from '@/components/layout/Navbar';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setProfileLoading(true);
    try {
      await apiClient.patch('/users/me', { name, phone: phone || undefined });
      await refreshUser();
      setProfileMsg('Profile updated successfully!');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('Password changed successfully!');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="page-header">
            <h1 className="page-title">👤 My Profile</h1>
            <p className="page-subtitle">Manage your account settings</p>
          </div>

          {/* Profile Card */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              <div className="avatar avatar-lg" style={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                  {user?.isVerified && (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-500)' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Edit Profile</h3>

            {profileMsg && <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}><span>✅</span><span>{profileMsg}</span></div>}
            {profileError && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}><span>⚠️</span><span>{profileError}</span></div>}

            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input id="profile-name" type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email (Cannot be changed)</label>
                <input id="profile-email" type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                <input id="profile-phone" type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ marginTop: 'var(--space-md)' }}>
                {profileLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Saving...</> : '💾 Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>🔒 Change Password</h3>

            {passwordMsg && <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}><span>✅</span><span>{passwordMsg}</span></div>}
            {passwordError && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}><span>⚠️</span><span>{passwordError}</span></div>}

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-pw">Current Password</label>
                <input id="current-pw" type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-pw">New Password</label>
                  <input id="new-pw" type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-pw">Confirm Password</label>
                  <input id="confirm-pw" type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={passwordLoading} style={{ marginTop: 'var(--space-md)' }}>
                {passwordLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Changing...</> : '🔑 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
