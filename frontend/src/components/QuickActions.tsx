'use client';

import { Send, Bot, Bell, Shield, Settings, Download } from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface QuickActionsProps {
  messages: WhatsAppMessage[];
}

export function QuickActions({ messages }: QuickActionsProps) {
  const criticalCount = messages.filter(m => m.priority === 'critical').length;
  const pendingCount = messages.filter(m => m.status === 'pending').length;

  const actions = [
    {
      title: 'Send Broadcast',
      description: 'Send message to all users',
      icon: Send,
      color: 'blue',
      action: () => console.log('Send broadcast'),
    },
    {
      title: 'AI Auto-Reply',
      description: 'Enable smart responses',
      icon: Bot,
      color: 'purple',
      action: () => console.log('Enable auto-reply'),
    },
    {
      title: 'Alert Settings',
      description: `${criticalCount} critical alerts`,
      icon: Bell,
      color: 'red',
      action: () => console.log('Configure alerts'),
    },
    {
      title: 'Security Check',
      description: 'Run security scan',
      icon: Shield,
      color: 'green',
      action: () => console.log('Security scan'),
    },
    {
      title: 'Dashboard Config',
      description: 'Customize dashboard',
      icon: Settings,
      color: 'gray',
      action: () => console.log('Open settings'),
    },
    {
      title: 'Export Data',
      description: 'Download analytics',
      icon: Download,
      color: 'indigo',
      action: () => console.log('Export data'),
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
      red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
      gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700',
      indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        {pendingCount > 0 && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingCount} Pending
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs opacity-80 truncate">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last action: 2 min ago</span>
          <span>System status: Active</span>
        </div>
      </div>
    </div>
  );
}