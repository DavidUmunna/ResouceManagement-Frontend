// userDetails.utils.js
export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr.includes('T') ? dateStr.split('T')[0] : dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

export const calculateStats = (approved, rejected, pending, completed,MoreInformation) => {
  const total = approved.length + rejected.length + pending.length + completed.length+MoreInformation.length;
  const rate = total > 0 ? Math.round((approved.length / total) * 100) : 0;
  
  const avgProcessingTime = approved.reduce((sum, order) => {
    if (!order.createdAt || !order.Approvals?.length) return sum;
    const created = new Date(order.createdAt);
    const lastApproval = new Date(order.Approvals[order.Approvals.length-1]?.timestamp);
    return sum + Math.ceil((lastApproval - created) / (1000 * 60 * 60 * 24));
  }, 0) / (approved.length || 1);

  return {
    totalRequests: total,
    approvalRate: rate,
    avgProcessingTime: Math.ceil(avgProcessingTime)
  };
};