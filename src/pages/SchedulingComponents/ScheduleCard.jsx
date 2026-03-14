export const ScheduleCard = ({ schedule, onReviewClick }) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    {/* Left Section */}
    <div>
      <h3 className="font-medium text-base sm:text-lg">{schedule.name}</h3>
      <div className="flex flex-wrap gap-2 sm:space-x-4 text-sm text-gray-500 mt-1">
        <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
        <span>₦{schedule.totalAmount.toLocaleString()}</span>
        <span>{schedule.requests.length} requests</span>
      </div>
    </div>

    {/* Right Section (Button) */}
    <button
      onClick={onReviewClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
      aria-label={`Review schedule ${schedule.name}`}
    >
      Review
    </button>
  </div>
  </div>

  );
};