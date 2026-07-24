// frontend/src/components/FeedbackList/FeedbackList.jsx
import React from 'react';
import { FeedbackCard } from '../FeedbackCard/FeedbackCard';

export const FeedbackList = ({
  feedbacks,
  onStatusUpdate,
  onDelete,
  loading = false,
  canManage = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-gray-500">No feedback submitted yet. Be the first!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {feedbacks.map(feedback => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          onStatusUpdate={onStatusUpdate}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
};