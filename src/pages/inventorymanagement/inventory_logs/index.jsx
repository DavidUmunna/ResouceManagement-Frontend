/*eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from '@sentry/react';
import React, { useState, useEffect,useMemo } from 'react';
import { format } from 'date-fns';
import axios from "axios"
import {FaEdit, FaTrash} from "react-icons/fa"
import { useUser } from '../../../components/usercontext';
import PaginationControls from '../../../components/Paginationcontrols';
import { FiPlus } from 'react-icons/fi';
import PrintReport from './PrintReport';
import CategoryForm from '../Category_form';
import CategorySelect from '../Category_select';
import ExcelExport from './Excelexport';
import { isProd } from '../../../components/env';
const InventoryLogs = () => {
  // Form state
  const [formData, setFormData] = useState({
    Staff_Name: '',
    inventory_item: '',
    quantity: '',
    purpose: '',
    status: 'pending',
    category:"",
    Department:""
  });
  const [selectedCategory,setSelectedCategory]=useState("All")
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const {user}=useUser()
  // Logs state
  const [Error, setError]=useState("")
  const [logs, setLogs] = useState([]);
  const [showmodal,setshowmodal]=useState(false)
  const [loading,setLoading]=useState(false)
  const [data, setData] = useState({
      activities: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    });
  const [ShowForm, setShowForm]=useState(false) 
  // Filter state
  const [ShowReport, setShowReport]=useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  //const [Inventorylogitem, setInventorylogitem] =useState(null)
  const [editingItem, setEditingItem]=useState(null) 
  const [categories,setcategories]=useState([])

  // Load sample data on first render

   const fetchData = async (page=data.pagination?.page,limit=data.pagination?.limit) => {
    
    try {
      
        const token = localStorage.getItem('sessionId');
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        const [inventoryRes,categoryRes] = await Promise.all([
        
        axios.get(`${API_URL}/inventorylogs/${user.Department}`, { params: { page, limit },
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
          }),

        axios.get(`${API_URL}/inventorylogs/categories`,{headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },withCredentials:true})
          
        ]);
        setData({
          activities: inventoryRes.data.data,
          pagination: inventoryRes.data.Pagination
        });
        
        setLogs(Array.isArray(inventoryRes.data.data) ? inventoryRes.data.data : []);
        setcategories(categoryRes.data.data.categories)
   
        
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('sessionId');
        
          window.location.href = '/adminlogin'; 
        } else {
          if (isProd)Sentry.captureException( err);
        }
      } finally {
        setLoading(false);
      }
    };

  
  useEffect(() => {
    fetchData()

  
  }, []);




  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
        setLoading(true)
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        const response=await axios.post(`${API_URL}/inventorylogs/create`,
            {...formData},
        {withCredentials:true})

        setLogs([response.data.data,...logs])
        fetchData()
        resetForm();
        setShowForm(false);

        //const updatedItem=Inventorylogitem.find(item=>item._id===itemId)

    }catch(error){
      if(isProd){

        Sentry.captureMessage("failed to create entry")
        Sentry.captureException(error)
      }
    }finally{
        setLoading(false)
    }
    };

    const handleInputChange=(e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({
            ...formData,
            [name]:value
        }))
    }

    const handleDelete=async(itemId)=>{
        try{
            setLoading(true)
       
            const API_URL = `${process.env.REACT_APP_API_URL}/api`;
            await axios.delete(`${API_URL}/inventorylogs/${itemId}`,{
            withCredentials:true
            })

            setLogs(prevItem=>prevItem.filter(item=>item._id!==itemId))
            fetchData()

        }catch(error){
          
          if(isProd){

            Sentry.captureMessage("failed to create entry")
            Sentry.captureException(error)
          }
        }finally{
            setLoading(false)
        }
    }
   
   
    
  const resetForm=()=>{
    // Reset form
    setFormData({
      Staff_Name: '',
      inventory_item: '',
      quantity: '',
      purpose: '',
      status: 'pending',
      category:"",
      Department:""
    });
  };

  const setupEdit=(item)=>{
    setEditingItem(item);
    setFormData({
        Staff_Name:item.Staff_Name,
        inventory_item:item.inventory_item,
        quantity:item.quantity,
        purpose:item.purpose,
        status:item.status,
        category:item.category,
        Department:item.Department
    });
    setShowForm(true)
  }

  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        setLoading(true)
        const API_URL = `${process.env.REACT_APP_API_URL}/api`
  
        const res = await axios.put(`${API_URL}/inventorylogs/${editingItem._id}`, formData, {
          withCredentials:true
        });
        
        setLogs(prevLogs =>
          prevLogs.map(({ _id, ...rest }) =>
            _id === editingItem._id ? res.data.data : { _id, ...rest }
          )
        );

        resetForm();
        setEditingItem(null);
        setShowForm(false);
        fetchData(); // Refresh data
      } catch (err) {
        if (isProd){

          Sentry.captureMessage('Update Failed');
          Sentry.captureException(err.response?.data || err.message)
        }
      }finally{
        setLoading(false)
      }
    };
  

  

  

  // Filter logs based on search term and status
  const filteredLogs = useMemo(() => {
  if (!logs ) return [];
 
  return logs
    .filter(log => {
      if (!log || typeof log !== 'object') return false;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        log.Staff_Name?.toLowerCase().includes(search) ||
        log.inventory_item?.toLowerCase().includes(search) ||
        log.purpose?.toLowerCase().includes(search) ||
        log.category?.toLowerCase().includes(search)||  
        log.status?.toLowerCase().includes(search)||
        log.Department?.toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .filter(item => {
       return selectedCategory === 'All'||item?.category === selectedCategory;
    })
    .sort((a, b) => {
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
}, [logs, searchTerm,selectedCategory, statusFilter, sortConfig]);


   const handlePageChange = (newPage) => {
      fetchData(newPage, data.pagination?.limit);
    };
  
    const handleItemsPerPageChange = (newLimit) => {
      fetchData(1, newLimit); // Reset to page 1 when changing limit
    };

  // Pagination
  


  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

   


  if (loading) {
    return <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }

  return (
    <div className="min-h-screen mt-10 bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Inventory Logs System</h1>
        
        {/* Inventory Withdrawal Form */}
        
        {ShowForm &&(<div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingItem ? 'Edit Inventory Record' : 'New Inventory Withdrawal'}
          </h2>
          <form onSubmit={editingItem? handleUpdate:handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Staff_Name"
                  value={formData.Staff_Name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="inventory_item"
                  value={formData.inventory_item}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="Department"
                  value={formData.Department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                   <option value="">Select Department</option>
                  <option value="waste_management_dep">Waste Management</option>
                  <option value="PVT">PVT</option>
                  <option value="Environmental_lab_dep">Environmental Lab</option>
                  <option value="accounts_dep">Accounts</option>
                  <option value="Human resources">Human Resources</option>
                  <option value="IT">Information Technology</option>
                  <option value="Administration">Administration</option>
                  <option value="Procurement_department">Procurement Department</option>
                  <option value="QHSE_dep">QHSE Department</option>
                  <option value="Contracts_Department">Contracts Department</option>
                  <option value="BD_Department">Business Development Department</option>
                  <option value="Engineering_Department">Engineering Department</option>
                 </select>
              </div>
            
              <div>
                <CategoryForm user={user} categories={categories}
                 formdata={formData} handleInputChange={handleInputChange}
                />
              </div>
               
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose/Notes
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end">
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null);
                   
                  }}
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingItem ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>)}
        
        {/* Inventory Logs Table */}
         <div className="mb-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <h2 className="text-xl font-semibold text-gray-700">Inventory Logs</h2>
         
             {/* Search and Filter */}
             <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap gap-3">
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="h-11 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
               >
                 <option value="all">All Statuses</option>
                 <option value="pending">Pending</option>
                 <option value="completed">Completed</option>
                 <option value="returned">Returned</option>
               </select>
         
               <div className="w-full sm:w-auto">
                 <CategorySelect
                   user={user}
                   categories={categories}
                   searchTerm={searchTerm}
                   setSearchTerm={setSearchTerm}
                   selectedCategory={selectedCategory}
                   setSelectedCategory={setSelectedCategory}
                 />
               </div>
         
               <button
                 onClick={() => setshowmodal(!showmodal)}
                 className="h-11 w-full sm:w-auto px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
               >
                 Export to CSV
               </button>
         
               <button
                 onClick={() => setShowReport(!ShowReport)}
                 className="h-11 w-full sm:w-auto px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
               >
                 Print Report
               </button>
         
               <button
                 onClick={() => {
                   setEditingItem(null);
                   resetForm();
                   setShowForm(!ShowForm);
                 }}
                 className="h-11 w-full sm:w-auto px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] text-sm"
               >
                 <FiPlus className="mr-1" />
                 <span className="whitespace-nowrap">{ShowForm ? "close" : "add log"}</span>
               </button>
             </div>
           </div>
         
             
         
                 
                   
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                   filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(log.createdAt, 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.Staff_Name}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.Department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.inventory_item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(log.status)}`}>
                          {log.status.charAt(0).toUpperCase() + log?.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(log.status)}`}>
                          { log?.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setupEdit(log)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit/>
                          </button>
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No inventory logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {ShowReport && (<PrintReport filteredLogs={filteredLogs}/>)}
        {showmodal && (<ExcelExport setopenmodal={setshowmodal} setLoading={setLoading} categories={categories}/>)}
        {/* Pagination */}
        <div>
                                {/* Your data display */}
                                <PaginationControls
                                  currentPage={data.pagination?.page}
                                  totalPages={data.pagination?.totalPages}
                                  itemsPerPage={data.pagination?.limit}
                                  totalItems={data.pagination?.total}
                                  onPageChange={handlePageChange}
                                  onItemsPerPageChange={handleItemsPerPageChange}
                                  isLoading={loading}
                                />
        </div>
        
        
        {/* Export Options */}
      
      </div>
      {Error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {Error}
        </div>
      )}
      
    </div>
  );

}

export default InventoryLogs;