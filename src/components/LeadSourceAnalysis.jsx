import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LeadSourceAnalysis = () => {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('All');
  const [timeRange, setTimeRange] = useState('30d');
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scriptId = "AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA";

  useEffect(() => {
    fetchLeadSourceData();
  }, [timeRange]);

  const fetchLeadSourceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) throw new Error('User email not found. Please log in again.');

      const response = await fetch(
        `https://script.google.com/macros/s/${scriptId}/exec?action=getLeadSourceAnalysis&timeRange=${timeRange}&email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Failed to fetch lead source data');

      setSources(Array.isArray(data.sources) ? data.sources : []);
      setAiInsights(Array.isArray(data.insights) ? data.insights : []);
    } catch (err) {
      console.error('Error fetching lead source data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderInsightIcon = (type) => {
    switch(type) {
      case 'best_performer': return '🏆';
      case 'opportunity': return '🔍';
      case 'high_quality': return '⭐';
      case 'pricing_feedback': return '💰';
      case 'service_feedback': return '🛠️';
      default: return '💡';
    }
  };

  const filteredSources = selectedSource === 'All'
    ? sources
    : sources.filter(source => source.source === selectedSource);

  // FIX: remove stray dot + properly spread unique source names
  const sourceOptions = ['All', ...Array.from(new Set(sources.map(s => s.source)))];

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading lead source analysis.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Lead Source Analysis</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="p-2 border rounded"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            {sourceOptions.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow ${
                  insight.type === 'best_performer' ? 'bg-green-50 border-l-4 border-green-500' :
                  insight.type === 'opportunity' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                  'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{renderInsightIcon(insight.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {insight.source || 'General'}
                      {insight.conversionRate != null && ` (${insight.conversionRate}% conversion)`}
                      {insight.qualityScore != null && ` (${insight.qualityScore}/10)`}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate by Source */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Conversion Rate by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredSources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis label={{ value: 'Conversion %', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                <Legend />
                <Bar dataKey="conversionRate" fill="#8884d8" name="Conversion Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Quality Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Lead Quality by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="qualityScore"
                  nameKey="source"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {filteredSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [
                  `Quality: ${value}/10`,
                  `Source: ${name}`
                ]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Response Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSources.map((source, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.totalLeads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.conversionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.qualityScore}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.avgResponseTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadSourceAnalysis;
