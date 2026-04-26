import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await authApi.updateProfile({ name: name.trim() });
      // Update local auth context
      login({ ...res.data, token: localStorage.getItem('token') });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.error || 'Password change failed' });
    } finally {
      setPassLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Profile Info', icon: HiOutlineUser },
    { id: 'password', label: 'Change Password', icon: HiOutlineLockClosed },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{user?.name || 'User'}</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              Active Account
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Update Profile</h2>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field opacity-60 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.userId || ''}
                  className="input-field opacity-60 cursor-not-allowed font-mono text-xs"
                  disabled
                />
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {profileMsg.type === 'success'
                    ? <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                    : <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />}
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" disabled={profileLoading} className="btn-primary w-full">
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Change Password</h2>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              {passMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  passMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {passMsg.type === 'success'
                    ? <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                    : <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />}
                  {passMsg.text}
                </div>
              )}

              <button type="submit" disabled={passLoading} className="btn-primary w-full">
                {passLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
