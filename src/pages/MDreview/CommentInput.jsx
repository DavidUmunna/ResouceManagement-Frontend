export const CommentInput = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      MD Comments
    </label>
    <textarea
      value={value}
      onChange={onChange}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      rows={3}
      placeholder="Optional comments for Accounts team"
    />
  </div>
);