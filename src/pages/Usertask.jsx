/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../components/usercontext';
import {  FiUsers } from 'react-icons/fi';
import * as Sentry from "@sentry/react"
import { isProd } from '../components/env';
const UserTasks = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [updatetask,setubdatetask]=useState({taskId,newStatus})

  const fetchTasks = async () => {
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      const res = await axios.get(`${API_URL}/tasks/${user.userId}`, {
         withCredentials:true
      });
      setTasks(res.data.data);
    } catch (err) {
      if(isProd){

        Sentry.captureMessage('Failed to fetch tasks:')
        Sentry.captureException(err)
      }

    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [user.userId]);

    if (loading) {
    return <div className='flex justify-center  items-center h-screen'>
              <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-transparent'>
                 
              </div>
           </div>;
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      const token = localStorage.getItem('sessionId');
      await axios.patch(
        `${API_URL}/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning":"true" },
      withCredentials:true },
        
      );
      fetchTasks();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading your tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-9">
      <h1 className="text-2xl font-bold mb-6">Your Assigned Tasks</h1>
      
      {tasks?.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tasks currently assigned to you</p>
      ) : (
        <div className="space-y-4">
          {tasks?.map(task => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  className={`border rounded px-3 py-1 text-sm ${
                    task.status === 'Completed' ? 'bg-green-50 text-green-700' :
                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  <option value="Pending"> Pending</option>
                  <option value="In Progress"> In Progress</option>
                  <option value="Completed"> Completed</option>
                </select>
              </div>

              {/* Department Information Section */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <FiUsers className="mr-2 text-gray-400" />
                  <span className="font-medium mr-1">Department:</span>
                  <span className="text-gray-700">
                    {task.department?.name || 'No department assigned'}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Assigned by:</span> {task.createdBy?.name || 'Admin'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTasks;