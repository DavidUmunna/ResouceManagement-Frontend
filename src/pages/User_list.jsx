import * as Sentry from "@sentry/react"
import { useEffect, useState } from "react";
import { get_users, deleteUser, updateUser } from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";
import AddUserModal from "./AddUserModal";
import {Users} from "lucide-react"
import { fetch_RBAC_ALL } from "../services/rbac_service";
import { isProd } from "../components/env";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

// Department colors mapping
const departmentColors = {
  Engineering: "bg-blue-100 text-blue-800",
  Design: "bg-purple-100 text-purple-800",
  Marketing: "bg-pink-100 text-pink-800",
  Sales: "bg-green-100 text-green-800",
  HR: "bg-yellow-100 text-yellow-800",
  Operations: "bg-indigo-100 text-indigo-800",
  Default: "bg-gray-100 text-gray-800"
};

// Role options

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading,setloading]=useState(false)
  const [editingUser, setEditingUser] = useState(null);
  const [ALLROLES, set_ALLROLES]=useState([])
  const [editForm, setEditForm] = useState({
    name: "",
    Department: "",
    canApprove: false,
    role: "",
    password: "",
    WorkStatus:"",
    email:""
  });
  const [openAdduser,setOpenAdduser]=useState(false)
  const [showEditModal, setShowEditModal] = useState(false);
  const fetch_all=async()=>{
    try{
      const response=await fetch_RBAC_ALL()

      set_ALLROLES(response.data.data.ALL_ROLES)

    }catch(error){
      if(isProd){

        Sentry.captureException(error)
        Sentry.captureMessage("there was an error while fetching roles")
      }

    }
  }


  useEffect(() => {
    fetch_users();
    fetch_all()
    
  }, []);

  const fetch_users = async () => {
    try {
      setloading(true)
      const user_data = await get_users();
    
      if (Array.isArray(user_data.data)) {
        setUsers(user_data.data || []);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {

      if (isProd)Sentry.captureException(error)
      
    }finally{
      setloading(false)
    }
  };

  /*const getDepartment = async () => {
    try {
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const department_data = await axios.get(`${API_URL}/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(department_data.data.data);
    } catch (error) {
      console.log(error);
    }
  };*/

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    setUsers(users.filter((user) => user._id !== userId));
  };

  const handleEdit = (editeduser) => {

    setEditingUser(editeduser);
    setEditForm({
      name: editeduser.name||"",
      Department: editeduser.Department||'',
      canApprove: editeduser.canApprove || false,
      role: editeduser.role||"",
      password:editeduser.password||'',
      WorkStatus:editeduser.role||'',
      email:editeduser.email ||""   // Leave blank for security
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
  e.preventDefault();

  try {
    if (!editingUser || !editingUser._id) {
      console.error("No user selected for editing");
      return;
    }


    const updatedUser = await updateUser(editingUser._id, editForm);

    if (!updatedUser) {
      console.error("No response from updateUser");
      return;
    }

   
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === editingUser._id ? updatedUser.data : user
      )
    );

    setShowEditModal(false);
    // Optional: Show success toast/alert
  } catch (error) {
    if (isProd){

      Sentry.captureMessage("Error updating user")
      Sentry.captureException(error)
    }
    
    // Optional: Show error toast/alert
  }
};


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  //console.log("filter:",filter)
  const filteredUsers = filter === "All" || filter=== ""
    ? users 
    : users.filter(user => user.Department === filter);

  if (loading) {
    return <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 mt-10 mb-11">
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit User</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="Department"
                    value={editForm.Department}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Department</option>
                    <option value="waste_management_dep">Waste Management</option>
                    <option value="PVT">PVT</option>
                    <option value="Environmental_lab_dep">Environmental Lab</option>
                    <option value="accounts_dep">Accounts</option>
                    <option value="Human resources">Human Resources</option>
                    <option value="IT">Information Technology</option>
                    <option value="Administration">Administration</option>
                    <option value="Business_Develoment">Business Development</option>
           
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    
                    <option value="">Select Role</option>
                    {ALLROLES?.map((user,index) => (
                      <option key={index} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Work Status</label>
                  <select
                  name="WorkStatus"
                  value={editForm.WorkStatus}
                  onChange={handleInputChange}
                   className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                  >
                    <option value="">Select Work Status</option>
                    <option value="On-Site">On-Site</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Leave">On-Leave</option>

                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="canApprove"
                    checked={editForm.canApprove}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Can Approve Requests</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="New password"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {openAdduser&&(
          <AddUserModal
          onClose={()=>setOpenAdduser(false)}        
          />
        )
        }

      {/* Main User List */}
      <motion.div
        className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-gray-800" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h2>
            </div>
            <div className="flex  justify-between ">

            <button className="p-3 bg-gray-700 text-white rounded-lg mx-3 font-bold"
            onClick={()=>setOpenAdduser(true)}
            >
                Add User
            </button>
            <div className="flex flex-wrap gap-2">
              
              <select 
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                <option value="All">Select Department</option>
                <option value="waste_management_dep">Waste Management</option>
                <option value="PVT">PVT</option>
                <option value="Environmental_lab_dep">Environmental Lab</option>
                <option value="accounts_dep">Accounts</option>
                <option value="Human resources">Human Resources</option>
                <option value="IT">Information Technology</option>
                <option value="Administration">Administration</option>
           
              </select>
            </div>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <motion.div 
            className="p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-500">No users found{filter !== "All" && ` in ${filter} Department`}.</p>
          </motion.div>
        ) : (
          <motion.ul 
            className="divide-y divide-gray-100"
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredUsers.map((person) => (
                <motion.li
                  key={person._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.img
                        alt={person?.name}
                        src={person?.imageurl || "https://ui-avatars.com/api/?name="+person.name+"&background=random"}
                        className="size-12 sm:size-14 flex-none rounded-full bg-gray-100 border-2 border-white shadow"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{person?.name}</p>
                          {person?.role === "Admin" && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">Admin</span>
                          )}
                          {person?.canApprove && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Approver</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{person?.email}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            departmentColors[person.Department] || departmentColors.Default
                          }`}>
                            {person.Department || "No Department"}
                          </span>
                          {person.role && person.role !== "Admin" && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                              {person.role}
                            </span>
                            
                          )}
                          {(person.WorkStatus)&&
                            <span className={`text-xs px-2 py-1  rounded-full
                              ${person.WorkStatus==="On-Site"?" bg-green-100 ": "bg-red-100" }`
                            }>
                              {person?.WorkStatus}
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-normal gap-3">
                     
                      <motion.button
                        onClick={() => handleEdit(person)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition font-medium flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >

                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(person._id)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
        
      </motion.div>
    </div>
  );
}