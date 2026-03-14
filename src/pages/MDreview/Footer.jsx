export const ModalFooter = ({ onClose, onSubmit, excludedCount, isSubmitting }) => (
  <div className="flex justify-between items-center p-4 border-t">
    <div className="text-sm text-gray-500">
      {excludedCount} requests will be put on hold
    </div>
    <div className="space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  </div>
);