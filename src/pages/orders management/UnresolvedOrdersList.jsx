import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../components/usercontext';
import * as Sentry from "@sentry/react"
import { AnimatePresence } from 'framer-motion';
import { isProd } from '../../components/env';
import { toast } from 'react-toastify';
import PaginationControls from '../../components/Paginationcontrols';
import ReviewVerification from '../../components/ReviewVerification';
const UnresolvedOrdersList = () => {
  const [formdata,setformdata]=useState({
    date:'yesterday'
  })

  const {user}=useUser()
    const [Data, setData] = useState({
      orders: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    });
    const [isLoading, setIsLoading]=useState(false)

  const getOrders=async(page=Data.pagination.page,limit=Data.pagination.limit)=>{
    try{
      setIsLoading(true)
      const userId=user.userId
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      const response=await axios.get(`${API_URL}/orders/unresolvedorders`,{params:{
        date:formdata.date,page,limit,userId
      },withCredentials:true})

      setData((prev)=>({
        ...prev,
        orders:response.data.data,
        pagination:response.data.Pagination
      }))


    }catch(error){
      if (error.response?.status===401|| error.response?.status===403){
          toast.error("Session expired. Please log in again.");

          
          window.location.href = '/adminlogin'; 
      }
      
      if(isProd){
        Sentry.captureMessage("An error occured in Unresolved Orders")
        Sentry.captureException(error)
      }
    }finally{
      setIsLoading(false)
    }
  }

  const ApproveOrders=async(data,orderId)=>{
    try{
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      await axios.put(`${API_URL}/orders/${orderId}/approve`,data,{withCredentials:true})
          
      getOrders()


    }catch(error){
      if (error.response?.status===401){
          toast.error("Session expired. Please log in again.");

          
          window.location.href = '/adminlogin'; 
      }
      if(isProd){
        Sentry.captureMessage("An error occured in Unresolved Orders")
        Sentry.captureException(error)
      }
      if(error.response?.status===403){
            toast.error(error.response.data.message)
      }

    }
  }
  useEffect(()=>{
    getOrders()
  },[formdata.date])
  
  
  

  const UnresolvedOrders = Data?.orders?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


  const [expandedOrder, setExpandedOrder] = useState(null);

  const handlePageChange =async (newPage) => {
   
    getOrders(newPage, Data.pagination?.limit,);
  };

  const handleItemsPerPageChange = async(newLimit) => {
    
    getOrders(1, newLimit); // Reset to page 1 when changing limit
  };
  
  const toggleExpand = (orderId) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
    
  };
  const handleDateChange=(date)=>{
    setformdata((prev)=>({
      ...prev,
      date:date
    }))


  }

  if (isLoading) {
    return   <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }
  const renderOrderDetails=(order)=>{
    return (

      <>
      <div 
      
      className="p-3 bg-gray-50 rounded-lg">
        <div className='flex justify-between'>

          <p className="font-semibold text-gray-700">
            Current Status: <span className="ml-2">{order.status==="Approved"? "Partially Approved":order.status}</span>
          </p>
          {order.PendingApprovals.some((user_)=>user_.Reviewer?._id===user.userId)&&
          (<button 
            onClick={(e)=>{
              e.stopPropagation()

              ApproveOrders({adminName:user.name},order._id)          
            }}
          className=' text-white rounded-lg p-1 bg-blue-600 font-semibold hover:translate-x-3 hover:translate-y-3'>
            Approve
          </button>)
          }
        </div>
          <p className="text-gray-600"><span className="font-medium">Requested By:</span> {order.staff?.name}</p>
              <p className="text-gray-600"><span className="font-medium">Employee Email:</span> {order.staff?.email}</p>
          <p className="text-gray-600"><span className="font-medium">Employee Department:</span> {order.staff?.Department}</p>
          {order.PendingApprovals?.length > 0 && (
  <div className="text-gray-600 mt-3">
    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-t-lg border border-blue-100">
      <p className="font-medium text-blue-800 flex items-center">
        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Pending Approvals ({order.PendingApprovals?.length})
      </p>
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        Awaiting Action
      </span>
    </div>
    <div className="max-h-32 overflow-y-auto border border-t-0 border-blue-100 rounded-b-lg">
      <ul className="divide-y divide-blue-50">
        {order.PendingApprovals.map((user, index) => (
          <li key={index} className="px-3 py-2 hover:bg-blue-50 transition-colors duration-150">
            <div className="flex items-center">
              <div className="relative flex-shrink-0 mr-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                  {user.Reviewer?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-white"></span>
              </div>
              <div>
                <p className="font-medium text-gray-700">{user.Reviewer.name}</p>
                <p className="text-xs text-gray-500">Pending since {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
         </div>
       </div>
     )}

          
      </div>

      </>

    )
  }
  
  

  return (
    <div
    
     className='p-4 bg-gray-200 rounded-lg mt-3'>

    <div className="container mx-auto px-0 py-8 overflow-x-auto">
      <div className='flex justify-between'>

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Unresolved Requests 
      </h2>
      <div>
        
        <select
        value={formdata.date}
        onChange={(e)=>handleDateChange(e.target.value)}
         className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="yesterday">yesterday</option>
          <option value="Last 7 Days" >Last 7 Days</option>
          <option value="Last 30 Days" >Last 30 days</option>
          <option value="Last 365 Days"> last 365 days</option>
             

        </select>

      </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <div className='border-2 rounded-xl'> 
            {UnresolvedOrders?.length===0?(
              <div className="text-center py-8 text-gray-500">
                No Unresolved Requests Found
              </div>

            ):(
              
            <div  className='space-y-1 overflow-y-scroll'>
            {UnresolvedOrders?.map((order) => (
              <div  onClick={()=>toggleExpand(order._id)}
               key={order._id}
               
               >

               <div
               className="flex justify-between  border rounded-xl p-4 hover:border-blue-500 cursor-pointer">
                <div>
                  <p className='font-bold'>{order.Title}</p>
                  <p className='font-light'>{order.orderNumber}</p>
                </div>
                <div className='flex items-center '>
                  <p className="text-sm text-gray-600">
                    {order.orderedBy} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                 </div>
              <AnimatePresence>
            {expandedOrder === order._id && renderOrderDetails(order)}
            </AnimatePresence>
              </div>
          ))}
            
 
          </div>
            )}
          
          </div>
        </div>

        {/* Pagination */}{
          ( UnresolvedOrders?.length>6)&&(

            <PaginationControls
            currentPage={Data.pagination?.page}
            totalPages={Data.pagination?.totalPages}
            itemsPerPage={Data.pagination?.limit}
            totalItems={Data.pagination?.total}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            isLoading={isLoading}
            />
          )
            
        }
        
    </div>
    </div>
    </div>
  );
};

export default UnresolvedOrdersList;
