import Button from '../../components/Button';

export const ScheduleCard = ({ schedule, onReviewClick }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        {/* Left Section */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-gray-800">{schedule.name}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
            <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
            <span>₦{schedule.totalAmount.toLocaleString()}</span>
            <span>{schedule.requests.length} requests</span>
          </div>
        </div>

        {/* Right Section (Button) */}
        <Button
          size="sm"
          onClick={onReviewClick}
          className="w-full sm:w-auto"
          aria-label={`Review schedule ${schedule.name}`}
        >
          Review
        </Button>
      </div>
    </div>
  );
};