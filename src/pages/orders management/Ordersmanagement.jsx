/* eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from "@sentry/react"
import { useUser } from '../../components/usercontext';
import { useState, useEffect } from 'react';
import OrderList from './OrderList';
import Duplicates from './Duplicates';
import { get_user_orders } from '../../services/OrderService';
import UnresolvedOrdersList from './UnresolvedOrdersList';
import axios from 'axios';
import PaginationControls from "../../components/Paginationcontrols";
import { fetch_RBAC_ordermanagement } from '../../services/rbac_service';
import { isProd } from "../../components/env";

const OrdersDashboard = ({setAuth}) => {
  const {user}=useUser()
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  //const [filteredorders,setfilteredorders]=useState([])

  const [Data, setData] = useState({
    orders: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  });
 
  const [ADMIN_ROLES_GENERAL,set_ADMIN_ROLES_GENERAL]=useState([])
  const [accRoles,set_ACC_ROLES]=useState([])
  const [EditingRoles,setEditingRoles]=useState([])
  const [deletionRoles,setDeletionRoles]=useState([])
 

   const rbac_=async()=>{
      try{
          setIsLoading(true)
          const response=await fetch_RBAC_ordermanagement()
  
           const data=response.data.data

           set_ADMIN_ROLES_GENERAL(data.ADMIN_ROLES_GENERAL)
           set_ACC_ROLES(data.APPROVALS_LIST)
           setEditingRoles(data.EDITING_ROLES)
           setDeletionRoles(data.DELETIONROLES)
          return data
      }catch(error){
        if(isProd)Sentry.captureException(error)
      }finally{
        setIsLoading(false)
      }
    }
  const fetchData = async (page=Data.pagination?.page,limit=Data.pagination?.limit,rbacData={}) => {
    setIsLoading(true);
    try {
        const { GENERAL_ACCESS_ORDERS = [], DEPARTMENTAL_ACCESS = [], APPROVALS_LIST=[] } = rbacData;
        let response;

        
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        if (GENERAL_ACCESS_ORDERS.includes(user?.role)) {
          const res = await axios.get(`${API_URL}/orders`, {
              params: { 
                role:user?.role,
                page, limit },
              headers: {
                
                "ngrok-skip-browser-warning": "true"
              },
              withCredentials: true
            });

            response=res.data.data||[]
          
        
          setData({
            orders: response,
            pagination: res.data.Pagination
          })

        }else if(DEPARTMENTAL_ACCESS.includes(user?.role)) {
          
            if (!user?.Department) return;

            const API_URL = `${process.env.REACT_APP_API_URL}/api`;
            const department_response = await axios.get(`${API_URL}/orders/department`, {
              params: {
                Department: user.Department,
                page,
                limit,
              },headers:{
                "ngrok-skip-browser-warning": "true"},
              withCredentials: true, // If you're using cookies/session
            });
    
          
            response=department_response.data.data||[]
            
            setData({
              orders:response,
              pagination:department_response.data.Pagination
            })
         

        }else if(APPROVALS_LIST.includes(user?.Department)){

            const API_URL = `${process.env.REACT_APP_API_URL}/api`;
            const accounts_response = await axios.get(`${API_URL}/orders/accounts`, {
              params: {
                
                page,
                limit,
              },headers:{ 
                "ngrok-skip-browser-warning": "true"},
              withCredentials: true, // If you're using cookies/session
            });
    
          
            response=accounts_response.data.data||[]
            
            setData({
              orders:response,
              pagination:accounts_response.data.Pagination
            })
         


        }
        else {
          const res = await get_user_orders(user?.userId,page,limit);
          response = res.orders.data||[];
          
          setData({
              orders:response,
              pagination:res.orders.Pagination
            })
        }
        
        if (Array.isArray(response)) {
          setOrders(response);
          
          
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        if (err.response?.status===401|| err.response?.status===403){
          setError("Session expired. Please log in again.");

          
          window.location.href = '/adminlogin'; 
        }else{
          
          if(isProd)Sentry.captureException(err);
          setError("Failed to load orders. Please try again later.");
        }
        
        // Redirect to login page
      } finally {
        setIsLoading(false);
      }
    };
  
  useEffect(() => {
    const init=async()=>{
      try{

        setIsLoading(true)
        const rbacData=await rbac_();
        if (rbacData && user) {
          await fetchData(Data.pagination?.page, Data.pagination?.limit, rbacData);
        }
      }catch(error){
        setError("An Error Occurred")
      }finally{
        setIsLoading(false)
      }
    }
    init();
  }, [user,setAuth]);

  //const paginated_orders=orders.slice(startIndex,endIndex)
  //const totalPages = Math.ceil(orders.length / itemsperpage);
  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    // Optional: Scroll to the selected order
    const element = document.getElementById(`order-${orderId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const RefreshRequest=async ()=>{
    try{
      setIsLoading(true)
      const rbacData=await rbac_();
        if (rbacData && user) {
          await fetchData(Data.pagination?.page, Data.pagination?.limit, rbacData);
        }
     
    }catch(error){
      setError("There was an error while updating ")
    }finally{
      setIsLoading(false)
    }

  }
 
  
  
  const handlePageChange =async (newPage) => {
    const rbacData=await rbac_();
    fetchData(newPage, Data.pagination?.limit,rbacData);
  };

  const handleItemsPerPageChange = async(newLimit) => {
    const rbacData=await rbac_();
    fetchData(1, newLimit,rbacData); // Reset to page 1 when changing limit
  };
  

  if (isLoading) {
    return   <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }
const shouldShowRightColumn =
  (ADMIN_ROLES_GENERAL?.includes(user?.role) || user?.role === "accounts") &&
  (Duplicates || UnresolvedOrdersList);

return (
  <div
    className={`flex flex-col lg:flex-row gap-6 p-4 mt-10 h-[calc(100vh-5rem)] mb-9 ${
      !shouldShowRightColumn ? 'justify-center' : ''
    }`}
  >
    <div className={`overflow-y-auto ${
      shouldShowRightColumn ? 'w-full lg:w-2/3' : 'w-full lg:w-2/3'
    }`}>
      <OrderList
        orders={orders}
        selectedOrderId={selectedOrderId}
        setSelectedOrderId={setSelectedOrderId}
        setOrders={setOrders}
        error={error}
        setError={setError}
        RefreshRequest={RefreshRequest}
        accRoles={accRoles}
        EditingRoles={EditingRoles}
        DeletionRoles={deletionRoles}
      />
      <div>
        <PaginationControls
          currentPage={Data.pagination?.page}
          totalPages={Data.pagination?.totalPages}
          itemsPerPage={Data.pagination?.limit}
          totalItems={Data.pagination?.total}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={isLoading}
        />
      </div>
    </div>

    {shouldShowRightColumn && (
      <div className="w-full lg:w-1/3 flex flex-col justify-center">
        {Duplicates && (
          <div className={`${UnresolvedOrdersList ? 'flex-1' : 'flex justify-center items-center h-full'}`}>
            <Duplicates orders={orders} onOrderSelect={handleOrderSelect} />
          </div>
        )}
        {UnresolvedOrdersList && (
          <div className={`${Duplicates ? 'flex-1' : 'flex justify-center items-center h-full mb-10'}`}>
            <UnresolvedOrdersList/>
          </div>
        )}
      </div>
    )}
  </div>
);


};

export default OrdersDashboard;