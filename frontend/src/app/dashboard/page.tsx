'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
}

interface MessageType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
  canView: boolean;
  canReply: boolean;
  canAssign: boolean;
}

interface Message {
  id: string;
  from: string;
  body: string;
  messageType: string;
  priority: string;
  category: string;
  status: string;
  receivedAt: string;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);
    loadData(token);
  }, [router]);

  const loadData = async (token: string) => {
    setIsLoading(true);
    try {
      const [messageTypesResponse, messagesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/message-types/my-types', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('http://localhost:3001/api/messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      ]);

      const [messageTypesData, messagesData] = await Promise.all([
        messageTypesResponse.json(),
        messagesResponse.json()
      ]);

      if (messageTypesData.success) {
        setMessageTypes(messageTypesData.data.messageTypes);
      }

      if (messagesData.success) {
        setMessages(messagesData.data.messages || []);
        setFilteredMessages(messagesData.data.messages || []);
      }
    } catch (err) {
      setError('Failed to load data');
      // Use mock data for demo
      setMessageTypes([
        {
          id: '1',
          name: 'Support Requests',
          description: 'Customer support inquiries',
          color: '#3B82F6',
          isActive: true,
          canView: true,
          canReply: true,
          canAssign: false,
        },
        {
          id: '2',
          name: 'Complaints',
          description: 'Customer complaints',
          color: '#EF4444',
          isActive: true,
          canView: true,
          canReply: false,
          canAssign: false,
        },
      ]);

      setMessages([
        {
          id: '1',
          from: '+1234567890',
          body: 'I need help with my order #12345',
          messageType: 'Support Requests',
          priority: 'medium',
          category: 'support',
          status: 'pending',
          receivedAt: new Date().toISOString(),
        },
        {
          id: '2',
          from: '+1987654321',
          body: 'My delivery was late and the food was cold',
          messageType: 'Complaints',
          priority: 'high',
          category: 'complaint',
          status: 'pending',
          receivedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);

      setFilteredMessages([
        {
          id: '1',
          from: '+1234567890',
          body: 'I need help with my order #12345',
          messageType: 'Support Requests',
          priority: 'medium',
          category: 'support',
          status: 'pending',
          receivedAt: new Date().toISOString(),
        },
        {
          id: '2',
          from: '+1987654321',
          body: 'My delivery was late and the food was cold',
          messageType: 'Complaints',
          priority: 'high',
          category: 'complaint',
          status: 'pending',
          receivedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on selected criteria
  useEffect(() => {
    let filtered = messages;

    if (selectedMessageType !== 'all') {
      filtered = filtered.filter(msg => msg.messageType === selectedMessageType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(msg => msg.priority === selectedPriority);
    }

    setFilteredMessages(filtered);
  }, [messages, selectedMessageType, selectedPriority]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-300 bg-red-500/20';
      case 'high': return 'text-orange-300 bg-orange-500/20';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20';
      case 'low': return 'text-green-300 bg-green-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-300 bg-green-500/20';
      case 'processing': return 'text-blue-300 bg-blue-500/20';
      case 'replied': return 'text-purple-300 bg-purple-500/20';
      case 'pending': return 'text-orange-300 bg-orange-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">Manage your assigned messages</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white/90">
              Welcome, <span className="font-semibold">{currentUser?.name}</span>
            </div>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-xl transition-all duration-200"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300">Demo Mode: {error}</p>
            <p className="text-yellow-200 text-sm mt-1">Using mock data for demonstration</p>
          </div>
        )}

        {/* Message Type Permissions */}
        <div className="mb-8 glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Message Type Access</h2>
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
                <div className="flex flex-wrap gap-2">
                  {type.canView && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      View
                    </span>
                  )}
                  {type.canReply && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      Reply
                    </span>
                  )}
                  {type.canAssign && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      Assign
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Message Type</label>
              <select
                value={selectedMessageType}
                onChange={(e) => setSelectedMessageType(e.target.value)}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {messageTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="glassmorphic-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Messages ({filteredMessages.length})</h2>

          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl">No messages found</p>
              <p className="mt-2">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => {
                const messageType = messageTypes.find(t => t.name === message.messageType);

                return (
                  <div
                    key={message.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: messageType?.color || '#3B82F6' }}
                        ></div>
                        <div>
                          <p className="text-white font-medium">{message.from}</p>
                          <p className="text-white/60 text-sm">{message.messageType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">
                          {new Date(message.receivedAt).toLocaleString()}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-white/90 mb-4">{message.body}</p>

                    <div className="flex justify-between items-center">
                      <div className="text-white/60 text-sm">
                        Category: {message.category}
                      </div>
                      <div className="flex space-x-2">
                        {messageType?.canReply && (
                          <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-sm transition-all duration-200">
                            Reply
                          </button>
                        )}
                        {messageType?.canAssign && (
                          <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-sm transition-all duration-200">
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}