import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { data, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Sentry from "@sentry/react"
import { FaTrash } from 'react-icons/fa';

const DraftSchedules = ({ refreshKey, onEdit })=>{
  const queryClient = useQueryClient();
  const API = process.env.REACT_APP_API_URL;
  const [filteredSchedules, setFilteredSchedules]=useState([])
  const { 
  data: drafts, 
  isLoading, 
  isError,
  error 
} = useQuery(
  ['draftSchedules', refreshKey],
  async () => {
    try {
      const response = await axios.get(
        `${API}/api/scheduling/disbursement-schedules-unpaged`,
        {
          params: { status: 'Draft' },
          withCredentials: true // Include if using auth
        }
      );
      
      return response.data;
    } catch (err) {
       if (error.message === "Network Error") {
                window.location.href = '/adminlogin';
              } else if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = '/adminlogin'; 
              } else {
                Sentry.captureException(error);
              }
    }
  },
  {
    staleTime: 1*60 * 1000, // 1 minutes
    retry: 2, // Retry failed requests twice
   
    onError: (error) => {
      // Log to error reporting service
      console.error('Draft schedules fetch error:', error);
      // Optionally show user notification
      toast.error(error.message); 
    }
  }
);
console.log(drafts)
 useEffect(() => {
  if (drafts) {
    setFilteredSchedules(drafts||[]);
  }
}, [drafts]);

  const submitToMD = useMutation(
    (scheduleId) => axios.patch(`${API}/api/scheduling/disbursement-schedules/${scheduleId}/submit`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('draftSchedules');
        queryClient.invalidateQueries('submittedSchedules');
        toast.success("Draft submitted Successfully")
      }
    }
  );
   const handleDelete=async(scheduleId)=>{
    try{
      const response=await axios.delete(`${API}/api/scheduling/disbursement-schedules/${scheduleId}`,{withCredentials:true})
      
      setFilteredSchedules((prevSchedules) =>
      prevSchedules.filter((schedule) => schedule._id !== scheduleId)
      );
      toast.success("deleted successfully")
    }catch(error){
      Sentry.captureException(error)
      toast.error(error.message)
    }
  }
  

  const handleSubmit = (scheduleId) => {
    submitToMD.mutate(scheduleId);
  };
  

  return (
    <div>
      {isLoading ? (
        <div className="text-center py-4">Loading drafts...</div>
      ) : filteredSchedules?.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No draft schedules found</div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filteredSchedules)&&filteredSchedules?.map(schedule => (
                <tr key={schedule._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.name || 'Untitled Schedule'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.requests.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₦{schedule.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(schedule.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/schedules/${schedule._id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleSubmit(schedule._id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Submit to MD
                    </button>

                    <button
                    onClick={()=>handleDelete(schedule._id)}
                     className=' text-red-600 hover:text-red-400'>
                      <FaTrash />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DraftSchedules;