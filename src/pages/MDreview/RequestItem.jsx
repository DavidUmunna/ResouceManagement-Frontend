export const RequestItem = ({ request, isSelected, onToggle }) => {
  const urgencyColor = {
    VeryUrgent: 'text-red-600',
    Urgent: 'text-yellow-600',
    NotUrgent: 'text-gray-500'
  }[request.urgency];

  return (
    <li className="p-4 hover:bg-gray-50">
      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {request.orderNumber} - {request.Title}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Department: </strong> {request?.staff?.Department} • <strong>Requested By: </strong>{request.staff?.name} • {new Date(request.createdAt).toLocaleDateString()}
          </p>
          
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            ₦{request?.products.reduce((sum, product) => sum + product.price, 0)}
          </p>
          <p className={`text-xs ${urgencyColor}`}>
            {request.urgency}
          </p>
        </div>
      </label>
    </li>
  );
};