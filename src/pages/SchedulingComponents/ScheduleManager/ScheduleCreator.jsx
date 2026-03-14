import { useState } from 'react';
import { useQuery, useMutation,useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
const ScheduleCreator = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [scheduleName, setScheduleName] = useState('');
 
  // Fetch approved purchase orders
  const API = process.env.REACT_APP_API_URL;

  const { data:approvedRequests, isLoading:isLoadingApproved } = useQuery(
    'approvedRequests',
    () => axios.get(`${API}/api/scheduling/purchase-orders?status=Approved`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    }
  );



const Requests = (approvedRequests || [])

  const createSchedule = useMutation(
    (scheduleData) => axios.post(`${API}/api/scheduling/disbursement-schedules`, scheduleData,{withCredentials:true}),
    {
      onSuccess: () => {
          queryClient.invalidateQueries('draftSchedules');
        onSuccess();
        setSelectedRequests([]);
        setScheduleName('');
      }
    }
  );

  const toggleRequest = (request) => {
    setSelectedRequests(prev => 
      prev.some(r => r._id === request._id)
        ? prev.filter(r => r._id !== request._id)
        : [...prev, request]
    );
  };

  const totalAmount = selectedRequests.reduce(
    (sum, req) => sum + req.products.reduce(
      (s, p) => s + (p.price * p.quantity), 0
    ), 0
  );

  const handleSubmit = () => {
    createSchedule.mutate({
      name: scheduleName,
      requests: selectedRequests.map(r => ({
        requestId: r._id,
        included: true
      })),
      totalAmount
    });
    toast.success("Created Successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700"><strong>Schedule Name</strong></label>
        <input
          type="text"
          value={scheduleName}
          onChange={(e) => setScheduleName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-md border-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-medium">Approved Purchase Orders</h3>
        </div>
        {(isLoadingApproved) ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {Requests?.map((request,index) => (
              <li key={`${request.orderNumber}-${index}`} className="p-4 hover:bg-gray-50">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedRequests.some(r => r._id === request._id)}
                    onChange={() => toggleRequest(request)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {request.orderNumber} - {request.Title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.products.reduce((sum, p) => sum + p.quantity, 0)} items
                    </p>
                    <p className="text-sm font-medium">
                      <strong>Department:</strong>{request.staff?.Department}
                    </p>
                  </div>
                  <div className=" flex justify-end text-right">
                    <p className="text-sm font-medium mr-6 text-gray-500">
                      {request.createdAt.split('T')[0]}
                    </p>
                    <p className="text-sm font-medium">
                      ₦{request.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                    </p>
                   
                    </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">Selected Requests</p>
          <p className="font-medium">{selectedRequests.length} requests</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-medium text-blue-600">
            ₦{totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedRequests.length === 0 || createSchedule.isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createSchedule.isLoading ? 'Creating...' : 'Create Schedule'}
        </button>
      </div>
    </div>
  );
};

export default ScheduleCreator;