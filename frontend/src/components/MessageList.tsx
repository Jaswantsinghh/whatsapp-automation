'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Clock,
  User,
  Zap,
  AlertTriangle,
  Reply,
  UserCheck,
  CheckCircle,
  Eye,
  MessageSquare,
  Bot,
  Brain,
  TrendingUp,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface MessageListProps {
  messages: WhatsAppMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
              {/* Header skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              </div>
              {/* Message body skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              {/* Tags skeleton */}
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
              {/* Actions skeleton */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-6">
            <MessageSquare className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Messages Yet</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your WhatsApp dashboard is ready! Messages will appear here as soon as they start coming in.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Monitoring for incoming messages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageCard
          key={message.id}
          message={message}
          index={index}
        />
      ))}
    </div>
  );
}

function MessageCard({ message, index }: { message: WhatsAppMessage; index: number }) {
  // Enhanced priority configuration
  const getPriorityConfig = (priority: string) => {
    const configs = {
      critical: {
        icon: <AlertTriangle className="h-5 w-5" />,
        bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
        textColor: 'text-white',
        borderColor: 'border-l-red-500',
        shadowColor: 'shadow-red-100',
        label: 'Critical',
        pulse: true
      },
      high: {
        icon: <Zap className="h-5 w-5" />,
        bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
        textColor: 'text-white',
        borderColor: 'border-l-orange-500',
        shadowColor: 'shadow-orange-100',
        label: 'High',
        pulse: false
      },
      medium: {
        icon: <Clock className="h-5 w-5" />,
        bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        textColor: 'text-white',
        borderColor: 'border-l-yellow-500',
        shadowColor: 'shadow-yellow-100',
        label: 'Medium',
        pulse: false
      },
      low: {
        icon: <CheckCircle className="h-5 w-5" />,
        bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
        textColor: 'text-white',
        borderColor: 'border-l-green-500',
        shadowColor: 'shadow-green-100',
        label: 'Low',
        pulse: false
      }
    };
    return configs[priority as keyof typeof configs] || configs.low;
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      complaint: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: <AlertTriangle className="h-4 w-4" /> },
      lead: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <TrendingUp className="h-4 w-4" /> },
      support: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', icon: <User className="h-4 w-4" /> },
      sales: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: <Star className="h-4 w-4" /> },
      general: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-800', icon: <MessageCircle className="h-4 w-4" /> }
    };
    return configs[category as keyof typeof configs] || configs.general;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: <Clock className="h-4 w-4" /> },
      processing: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <Bot className="h-4 w-4" /> },
      replied: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4" /> }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const priorityConfig = getPriorityConfig(message.priority);
  const categoryConfig = getCategoryConfig(message.category);
  const statusConfig = getStatusConfig(message.status);

  return (
    <div
      className={`bg-white border ${priorityConfig.borderColor} border-l-4 rounded-2xl ${priorityConfig.shadowColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards'
      }}
    >
      {/* Priority Header Bar */}
      <div className={`${priorityConfig.bgColor} ${priorityConfig.textColor} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-1 bg-white/20 rounded-lg ${priorityConfig.pulse ? 'animate-pulse' : ''}`}>
              {priorityConfig.icon}
            </div>
            <span className="font-bold text-sm uppercase tracking-wide">{priorityConfig.label} Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* User Information */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{message.from}</h3>
              <p className="text-gray-600 text-sm">WhatsApp Customer</p>
            </div>
          </div>

          {/* AI Confidence Score */}
          {message.classification?.priority.confidence && (
            <div className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">
                  {Math.round(message.classification.priority.confidence * 100)}% confident
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-800 leading-relaxed font-medium">{message.body}</p>
          </div>
        </div>

        {/* Enhanced Tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Category Tag */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm ${categoryConfig.bg} ${categoryConfig.text}`}>
            {categoryConfig.icon}
            <span className="capitalize">{message.category}</span>
          </div>

          {/* Status Tag */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.icon}
            <span className="capitalize">{message.status}</span>
          </div>

          {/* Message Type */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-800 font-semibold text-sm">
            <MessageCircle className="h-4 w-4" />
            <span className="capitalize">{message.type}</span>
          </div>

          {/* Urgency Indicator */}
          {message.classification?.urgency && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 bg-red-100 border-red-300 text-red-800 font-bold text-sm animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              <span>URGENT</span>
            </div>
          )}
        </div>

        {/* AI Insights */}
        {message.classification && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-indigo-700 font-medium">Sentiment: </span>
                <span className={`font-bold ${message.classification.sentiment.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {message.classification.sentiment.label} ({message.classification.sentiment.score.toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-indigo-700 font-medium">Keywords: </span>
                <span className="text-gray-800">{message.classification.keywords?.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-3">
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md">
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">
              <UserCheck className="h-4 w-4" />
              <span>Assign</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {message.status === 'pending' && (
              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md">
                <CheckCircle className="h-4 w-4" />
                <span>Resolve</span>
              </button>
            )}
            <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}