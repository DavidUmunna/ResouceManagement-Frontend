// frontend/src/components/FeedbackCard/FeedbackCard.jsx
import React, { useState } from 'react';
import { FeedbackStatus, STATUS_COLORS, STATUS_LABELS } from '../../constants/Feedback.constants.js';
export const FeedbackCard = ({ feedback, onStatusUpdate, onDelete, canManage = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      setIsDeleting(true);  
      try {
        await onDelete?.(feedback.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{feedback.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[feedback.status]}`}>
              {STATUS_LABELS[feedback.status]}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '...' : '🗑️'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3 text-sm">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
            {feedback.type}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
            {feedback.email}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
            {formatDate(feedback.createdAt)}
          </span>
          {feedback.priority && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
              Priority: {feedback.priority}/5
            </span>
          )}
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
          <p className="text-gray-600 leading-relaxed">{feedback.description}</p>
        </div>
        
        {isExpanded && onStatusUpdate && canManage && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <select
              value={feedback.status}
              onChange={(e) => onStatusUpdate(feedback.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.values(FeedbackStatus).map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};