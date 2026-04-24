'use client';

import { MessageCircle, Clock, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface DashboardStatsProps {
  messages: WhatsAppMessage[];
}

export function DashboardStats({ messages }: DashboardStatsProps) {
  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'pending').length,
    processing: messages.filter(m => m.status === 'processing').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
    critical: messages.filter(m => m.priority === 'critical').length,
    high: messages.filter(m => m.priority === 'high').length,
    complaints: messages.filter(m => m.category === 'complaint').length,
    leads: messages.filter(m => m.category === 'lead').length,
  };

  const priorityPercentage = stats.total > 0 ? {
    critical: Math.round((stats.critical / stats.total) * 100),
    high: Math.round((stats.high / stats.total) * 100),
  } : { critical: 0, high: 0 };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Dashboard Overview
      </h2>

      <div className="space-y-4">
        {/* Total Messages */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Total Messages</span>
          </div>
          <span className="text-lg font-bold text-primary">{stats.total}</span>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Status</h3>

          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Pending</span>
            </div>
            <span className="text-sm font-bold text-yellow-800">{stats.pending}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm text-blue-800">Processing</span>
            </div>
            <span className="text-sm font-bold text-blue-800">{stats.processing}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Resolved</span>
            </div>
            <span className="text-sm font-bold text-green-800">{stats.resolved}</span>
          </div>
        </div>

        {/* Priority Alerts */}
        {(stats.critical > 0 || stats.high > 0) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Priority Alerts</h3>

            {stats.critical > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Critical</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-800">{stats.critical}</span>
                  <span className="text-xs text-red-600 ml-1">({priorityPercentage.critical}%)</span>
                </div>
              </div>
            )}

            {stats.high > 0 && (
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">High Priority</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-orange-800">{stats.high}</span>
                  <span className="text-xs text-orange-600 ml-1">({priorityPercentage.high}%)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Categories</h3>

          {stats.complaints > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
              <span className="text-sm text-red-800">Complaints</span>
              <span className="text-sm font-bold text-red-800">{stats.complaints}</span>
            </div>
          )}

          {stats.leads > 0 && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Leads</span>
              </div>
              <span className="text-sm font-bold text-green-800">{stats.leads}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-background border border-input rounded hover:bg-accent hover:text-accent-foreground transition-colors">
              View All Pending
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-background border border-input rounded hover:bg-accent hover:text-accent-foreground transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}