export const ScheduleHeader = ({ schedule, onClose }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 mt-5 sm:p-2 border-b">
  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 break-words">
    Review Schedule: {schedule?.name || `PO-${schedule?._id.slice(-4) || ''}`}
  </h2>
  <button 
    onClick={onClose}
    className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"
    aria-label="Close modal"
  >
    ✕
  </button>
</div>

);