'use client';

import { PieChart, TrendingUp, Clock, Target } from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface MessageAnalyticsProps {
  messages: WhatsAppMessage[];
}

export function MessageAnalytics({ messages }: MessageAnalyticsProps) {
  const totalMessages = messages.length;
  const hourlyData = [12, 19, 8, 15, 22, 7, 18, 25, 12, 16, 9, 14];
  const maxHourly = Math.max(...hourlyData);

  const priorityStats = {
    critical: messages.filter(m => m.priority === 'critical').length,
    high: messages.filter(m => m.priority === 'high').length,
    medium: messages.filter(m => m.priority === 'medium').length,
    low: messages.filter(m => m.priority === 'low').length,
  };

  const responseMetrics = [
    { label: 'Avg Response Time', value: '1.5h', color: 'blue' },
    { label: 'SLA Compliance', value: '96%', color: 'green' },
    { label: 'Auto-resolved', value: '67%', color: 'purple' },
    { label: 'Escalated', value: '8%', color: 'red' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <PieChart className="h-6 w-6 mr-2 text-blue-600" />
          Analytics
        </h2>
      </div>

      {/* Priority Distribution */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Priority Distribution</h3>
        <div className="space-y-2">
          {Object.entries(priorityStats).map(([priority, count]) => {
            const percentage = totalMessages > 0 ? (count / totalMessages) * 100 : 0;
            const colors = {
              critical: 'bg-red-500',
              high: 'bg-orange-500',
              medium: 'bg-yellow-500',
              low: 'bg-green-500',
            };
            return (
              <div key={priority} className="flex items-center space-x-3">
                <div className="w-12 text-xs font-medium text-gray-600 capitalize">{priority}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`h-full ${colors[priority as keyof typeof colors]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-8 text-xs font-bold text-gray-800">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Hourly Activity
        </h3>
        <div className="flex items-end justify-between h-16 space-x-1">
          {hourlyData.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                style={{ height: `${(value / maxHourly) * 100}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Target className="h-4 w-4 mr-1" />
          Performance
        </h3>
        <div className="space-y-3">
          {responseMetrics.map((metric, index) => {
            const colors = {
              blue: 'text-blue-600 bg-blue-50',
              green: 'text-green-600 bg-green-50',
              purple: 'text-purple-600 bg-purple-50',
              red: 'text-red-600 bg-red-50',
            };
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{metric.label}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors[metric.color as keyof typeof colors]}`}>
                  {metric.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12% vs last week
          </span>
          <span>Updated now</span>
        </div>
      </div>
    </div>
  );
}