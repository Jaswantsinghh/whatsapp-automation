'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket.tsx';
import { MessageList } from '@/components/MessageList';
import { DashboardStats } from '@/components/DashboardStats';
import { MessageFilters } from '@/components/MessageFilters';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { AISummaryMetrics } from '@/components/AISummaryMetrics';
import { MessageAnalytics } from '@/components/MessageAnalytics';
import { QuickActions } from '@/components/QuickActions';
import { ActivityFeed } from '@/components/ActivityFeed';
import { WhatsAppMessage } from '../../../shared/types';
import { MessageSquare, Brain, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';

// Mock data to ensure dashboard shows content immediately
const mockMessages: WhatsAppMessage[] = [
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

export default function Dashboard() {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockMessages);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>(mockMessages);
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: '',
    search: '',
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/messages');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const convertedMessages = data.data.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }));
          setMessages(convertedMessages);
        }
      } catch (error) {
        console.log('Using mock data - API not available');
        // Keep using mock data if API fails
      }
    };

    fetchMessages();
  }, []);

  // Listen for real-time message updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: WhatsAppMessage) => {
      setMessages(prev => [message, ...prev]);
    };

    const handleMessageClassified = (update: any) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === update.id
            ? { ...msg, priority: update.priority, category: update.category, status: update.status }
            : msg
        )
      );
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-classified', handleMessageClassified);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-classified', handleMessageClassified);
    };
  }, [socket]);

  // Filter messages based on active filters
  useEffect(() => {
    let filtered = messages;

    if (filters.priority) {
      filtered = filtered.filter(msg => msg.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(msg => msg.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(msg => msg.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.body.toLowerCase().includes(searchLower) ||
        msg.from.includes(filters.search)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    WhatsApp Analytics Hub
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Real-time message intelligence & automation</p>
                </div>
              </div>
              <RealtimeIndicator isConnected={isConnected} />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 bg-gray-50/80 px-4 py-2 rounded-full border">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">{messages.length} Total</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">{filteredMessages.length} Filtered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Critical Messages</p>
                <p className="text-3xl font-bold">{messages.filter(m => m.priority === 'critical').length}</p>
              </div>
              <Zap className="h-8 w-8 text-red-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">AI Confidence</p>
                <p className="text-3xl font-bold">84%</p>
              </div>
              <Brain className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Response Rate</p>
                <p className="text-3xl font-bold">96%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">{new Set(messages.map(m => m.from)).size}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* AI Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* AI Summary - Takes up 2 columns */}
          <div className="xl:col-span-2">
            <AISummaryMetrics messages={messages} />
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <QuickActions messages={messages} />
            <ActivityFeed messages={messages} />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar - Enhanced Stats and Filters */}
          <div className="xl:col-span-1 space-y-6">
            <DashboardStats messages={messages} />
            <MessageFilters
              filters={filters}
              onFiltersChange={setFilters}
              messageCount={filteredMessages.length}
            />
            <MessageAnalytics messages={messages} />
          </div>

          {/* Main Content - Enhanced Message List */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Message Stream</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600">Live Updates</span>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <MessageList
                  messages={filteredMessages}
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}