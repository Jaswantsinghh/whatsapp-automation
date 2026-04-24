'use client';

import { Clock, MessageCircle, Brain, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface ActivityFeedProps {
  messages: WhatsAppMessage[];
}

export function ActivityFeed({ messages }: ActivityFeedProps) {
  const activities = [
    {
      type: 'message',
      title: 'New critical message received',
      description: 'Order delivery complaint from customer',
      time: '2 min ago',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      type: 'ai',
      title: 'AI Classification completed',
      description: '4 messages processed with 95% confidence',
      time: '5 min ago',
      icon: Brain,
      color: 'purple',
    },
    {
      type: 'reply',
      title: 'Auto-reply sent',
      description: 'Password reset assistance provided',
      time: '8 min ago',
      icon: CheckCircle,
      color: 'green',
    },
    {
      type: 'message',
      title: 'Enterprise lead detected',
      description: '200-employee company inquiry',
      time: '12 min ago',
      icon: User,
      color: 'blue',
    },
    {
      type: 'system',
      title: 'Dashboard refresh',
      description: 'Real-time data synchronized',
      time: '15 min ago',
      icon: Clock,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full ${getColorClasses(activity.color)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{activity.title}</h4>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{activity.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
}