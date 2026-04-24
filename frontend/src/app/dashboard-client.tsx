'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket.tsx';
import { MessageList } from '@/components/MessageList';
import { DashboardStats } from '@/components/DashboardStats';
import { MessageFilters } from '@/components/MessageFilters';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { WhatsAppMessage } from '../../../shared/types';

interface DashboardClientProps {
  initialMessages: WhatsAppMessage[];
}

export function DashboardClient({ initialMessages }: DashboardClientProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<WhatsAppMessage[]>(initialMessages);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>(initialMessages);
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: '',
    search: '',
  });

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                WhatsApp Dashboard
              </h1>
              <RealtimeIndicator isConnected={isConnected} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {messages.length} total messages
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredMessages.length} filtered
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <DashboardStats messages={messages} />
            <MessageFilters
              filters={filters}
              onFiltersChange={setFilters}
              messageCount={filteredMessages.length}
            />
          </div>

          {/* Main Content - Message List */}
          <div className="lg:col-span-3">
            <MessageList
              messages={filteredMessages}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}