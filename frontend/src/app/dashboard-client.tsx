'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Brain,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Search,
  Filter,
  ArrowLeft,
  Bell,
  Settings,
  Activity,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Mock data for ultra-modern dashboard
const mockMessages = [
  {
    id: '1',
    from: '1234567890',
    to: '0987654321',
    body: 'This is urgent! My order was supposed to be delivered yesterday and I haven\'t received it yet!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'text',
    priority: 'critical',
    category: 'complaint',
    status: 'pending',
    classification: {
      priority: { level: 'critical', confidence: 0.95, reasoning: 'Urgent delivery complaint' },
      category: { type: 'complaint', confidence: 0.90, reasoning: 'Customer expressing dissatisfaction' },
      sentiment: { score: -0.8, label: 'negative' },
      urgency: true,
      keywords: ['urgent', 'order', 'delivery', 'yesterday']
    }
  },
  {
    id: '2',
    from: '2345678901',
    to: '0987654321',
    body: 'Hi, I\'m interested in your enterprise package for my company. We have about 200 employees.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'text',
    priority: 'high',
    category: 'lead',
    status: 'pending',
    classification: {
      priority: { level: 'high', confidence: 0.85, reasoning: 'Large enterprise lead' },
      category: { type: 'lead', confidence: 0.88, reasoning: 'Sales inquiry for enterprise package' },
      sentiment: { score: 0.2, label: 'positive' },
      urgency: false,
      keywords: ['enterprise', 'package', 'company', '200 employees']
    }
  },
  {
    id: '3',
    from: '3456789012',
    to: '0987654321',
    body: 'How do I reset my password? I\'ve tried the forgot password link but not receiving emails.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text',
    priority: 'medium',
    category: 'support',
    status: 'processing',
    classification: {
      priority: { level: 'medium', confidence: 0.80, reasoning: 'Standard support request' },
      category: { type: 'support', confidence: 0.92, reasoning: 'Technical help request' },
      sentiment: { score: -0.1, label: 'neutral' },
      urgency: false,
      keywords: ['reset', 'password', 'forgot', 'emails']
    }
  },
  {
    id: '4',
    from: '4567890123',
    to: '0987654321',
    body: 'Thank you for the excellent service! Just wanted to let you know how happy I am.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'text',
    priority: 'low',
    category: 'general',
    status: 'replied',
    classification: {
      priority: { level: 'low', confidence: 0.75, reasoning: 'Positive feedback message' },
      category: { type: 'general', confidence: 0.85, reasoning: 'Customer appreciation' },
      sentiment: { score: 0.9, label: 'positive' },
      urgency: false,
      keywords: ['thank', 'excellent', 'service', 'happy']
    }
  }
];

export default function DashboardClient() {
  const [messages, setMessages] = useState(mockMessages);
  const [filteredMessages, setFilteredMessages] = useState(mockMessages);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Real-time message updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = {
        id: Date.now().toString(),
        from: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        to: '0987654321',
        body: `New message received at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        type: 'text',
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        category: ['general', 'support', 'complaint', 'lead'][Math.floor(Math.random() * 4)],
        status: 'pending',
        classification: {
          priority: { level: 'medium', confidence: 0.85, reasoning: 'Standard message' },
          category: { type: 'general', confidence: 0.80, reasoning: 'General inquiry' },
          sentiment: { score: 0.1, label: 'neutral' },
          urgency: false,
          keywords: ['message', 'new']
        }
      };

      setMessages(prev => [newMessage, ...prev.slice(0, 19)]); // Keep only last 20 messages
    }, 15000); // New message every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(msg => msg.priority === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.from.includes(searchQuery)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, selectedFilter, searchQuery]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Zap className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Ultra Modern Header */}
      <header className="glass-intense sticky top-0 z-50 border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="glass p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text-cosmic">
                      WhatsApp Command Center
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="status-dot bg-green-400"></div>
                      <span className="text-sm text-gray-400">Real-time monitoring active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="glass px-4 py-2 rounded-xl">
                  <span className="text-sm font-semibold text-white">{messages.length}</span>
                  <span className="text-xs text-gray-400 ml-1">Total</span>
                </div>
                <div className="glass px-4 py-2 rounded-xl">
                  <span className="text-sm font-semibold text-emerald-400">{filteredMessages.length}</span>
                  <span className="text-xs text-gray-400 ml-1">Filtered</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="glass p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <Bell className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </button>
              <button className="glass p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Critical Messages */}
          <div className="glass card-hover p-6 relative overflow-hidden group animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                  Urgent
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {messages.filter(m => m.priority === 'critical').length}
              </h3>
              <p className="text-gray-400 text-sm font-medium">Critical Messages</p>
            </div>
          </div>

          {/* AI Accuracy */}
          <div className="glass card-hover p-6 relative overflow-hidden group animate-slide-in-left" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                  +2.3%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">98.7%</h3>
              <p className="text-gray-400 text-sm font-medium">AI Accuracy</p>
            </div>
          </div>

          {/* Response Time */}
          <div className="glass card-hover p-6 relative overflow-hidden group animate-slide-in-left" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                  -12ms
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">847ms</h3>
              <p className="text-gray-400 text-sm font-medium">Avg Response</p>
            </div>
          </div>

          {/* Active Users */}
          <div className="glass card-hover p-6 relative overflow-hidden group animate-slide-in-left" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  +15
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {new Set(messages.map(m => m.from)).size}
              </h3>
              <p className="text-gray-400 text-sm font-medium">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Controls and Filters */}
      <section className="px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus-modern transition-all duration-300"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Priority:</span>
            </div>
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Messages Grid */}
      <section className="px-8 pb-8">
        <div className="glass-intense rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Live Message Stream
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Live monitoring</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No messages found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredMessages.map((message, index) => (
                  <div
                    key={message.id}
                    className="p-6 hover:bg-white/5 transition-all duration-300 group animate-slide-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getPriorityColor(message.priority)} text-white shadow-lg`}>
                        {getPriorityIcon(message.priority)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">{message.from}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.priority === 'critical' ? 'priority-critical' :
                              message.priority === 'high' ? 'priority-high' :
                              message.priority === 'medium' ? 'priority-medium' :
                              'priority-low'
                            }`}>
                              {message.priority}
                            </span>
                            <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                              {message.category}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-gray-300 mb-3 leading-relaxed">{message.body}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs text-gray-400">
                                {Math.round(message.classification.priority.confidence * 100)}% confidence
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-gray-400">
                                {message.classification.category.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button className="glass px-3 py-1 rounded-lg text-xs text-white hover:bg-white/10 transition-all duration-300">
                              Reply
                            </button>
                            <button className="glass px-3 py-1 rounded-lg text-xs text-white hover:bg-white/10 transition-all duration-300">
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}