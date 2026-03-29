// frontend/src/constants/feedback.constants.js
export const FeedbackType = {
  ISSUE: 'issue',
  IMPROVEMENT: 'improvement'
};

export const FeedbackStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IMPLEMENTED: 'implemented'
};

export const STATUS_COLORS = {
  pending: 'status-pending',
  in_review: 'status-review',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
  implemented: 'status-implemented'
};

export const STATUS_LABELS = {
  pending: 'Pending',
  in_review: 'In Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  implemented: 'Implemented'
};