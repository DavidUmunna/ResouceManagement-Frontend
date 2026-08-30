import { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, 
  FiSearch, FiX, FiClipboard, FiBarChart2, FiPlus 
} from 'react-icons/fi';
import axios from 'axios';
import { useUser } from '../components/usercontext';
import { fetch_RBAC_department } from '../services/rbac_service';
import * as Sentry from "@sentry/react"
import { isProd } from '../components/env';

const DepartmentManagement = ({ setAuth }) => {
  // State
  const {user}=useUser()
  const currentuser=user
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [Error,setError]=useState("")
  const [ADMIN_ROLES,set_ADMIN_ROLES]=useState([])
  // UI State
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [modal, setModal] = useState({ 
    show: false, 
    type: '', // 'addDept', 'editDept', 'addUser', 'assignTask', 'stats', 'deleteDept'
    data: null 
  });
  const [formData, setFormData] = useState({ 
    name: '', 
    headOfDepartment: '', 
    taskTitle: '', 
    taskDescription: '', 
    assignedTo: '',
    dueDate: '',
    status:'Pending'
  });
  const rbac_=async()=>{
    try{
      const response=await fetch_RBAC_department()
      const data=response.data.data

      set_ADMIN_ROLES(data.ADMIN_ROLES_DEPARTMENT)

    }catch(error){
      
      if(isProd)Sentry.captureException(error)

    }
  }
  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

     

      try {
        const [deptRes, usersRes, tasksRes, statsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/department`, { withCredentials:true }),
          axios.get(`${API_URL}/users`, {withCredentials:true }),
          axios.get(`${API_URL}/tasks`, {withCredentials:true }),
          axios.get(`${API_URL}/department/stats`, { withCredentials:true })
        ]);
       
       
        const allResults = [deptRes, usersRes, tasksRes, statsRes];
        const unauthorized = allResults.find(r =>
          r.status === 'rejected' &&
          (r.reason?.response?.status === 401 || r.reason?.response?.status === 403)
        );
        if (unauthorized) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('sessionId');
          setAuth(false);
          window.location.href = '/adminlogin';
          return;
        }

        setDepartments(deptRes.status === 'fulfilled' ? deptRes.value.data.data : []);
        setUsers(usersRes.status === 'fulfilled' ? usersRes.value.data.data : []);
        setTasks(tasksRes.status === 'fulfilled' ? tasksRes.value.data.data : []);
        setStats(statsRes.status === 'fulfilled' ? (statsRes.value.data.data || []) : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    rbac_()
  }, [setAuth]);
  
  // Add this right after the state declarations
const fetchDepartments = async () => {

  try {
    const API_URL = `${process.env.REACT_APP_API_URL}/api`

   
   
    const response = await axios.get(`${API_URL}/department`, { withCredentials:true });
    setDepartments(response.data.data);
  } catch (err) {
    console.error("Failed to fetch departments:", err);
  }
};

const refreshDepartments = () => {
  fetchDepartments(); // Simply recall the fetch function
};
  
  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.headOfDepartment?.name && dept.headOfDepartment.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteTask=async(taskId)=>{
    const taskToRestore = tasks.find(t => t._id === taskId);
    try{
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
      await axios.delete(`${API_URL}/tasks/${taskId}`);
    }catch(error){
      if (taskToRestore) setTasks(prevTasks => [...prevTasks, taskToRestore]);
      console.error(error.response?.data||error.message)
    }
  }
  
  // Modal handling
  const closeModal = () => {
    setModal({ show: false, type: '', data: null });
    setFormData({
      name: '', 
      headOfDepartment: '', 
      taskTitle: '', 
      taskDescription: '', 
      assignedTo: '',
      dueDate: '',
      status:''
      
    });
    setSelectedUserId('');
  };
  

  const openModal = async (type, data = null, userId = null) => {
    setModalLoading(true);
    try {
      let modalData;
  
      switch(type) {
        case 'addDept':
          modalData = { users }; // All users for dropdown
          break;
          
        case 'editDept':
          modalData = { 
            ...data, 
            users,
            currentHead: data.headOfDepartment?.user?._id 
          };
          setFormData({
            name: data.name,
            headOfDepartment: data.headOfDepartment?.user?._id || ''
          });
          break;
          
        case 'deleteDept':
          modalData = data;
          break;
          
        case 'addUser':
          const existingUserIds = data.users.map(d => 
            d.user?._id?.toString() || d.user?.toString()
          ).filter(Boolean);
          
          modalData = {
            ...data,
            availableUsers: users.filter(user => 
              !existingUserIds.includes(user._id.toString()))
          };
          break;
          
        
          
        case 'assignTask':
          modalData = { 
            ...data,
            availableUsers: Array.isArray(data.users) 
              ? data.users
              : []
          };
          break;
          
        default:
          modalData = data;
      }
  
      
      setModal({
        show: true,
        type,
        data: modalData
      });
      
    } catch (err) {
      console.error("Error opening modal:", err);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Department Operations
  const handleDepartmentSubmit = async () => {
    try {

      
      const departmentData = {
        name: formData.name,
        headOfDepartment: {
          user: formData.headOfDepartment,
          name: users.find(u => u._id === formData.headOfDepartment)?.name
        }
      };

      let response;
      if (modal.type === 'addDept') {
        const API_URL=`${process.env.REACT_APP_API_URL}/api`
        response = await axios.post(`${API_URL}/department`, departmentData, { withCredentials:true });
        setDepartments(prev => [...prev, response.data.data]);
      } else {
        const API_URL=`${process.env.REACT_APP_API_URL}/api`
        response = await axios.put(`${API_URL}/department/${modal.data._id}`, departmentData, { withCredentials:true });
        setDepartments(prev => prev.map(d => d._id === modal.data._id ? response.data.data : d));
      }
      
      closeModal();
    } catch (err) {
      console.error("Department error:", err.response?.data || err.message);
    }
  };
  const fetchTasks = async () => {
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
     
      const response = await axios.get(`${API_URL}/tasks`, {

        withCredentials: true
      });
      setTasks(response.data.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const deleteDepartment = async () => {
    try {

      const API_URL=`${process.env.REACT_APP_API_URL}/api`
      await axios.delete(`${API_URL}/department/${modal.data._id}`, {

        withCredentials: true
      });
      setDepartments(prev => prev.filter(d => d._id !== modal.data._id));
      closeModal();
    } catch (err) {
      if(isProd)Sentry.captureException(err)}
  };

  // User Operations
  const addUserToDepartment = async () => {
    try {
      
      const API_URL=`${process.env.REACT_APP_API_URL}/api`
      const response = await axios.post(
        `${API_URL}/department/${modal.data._id}/users`,
        { userId: selectedUserId, name:users.find(u=>String(u._id)===String(selectedUserId))?.name },
        { 
          withCredentials: true 
        }
      );
      
      setDepartments(prev => prev.map(d => 
        d._id === modal.data._id ? response.data.data : d
      ));
      closeModal();
    } catch (err) {
      if (err.response?.status===401|| err.response?.status===403){
        setError("Session expired. Please log in again.");
        localStorage.removeItem('sessionId');
        setAuth(false)
        window.location.href = '/adminlogin'; 
      }else{

        console.error("Add user error:", err.response?.data || err.message);
      }
    }
  };

  const removeUserFromDepartment = async (departmentId,userId) => {
    try {

      const API_URL=`${process.env.REACT_APP_API_URL}/api`
      await axios.delete(
        `${API_URL}/department/${departmentId}/users/${userId}`,
        { 
          withCredentials: true 
        }
      );
      
      refreshDepartments()
    } catch (err) {
      if (err.response?.status===401|| err.response?.status===403){
        setError("Session expired. Please log in again.");
        localStorage.removeItem('sessionId');
        setAuth(false)
        window.location.href = '/adminlogin'; 
      }else{

        console.error("Remove user error:", err.response?.data || err.message);
      }
    }
  };
  const visibleDepartments = filteredDepartments.filter(dept => {
    const isGlobalAccess = ADMIN_ROLES.includes(user.role);
    const isDepartmentHead = String(dept.headOfDepartment?.user?._id) === String(user.userId);
   
    return isGlobalAccess || isDepartmentHead;
  })
  // Task Operations
  const assignTask = async () => {
    try {
      const API_URL=`${process.env.REACT_APP_API_URL}/api`
      await axios.post(`${API_URL}/tasks`, {
        title: formData.taskTitle,
        description: formData.taskDescription,
        assignedTo: formData.assignedTo,
        department: modal.data._id,
        dueDate: formData.dueDate,
        createdBy: user.userId,
        status:formData.status|| 'Pending'
       // status:
      }, { 
        withCredentials: true 
      });
     
      //setTasks(prev => [...prev, response.data.data]);
      fetchTasks()
      closeModal();
    } catch (err) {
      console.error("Task error:", err.response?.data || err.message);
    }
  };
  if (loading){
      return <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }

  // Components

  const StatsPanel = ({ department }) => {
    const stat = Array.isArray(stats)
      ? stats.find(s => String(s._id) === String(department._id))
      : null;
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg mb-3 flex items-center">
          <FiBarChart2 className="mr-2" /> Department Statistics
        </h3>
        {stat ? (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Members"
              value={stat?.memberCount}
              trend="↗︎ 2 this month"
            />
            <StatCard
              title="Active Tasks"
              value={stat?.activeTasks || 0}
              trend={`${stat?.taskCompletion || 0}% completed`}
            />
            <StatCard
              title="Avg. Task Time"
              value={Math.ceil(stat?.avgTaskTimeHours) || 'N/A'}
              trend="Last month: 3.2 days"
            />
            <StatCard
              title="Head Since"
              value={new Date(department.createdAt.split("T")[0]).toLocaleDateString() || 'N/A'}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No statistics available for this department.</p>
        )}
      </div>
    );
  };

  const TaskList = ({ department }) => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-700">Department Tasks</h3>
        {(String(department.headOfDepartment?.user?._id) === String(user.userId) || ADMIN_ROLES.includes(user.role)) && (
          <button
            onClick={() => openModal('assignTask', department)}
            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded flex items-center"
          >
            <FiClipboard className="mr-1" /> Assign Task
          </button>
        )}
      </div>
      {tasks.filter(t => String(t.department?._id || t.department) === String(department._id)).length === 0 ? (
        <p className="text-gray-500 text-sm italic">No tasks assigned</p>
      ) : (
        <div className="space-y-2">
          {tasks.filter(t => String(t.department?._id || t.department) === String(department._id)).map(task => (
            <div key={task._id} className="p-3 bg-white rounded border border-gray-200">

               <div className='flex '>
                
                <button
                      onClick={() => deleteTask(task._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                  </button>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-2 rounded-full">
                  Assigned to: {department.users.find(u => String(u._id) === String(task.assignedTo?._id || task.assignedTo))?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <span>Status: {task.status}</span>
              </div>
             
             
              
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MembersList = ({ department }) => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-700">Department Members</h3>
        <button
          onClick={() => openModal('addUser', department)}
          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded flex items-center"
        >
          <FiUserPlus className="mr-1" /> Add Member
        </button>
      </div>
      <div className="space-y-2">
        {(department.users || []).map(user => (
          
          <div key={user._id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
            <div className="flex items-center">
              <FiUsers className="mr-2 text-gray-400" />
              <span>{user.name}</span>
              {department.headOfDepartment?.user?._id === user._id && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Head
                </span>
              )}
            </div>
            
            {(department.headOfDepartment?.user?._id === currentuser.userId || ADMIN_ROLES.includes(currentuser.role) )&& (
              <button
                onClick={() =>removeUserFromDepartment(department._id,user._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiX />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-full sm:max-w-md md:max-w-full lg:max-w-4xl xl:max-w-6xl mx-auto p-6 mt-10 mb-15"
      >
            {/* Header and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 flex-wrap mt-4 md:items-center">
          <h1 className="text-2xl font-bold text-gray-800 sm:mb-0 mb-4">Department Management</h1>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4 w-full sm:w-auto">
            {ADMIN_ROLES.includes(user.role) && (
              <div className="relative mb-4 sm:mb-0 w-full sm:w-auto">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {ADMIN_ROLES.includes(user.role) && (
              <button
                onClick={() => openModal('addDept')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={modalLoading}
              >
                <FiPlus className="mr-2" /> Add Department
              </button>
            )}
          </div>
      </div>


      {/* Departments List */}
      <div className="space-y-6">
        {visibleDepartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No departments found{searchTerm && ` matching "${searchTerm}"`}
          </div>
        ) : (
          visibleDepartments.map(dept => (
            <div key={dept._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setExpandedDept(expandedDept === dept._id ? null : dept._id)}
              >
                <div>
                  <h2 className="font-bold text-lg">{dept.name}</h2>
                  <p className="text-gray-600">
                    Head: {dept.headOfDepartment?.name || 'Not assigned'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {dept.users.length} members
                  </span>
                  {expandedDept === dept._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {expandedDept === dept._id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openModal('editDept', dept)}
                      className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded flex items-center"
                      disabled={modalLoading}
                    >
                      <FiEdit2 className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => openModal('deleteDept', dept)}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded flex items-center"
                      disabled={modalLoading}
                    >
                      <FiTrash2 className="mr-1" /> Delete
                    </button>
                  </div>

                  <MembersList department={dept} />
                  <StatsPanel department={dept} />
                  <TaskList department={dept} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Universal Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modal.type === 'addDept' && 'Add Department'}
                {modal.type === 'editDept' && `Edit ${modal.data.name}`}
                {modal.type === 'addUser' && `Add User to ${modal.data.name}`}
                {modal.type === 'assignTask' && `Assign Task in ${modal.data.name}`}
                {modal.type === 'deleteDept' && `Delete ${modal.data.name}?`}
                {modal.type === 'deleteTask' && `Delete ${modal.data.name}?`}
              </h2>
              <button 
                onClick={closeModal} 
                className="text-gray-500 hover:text-gray-700"
                disabled={modalLoading}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Department Form */}
            {['addDept', 'editDept'].includes(modal.type) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={modalLoading}
                >
                  <option value="">Select Department</option>
                  <option value="waste_management_dep">Waste Management</option>
                  <option value="PVT">PVT</option>
                  <option value="Environmental_lab_dep">Environmental Lab</option>
                  <option value="accounts_dep">Accounts</option>
                  <option value="Human resources">Human Resources</option>
                  <option value="IT">IT</option>
                </select>

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({...formData, headOfDepartment: e.target.value})}
                    disabled={modalLoading}
                  >
                    <option value="">Select Head of Department</option>
   
                    {Array.isArray(modal?.data?.users)&&modal.data.users.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Add User Form */}
            {modal.type === 'addUser' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    disabled={modalLoading}
                  >
                    <option value="">Select a user to add</option>
                    {modal.data?.availableUsers?.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Task Assignment Form */}
            {modal.type === 'assignTask' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    placeholder="Task title"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.taskTitle}
                    onChange={(e) => setFormData({...formData, taskTitle: e.target.value})}
                    disabled={modalLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Description"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.taskDescription}
                    onChange={(e) => setFormData({...formData, taskDescription: e.target.value})}
                    disabled={modalLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    disabled={modalLoading}
                  >
                    <option value="">Assign to...</option>
                    {modal.data?.availableUsers?.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="Pending" className="text-gray-700">Pending</option>
                      <option value="InProgress" className="text-gray-700">In Progress</option>
                      <option value="Completed" className="text-gray-700">Completed</option>
                    </select>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    disabled={modalLoading}
                  />
                </div>
              </div>
            )}
            {/*task deletion confirmation */}
            {/*---------------------------*/}

            {/* Delete Confirmation */}
            {modal.type === 'deleteDept' && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete the "{modal.data.name}" department? 
                  This action cannot be undone.
                </p>
                {modal.data.users.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          This department has {modal.data.users.length} members who will need to be reassigned.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (['addDept', 'editDept'].includes(modal.type)) await handleDepartmentSubmit();
                    if (modal.type === 'addUser') await addUserToDepartment();
                    if (modal.type === 'assignTask') await assignTask();
                    if (modal.type === 'deleteDept') await deleteDepartment();
                    
                  } catch (err) {
                    console.error("Action failed:", err);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg ${
                  modal.type === 'deleteDept' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {modal.type === 'addDept' && 'Create Department'}
                    {modal.type === 'editDept' && 'Save Changes'}
                    {modal.type === 'addUser' && 'Add Member'}
                    {modal.type === 'assignTask' && 'Assign Task'}
                    {modal.type === 'deleteDept' && 'Delete Department'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {Error}
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, trend }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
    {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
  </div>
);

export default DepartmentManagement;
