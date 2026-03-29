// frontend/src/components/Stats/Stats.jsx
import React from 'react';

export const Stats = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Feedback</h3>
        <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Last 7 Days</h3>
        <div className="text-3xl font-bold text-gray-800">{stats.recentCount}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">By Type</h3>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Issues:</span>
            <span className="font-semibold text-gray-800">{stats.byType?.issue || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Improvements:</span>
            <span className="font-semibold text-gray-800">{stats.byType?.improvement || 0}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">By Status</h3>
        <div className="space-y-1">
          {Object.entries(stats.byStatus || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{status.replace('_', ' ')}:</span>
              <span className="font-semibold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};