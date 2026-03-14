    /* eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from '@sentry/react';
import React,{useState,useEffect} from "react"
import PaginationControls from "../../components/Paginationcontrols";
import axios from "axios";
import { useUser } from "../../components/usercontext";
import { isProd } from '../../components/env';
import { Trash, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
// RecentActivity Component
const RecentActivity = ({ refreshFlag, onRefreshComplete }) => {
      const {user}=useUser();
      const [data, setData] = useState({
        activities: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0
        }
      });
      //const [activities,setactivities]=useState([])
      const [isLoading, setIsLoading] = useState(false);
      const [categories, setCategories] = useState([]);
      const [selectedCategory, setSelectedCategory] = useState('All');
      const access_free_roles=["procurement_officer","human_resources","global_admin"]

    
      const fetchActivities = async (page , limit) => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('sessionId');
          //const params= { page, limit }
          
          //if (categories) params.category = categories;
          const API_URL = `${process.env.REACT_APP_API_URL}/api`;
          const response = await axios.get(`${API_URL}/inventory/activities/${user.Department}`, {
            params: { page, limit }, 
          headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning":"true" }
      
          });
          //setactivities(response.data.data)
          setData({
            activities: response.data.data,
            pagination: response.data.pagination
          });

         
          onRefreshComplete?.()
        } catch (error) {
          if (isProd)Sentry.captureException(error);
        } finally {
          setIsLoading(false);
        }
      };
      const fetchcategory=async()=>{
        try{
          const token = localStorage.getItem('sessionId');
          const API_URL = `${process.env.REACT_APP_API_URL}/api`;
          const response=await axios.get(`${API_URL}/inventory/categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
          })
      

          setCategories(response.data.data.categories||[])


        }catch(error){
          if (isProd)Sentry.captureException(error)

        }
      }

    const DeleteLog=async(activityId)=>{
      try{
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        const response= await axios.delete(`${API_URL}/inventory/activities/${activityId}`,{withCredentials:true})
        if(response.data.success==true){
          toast.success(response.data.message,{autoClose:1000})
        }
        
        setData((prev)=>({
          ...prev,
          activities:prev.activities.filter((log)=>(log._id!==activityId))
                  
        }))
        

      }catch(error){
        if(error.response?.data.success==false){

          toast.error(error.response?.data.message,{autoClose:1000})
        }
        if (isProd)Sentry.captureException(error)

      }
    }
   
   const filteredItems = data.activities.filter(item => {
    
     return selectedCategory === 'All'|| item?.category === selectedCategory  ;
    })
   
    
      const handlePageChange = (newPage) => {
        fetchActivities(newPage, data.pagination?.limit);
      };
    
      const handleItemsPerPageChange = (newLimit) => {
      
        fetchActivities(1, newLimit); // Reset to page 1 when changing limit
      };
    
      

  
    
  let filteredCategories = [];
  switch (user.role) {
    case "QHSE_coordinator":
      filteredCategories = categories?.filter(cat => cat.name === "HSE_materials");
      break;

    case "Environmental_lab_manager":
    case "lab_supervisor":
      filteredCategories=categories?.filter(cat => cat.name === "lab_items");
      break;
    case "admin":
      filteredCategories=categories?.filter(cat=>cat.name==="Office_items")
      break;
      
    default:
      filteredCategories = categories; // admins see all
      break;
    }


      useEffect(() => {
      if (filteredCategories.length === 1) {
        fetchActivities(data.pagination.page, data.pagination.limit, filteredCategories[0]);
      } else {
        fetchActivities(data.pagination.page, data.pagination.limit); // fallback if no filter
      }
    
      fetchcategory();
    }, [refreshFlag]);
    return(  
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">ActivityLog</h2>
      <div className="space-y-4">
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Filter by Category:</label>
         <select
          name="category"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
            {access_free_roles.includes(user.role) &&<option value="All">All Categories</option>}  
            {(Array.isArray(categories) && categories.length > 0) ? (
            filteredCategories.map((category) => (
              <option key={category?._id || category?.name} value={category?.name || ""}>
                {category?.name || "Unnamed Category"}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>

        </div>
        {filteredItems.length > 0 ? (
          filteredItems.map((activity, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{activity.action} {activity?.itemName} </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  <div className="flex  ">
                      <p className="text-sm text-gray-500 mr-4">
                        Modified by:{activity?.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.category}
                      </p>
                  </div>
                </div>
                <div className='flex justify-between'>

                  <span className={`px-2 py-1 mr-3 text-xs rounded-full  ${
                    activity.action === 'Added' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                    {activity.quantity} {activity.unit || 'units'}
                  </span>
                  
                  <button 
                  onClick={(e)=>{
                    e.stopPropagation()
                    DeleteLog(activity._id)
                  }}
                  className='hover:translate-x-2'>
                     <Trash2 className='w-5 h-5 text-red-500 cursor-pointer'/>
                  </button>
                  


                </div>
              </div>
              {activity.user && (
                <p className="text-xs text-gray-400 mt-1">
                  By {activity.user}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
      <div>
      {/* Your data display */}
      <PaginationControls
        currentPage={data.pagination?.page}
        totalPages={data.pagination?.totalPages}
        itemsPerPage={data.pagination?.limit}
        totalItems={data.pagination?.total}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        isLoading={isLoading}
      />
    </div>
    </div>
  );
};




export default RecentActivity