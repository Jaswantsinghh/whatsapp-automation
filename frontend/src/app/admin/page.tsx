'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string | null;
}

interface MessageType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface UserPermission {
  messageTypeId: string;
  canView: boolean;
  canReply: boolean;
  canAssign: boolean;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'messageTypes'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const router = useRouter();

  // Check authentication and admin role
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setCurrentUser(user);
    loadData(token);
  }, [router]);

  const loadData = async (token: string) => {
    setIsLoading(true);
    try {
      const [usersResponse, messageTypesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('http://localhost:3001/api/message-types', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      ]);

      const [usersData, messageTypesData] = await Promise.all([
        usersResponse.json(),
        messageTypesResponse.json()
      ]);

      if (usersData.success) {
        setUsers(usersData.data.users);
      }

      if (messageTypesData.success) {
        setMessageTypes(messageTypesData.data.messageTypes);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const createMessageType = async (name: string, description: string, color: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/message-types', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, description, color }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageTypes(prev => [...prev, data.data.messageType]);
      } else {
        setError(data.error || 'Failed to create message type');
      }
    } catch (err) {
      setError('Failed to create message type');
    }
  };

  const updateUserPermissions = async (userId: string, permissions: UserPermission[]) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/auth/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedUser(null);
        // Optionally reload users to show updated permissions
      } else {
        setError(data.error || 'Failed to update permissions');
      }
    } catch (err) {
      setError('Failed to update permissions');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage users and message types</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white/90">
              Welcome, <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-200 mt-2">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-blue-500/30 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('messageTypes')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'messageTypes'
                  ? 'bg-blue-500/30 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Message Types
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Last Active</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                          user.role === 'manager' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-white/70">
                        {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setUserPermissions([]);
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                        >
                          Manage Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Message Types Tab */}
        {activeTab === 'messageTypes' && (
          <div className="glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Message Types</h2>
              <button
                onClick={() => {
                  const name = prompt('Enter message type name:');
                  if (name) {
                    const description = prompt('Enter description (optional):') || '';
                    const color = prompt('Enter hex color (e.g., #3B82F6):') || '#3B82F6';
                    createMessageType(name, description, color);
                  }
                }}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-xl transition-all duration-200"
              >
                Add Message Type
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messageTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                  style={{ borderLeftColor: type.color, borderLeftWidth: '4px' }}
                >
                  <h3 className="text-white font-semibold mb-2">{type.name}</h3>
                  {type.description && (
                    <p className="text-white/70 text-sm mb-3">{type.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Permissions Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                Manage Permissions for {selectedUser.name}
              </h3>

              <div className="space-y-4">
                {messageTypes.map((type) => {
                  const permission = userPermissions.find(p => p.messageTypeId === type.id) || {
                    messageTypeId: type.id,
                    canView: false,
                    canReply: false,
                    canAssign: false,
                  };

                  return (
                    <div key={type.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <h4 className="text-white font-medium">{type.name}</h4>
                      </div>

                      <div className="space-y-2">
                        {(['canView', 'canReply', 'canAssign'] as const).map((perm) => (
                          <label key={perm} className="flex items-center text-white/80">
                            <input
                              type="checkbox"
                              checked={permission[perm]}
                              onChange={(e) => {
                                const updated = userPermissions.find(p => p.messageTypeId === type.id);
                                if (updated) {
                                  updated[perm] = e.target.checked;
                                  setUserPermissions([...userPermissions]);
                                } else {
                                  setUserPermissions([
                                    ...userPermissions,
                                    { ...permission, [perm]: e.target.checked }
                                  ]);
                                }
                              }}
                              className="mr-2 accent-blue-500"
                            />
                            {perm === 'canView' ? 'Can View' :
                             perm === 'canReply' ? 'Can Reply' : 'Can Assign'}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUserPermissions(selectedUser.id, userPermissions)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}