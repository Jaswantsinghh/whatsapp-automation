'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface MessageFiltersProps {
  filters: {
    priority: string;
    category: string;
    status: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  messageCount: number;
}

export function MessageFilters({ filters, onFiltersChange, messageCount }: MessageFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'complaint', label: 'Complaints' },
    { value: 'lead', label: 'Leads' },
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'general', label: 'General' },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'replied', label: 'Replied' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priority: '',
      category: '',
      status: '',
      search: '',
    });
  };

  const hasActiveFilters = filters.priority || filters.category || filters.status || filters.search;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('status', 'pending')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => updateFilter('priority', 'critical')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.priority === 'critical'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => updateFilter('category', 'complaint')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.category === 'complaint'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            Complaints
          </button>
          <button
            onClick={() => updateFilter('category', 'lead')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.category === 'lead'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            Leads
          </button>
        </div>

        {/* Detailed Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results and Clear */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">
            {messageCount} message{messageCount !== 1 ? 's' : ''} found
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}