import React, { useState } from 'react';

export default function ActionModal({ request, action, onConfirm, onClose, loading }) {
  const [comment, setComment] = useState('');

  if (!request) return null;

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Request' : 'Reject Request';
  const btnClass = isApprove
    ? 'bg-green-600 hover:bg-green-700'
    : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
          <p><span className="font-medium">Employee:</span> {request.user?.name || request.user?.username || '—'}</p>
          <p><span className="font-medium">Type:</span> {request.leaveType}</p>
          <p><span className="font-medium">Days:</span> {request.daysRequested}</p>
          <p><span className="font-medium">Reason:</span> {request.reason}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Comment {!isApprove && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isApprove ? 'Optional note…' : 'Reason for rejection…'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(request._id, comment)}
            disabled={loading || (!isApprove && !comment.trim())}
            className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
          >
            {loading ? 'Processing…' : isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
