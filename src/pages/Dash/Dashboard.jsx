/* eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from '@sentry/react';
import UserDetails from "../UserDetails"
import React, { useState } from 'react';
import { useUser } from "../../components/usercontext";
import { useEffect } from "react";
import axios from "axios"
import { fetch_RBAC_DASH } from '../../services/rbac_service';
import UserDetailsSkeleton from '../../skeletons/UserDetails_skeleton';
import { motion } from 'framer-motion';
import { isProd } from '../../components/env';




export const Dashboard=()=>{
    const { user } = useUser();
    const [request,setRequest]=useState()
    const [orders,setorders]=useState([])
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [completedOrders, setcompletedOrders] = useState([]);
    const [MoreInformation,setMoreInformation]=useState([])
    const [DepartmentalAccess,setDepartmentalAccess]=useState([])
    const [GeneralAccess,setGeneralAccess]=useState([])
    const [isLoading, setIsLoading]=useState(false)


    const rbac_=async()=>{
      try{
        const response=await fetch_RBAC_DASH()
        const data=response.data.data

       
        return data
      }catch(error){
        if (error.message === "Network Error" || error.code === "ERR_NETWORK"){
            
                
                window.location.href = '/adminlogin';
              }else if (error.response?.status===401|| error.response?.status===403){
                                     
                //localStorage.removeItem('sessionId');
                
                window.location.href = '/adminlogin'; 
              }else{
                
                if(isProd)Sentry.captureException(error);
               
              }
      }
    }
    useEffect(()=>{


        const fetchorder=async (rbacData={})=>{ 
            if (!user || !user.email) return 

            try{ 
                  let response;
                  const {GENERAL_ACCESS=[],DEPARTMENTAL_ACCESS=[]}=rbacData
                  if (GENERAL_ACCESS.includes(user?.role)){
                
                    const API_URL = `${process.env.REACT_APP_API_URL}/api`
                 
                    const userReq=await axios.get(`${API_URL}/orders/DailyRequests`,{
                      withCredentials:true})
                     
                      response=userReq.data.data
                    }else if(DEPARTMENTAL_ACCESS.includes(user?.role)){
                      if (!user?.Department) return;
                      const API_URL = `${process.env.REACT_APP_API_URL}/api`
                      
                      const userReq=await axios.get(`${API_URL}/orders/DailyRequests`,{params: {
                        Department: user.Department,
                      },withCredentials:true})
                      
                      response=userReq.data.data
                    }else{
                      const API_URL = `${process.env.REACT_APP_API_URL}/api`
                      const userReq= await axios.get(`${API_URL}/orders/StaffRequests`,{params:{
                        userId:user.userId
                      }})
                      response=userReq.data.data
                     
                    }
                    if (Array.isArray(response)){
                          

                    setRequest(response)
                    setorders(response)

                    
                   
                    setApprovedOrders(response?.filter((order) => order.status === "Approved"));
                    setPendingOrders(response?.filter((order) => order.status === "Pending"));
                    setRejectedOrders(response?.filter((order) => order.status === "Rejected"));
                    setcompletedOrders(response?.filter((order) => order.status === "Completed"));
                    setMoreInformation(response?.filter((order)=>order.Approvals).filter((approval)=>approval.status==="More Information"))
               
                   

                 }else{
                  
                    Sentry.captureMessage("invalid format")
                 
                }
    
    
            
            }catch(error){
              if (error.response?.status===401|| error.response?.status===403){
                       
                        //localStorage.removeItem('sessionId');
                        
                        window.location.href = '/adminlogin'; 
                      }else{
                        
                        Sentry.captureException(error);
                       
                      }

    
            }
          }
           
     
          
      const init=async()=>{
        try{

          setIsLoading(true)
          const rbacData=await rbac_()
          if (rbacData){
            const {GENERAL_ACCESS=[],DEPARTMENTAL_ACCESS=[]}=rbacData
            setDepartmentalAccess(DEPARTMENTAL_ACCESS)
            setGeneralAccess(GENERAL_ACCESS)
            fetchorder(rbacData);
          }
        }catch(error){
          Sentry.captureException(error)
        }finally{
          setIsLoading(false)
        }
      }

      init();
            

    },[user])
   
  
   
    const request_length=(request)=>{
      return Array.isArray(request) ? request.length : 0;
    }
    const request_amount=request_length(request)

    

    
    
  
   

    return(
      <>
      {isLoading ? (<UserDetailsSkeleton/>):(

        
        <motion.div
        initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
         className=" min-h-screen bg-gray-300  mt-16">     
             
            <h1 className="text-3xl font-bold text-gray-800">Welcome {user?.name.split(" ")[1]}</h1>
            <p className="text-gray-600 mt-2">Manage your Requests efficiently.</p>
            <UserDetails user={user}   rejectedOrders={rejectedOrders||[]} request_amount={request_amount} 
            approvedOrders={approvedOrders||[]} pendingOrders={pendingOrders||[]} completedOrders={completedOrders||[]}
            MoreInformation={MoreInformation||[]} DepartmentalAcess={DepartmentalAccess}  GeneralAccess={GeneralAccess}
            />

            
            </motion.div>
          )
          }
          </>
    )
  
}



