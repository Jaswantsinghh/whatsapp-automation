'use client';

import { Brain, TrendingUp, AlertCircle, Users, Clock, Target } from 'lucide-react';
import { WhatsAppMessage } from '../../../shared/types';

interface AISummaryMetricsProps {
  messages: WhatsAppMessage[];
}

export function AISummaryMetrics({ messages }: AISummaryMetricsProps) {
  // Calculate AI metrics
  const totalMessages = messages.length;
  const criticalMessages = messages.filter(m => m.priority === 'critical').length;
  const urgentMessages = messages.filter(m => m.classification?.urgency).length;
  const averageConfidence = messages.reduce((acc, msg) =>
    acc + (msg.classification?.priority.confidence || 0), 0) / totalMessages;

  // Sentiment analysis
  const sentimentScores = messages.map(m => m.classification?.sentiment.score || 0);
  const averageSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
  const positiveMessages = messages.filter(m => (m.classification?.sentiment.score || 0) > 0.1).length;
  const negativeMessages = messages.filter(m => (m.classification?.sentiment.score || 0) < -0.1).length;

  // Category breakdown
  const categories = messages.reduce((acc, msg) => {
    acc[msg.category] = (acc[msg.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Response time analysis (simulated)
  const averageResponseTime = 1.5; // hours
  const slaCompliance = 85; // percentage

  // AI insights
  const insights = [
    `${Math.round(averageConfidence * 100)}% average AI classification confidence`,
    `${criticalMessages} critical issues requiring immediate attention`,
    `${urgentMessages} messages flagged as urgent by AI`,
    `${Math.round(slaCompliance)}% SLA compliance rate`,
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Intelligence Center</h2>
              <p className="text-purple-100 text-sm font-medium">Real-time analysis & automated insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">AI Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* Enhanced Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI Confidence with Progress Circle */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-1">AI Confidence</p>
                <p className="text-3xl font-bold text-purple-900">{Math.round(averageConfidence * 100)}%</p>
                <div className="flex items-center mt-2">
                  <div className="w-20 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round(averageConfidence * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-purple-600 ml-2 font-medium">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Enhanced Sentiment Score */}
          <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${
            averageSentiment > 0
              ? 'bg-gradient-to-br from-green-50 via-white to-green-50 border-green-100'
              : 'bg-gradient-to-br from-red-50 via-white to-red-50 border-red-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${
                  averageSentiment > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Avg. Sentiment
                </p>
                <p className={`text-3xl font-bold ${
                  averageSentiment > 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {averageSentiment > 0 ? '+' : ''}{averageSentiment.toFixed(2)}
                </p>
                <div className="flex items-center mt-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    averageSentiment > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {averageSentiment > 0 ? 'Positive' : 'Negative'}
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${
                averageSentiment > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`h-8 w-8 ${
                  averageSentiment > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Enhanced Response Time */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Avg. Response Time</p>
                <p className="text-3xl font-bold text-blue-900">{averageResponseTime}h</p>
                <div className="flex items-center mt-2">
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Within SLA
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Insights */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 mr-2 text-amber-600" />
            AI Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 hover:border-amber-300 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">{insight}</p>
                    <div className="flex items-center mt-2">
                      <div className="h-1 w-16 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs text-amber-700 ml-2">Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Sentiment Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Distribution</h3>
          <div className="grid grid-cols-3 gap-6">
            {/* Positive Sentiment */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-green-700">{positiveMessages}</div>
                </div>
                <div className="text-lg font-bold text-green-900 mb-1">Positive</div>
                <div className="text-sm text-green-700 mb-3">{Math.round(positiveMessages/totalMessages*100)}% of total</div>
                <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round(positiveMessages/totalMessages*100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Neutral Sentiment */}
            <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-gray-700">{totalMessages - positiveMessages - negativeMessages}</div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">Neutral</div>
                <div className="text-sm text-gray-700 mb-3">{Math.round((totalMessages - positiveMessages - negativeMessages)/totalMessages*100)}% of total</div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round((totalMessages - positiveMessages - negativeMessages)/totalMessages*100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Negative Sentiment */}
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100 p-6 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-red-700">{negativeMessages}</div>
                </div>
                <div className="text-lg font-bold text-red-900 mb-1">Negative</div>
                <div className="text-sm text-red-700 mb-3">{Math.round(negativeMessages/totalMessages*100)}% of total</div>
                <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round(negativeMessages/totalMessages*100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Category Performance */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600" />
            Category Performance
          </h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, count]) => {
              const percentage = Math.round(count/totalMessages*100);
              const colorMap = {
                complaint: { bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-900', light: 'bg-red-50' },
                lead: { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-900', light: 'bg-green-50' },
                support: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-900', light: 'bg-blue-50' },
                general: { bg: 'bg-gray-500', border: 'border-gray-200', text: 'text-gray-900', light: 'bg-gray-50' },
              };
              const colors = colorMap[category as keyof typeof colorMap] || colorMap.general;

              return (
                <div key={category} className={`p-4 rounded-2xl border ${colors.border} ${colors.light} hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`h-4 w-4 rounded-full ${colors.bg}`}></div>
                      <span className={`text-lg font-bold capitalize ${colors.text}`}>{category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.text} bg-white`}>
                        {count} messages
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.text} bg-white`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">GPT-4o Engine</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Classification Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}