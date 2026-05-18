import React, { useEffect, useState } from 'react';
import { Settings as SettingsType, User, Role } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import { Save, Building, Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { backendApi } from '../services/backendApi';
import { syncBackendToStorage } from '../services/storageSync';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'users'>('company');
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadData();
  }, [currentUser?.role]);

  const loadData = async () => {
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rolesData = localStorage.getItem(STORAGE_KEYS.ROLES);

    if (settingsData) setSettings(JSON.parse(settingsData));
    if (rolesData) setRoles(JSON.parse(rolesData));

    if (String(currentUser?.role || '').toLowerCase() === 'admin') {
      try {
        await syncBackendToStorage({
          includeUsers: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync users.';
        toast.error(message);
      }
    }

    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    if (usersData) {
      setUsers(JSON.parse(usersData));
    } else {
      setUsers([]);
    }
  };

  const handleSaveSettings = () => {
    if (settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      toast.success('Settings saved successfully');
    }
  };

  // User Management Functions
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      status: 'active',
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      status: user.status,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        await backendApi.updateUser(editingUser.id, {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          role: String(editingUser.role || editingUser.roleId || 'viewer').toLowerCase() as
            | 'admin'
            | 'manager'
            | 'viewer',
          status: userForm.status,
        });
        toast.success('User updated successfully');
      } else {
        await backendApi.createUser({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: 'ChangeMe123',
          role: 'viewer',
          status: userForm.status,
        });
        toast.success('User created successfully. Default password: ChangeMe123');
      }

      await loadData();
      setShowUserModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save user.';
      toast.error(message);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Delete user "${user.name}"?`)) {
      try {
        await backendApi.deleteUser(user.id);
        toast.success('User deleted successfully');
        await loadData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user.';
        toast.error(message);
      }
    }
  };

  const displayedUsers = users.filter((user) => user.id !== currentUser?.id);

  if (!settings) return <div className="p-4" style={{ color: colors.text.primary }}>Loading...</div>;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1900px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1" style={{ color: colors.text.primary, fontWeight: 600 }}>Settings</h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>Configure application settings</p>
          </div>
          {activeTab === 'company' && (
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-sm text-sm"
              style={{
                backgroundColor: colors.accent.gold,
                color: '#FFFFFF',
              }}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <button
            onClick={() => setActiveTab('company')}
            className="flex items-center gap-2 px-4 py-2 transition text-sm"
            style={{
              borderBottom: activeTab === 'company' ? `2px solid ${colors.accent.gold}` : 'none',
              color: activeTab === 'company' ? colors.accent.gold : colors.text.secondary,
              fontWeight: activeTab === 'company' ? 600 : 400,
            }}
          >
            <Building className="w-4 h-4" />
            Company Settings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2 px-4 py-2 transition text-sm"
            style={{
              borderBottom: activeTab === 'users' ? `2px solid ${colors.accent.gold}` : 'none',
              color: activeTab === 'users' ? colors.accent.gold : colors.text.secondary,
              fontWeight: activeTab === 'users' ? 600 : 400,
            }}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
        </div>

        {/* Company Settings Tab */}
        {activeTab === 'company' && (
          <div className="max-w-4xl">
            <div className="rounded-lg shadow-sm p-4 space-y-4" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div>
                <h2 className="text-base mb-3" style={{ color: colors.text.primary, fontWeight: 600 }}>Company Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Address</label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t" style={{ borderColor: colors.border }}>
                <h2 className="text-base mb-3" style={{ color: colors.text.primary, fontWeight: 600 }}>PDF Defaults</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Default Header</label>
                    <input
                      type="text"
                      value={settings.defaultPdfHeader}
                      onChange={(e) => setSettings({ ...settings, defaultPdfHeader: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Default Footer</label>
                    <input
                      type="text"
                      value={settings.defaultPdfFooter}
                      onChange={(e) => setSettings({ ...settings, defaultPdfFooter: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Theme Color</label>
                    <input
                      type="color"
                      value={settings.defaultThemeColor}
                      onChange={(e) => setSettings({ ...settings, defaultThemeColor: e.target.value })}
                      className="w-full h-10 px-2 py-1 rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Currency</label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base" style={{ color: colors.text.primary, fontWeight: 600 }}>Users</h2>
              <button
                onClick={handleCreateUser}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition shadow-sm text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

                <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <table className="w-full">
                    <thead style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
                      <tr>
                        <th className="text-left px-3 py-2 text-xs" style={{ color: colors.text.secondary, fontWeight: 600 }}>Name</th>
                        <th className="text-left px-3 py-2 text-xs" style={{ color: colors.text.secondary, fontWeight: 600 }}>Email</th>
                        <th className="text-left px-3 py-2 text-xs" style={{ color: colors.text.secondary, fontWeight: 600 }}>Status</th>
                        <th className="text-right px-3 py-2 text-xs" style={{ color: colors.text.secondary, fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((user, index) => (
                        <tr key={user.id} style={{ borderBottom: index < displayedUsers.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                          <td className="px-3 py-2 text-sm" style={{ color: colors.text.primary }}>{user.name}</td>
                          <td className="px-3 py-2 text-sm" style={{ color: colors.text.secondary }}>{user.email}</td>
                          <td className="px-3 py-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{
                                backgroundColor: user.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                                color: user.status === 'active' ? '#15803d' : '#DC2626',
                                fontSize: '10px',
                              }}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 rounded transition"
                              style={{ color: colors.text.secondary }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 rounded transition ml-1"
                              style={{ color: '#DC2626' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            style={{ backgroundColor: colors.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b flex items-center justify-between sticky top-0" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <h3 className="text-base" style={{ color: colors.text.primary, fontWeight: 600 }}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 rounded-lg transition"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Status *</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-3 border-t flex justify-end gap-2" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setShowUserModal(false)}
                className="px-3 py-1.5 rounded-lg transition text-sm"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-3 py-1.5 rounded-lg transition text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
