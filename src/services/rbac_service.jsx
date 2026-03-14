import axios from "axios"
import * as Sentry from "@sentry/react"
import { isProd } from "../components/env";


axios.interceptors.response.use(
  response => response,
  error => {
    const excludedurls=[
      "/api/access",
      "/api/admin-user/login",
      "/api/csrf-token"
    ]
    const request_url=error?.config.url ||""

    const shouldHandlerrors=!excludedurls.some(ex=>request_url.includes(ex))
    if (!error.response && shouldHandlerrors) {
      window.location.href = "/adminlogin";
    }
    return Promise.reject(error);
  }
);
export const fetch_RBAC_ALL=async()=>{
      try{
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ALLROLES:true},{headers: {
                "ngrok-skip-browser-warning": "true",
              },
              withCredentials: true,
            })
            return rbacRes
            
      }catch(error){
        if (error.message === "Network Error" || error.code === "ERR_NETWORK"){
                                window.location.href = '/adminlogin';
                              }else if (error.response?.status===401|| error.response?.status===403){
                                                     
                                //localStorage.removeItem('sessionId');
                                
                                window.location.href = '/adminlogin'; 
                              }else{
                                
                                if (isProd)Sentry.captureException(error);
                               
                              }
       
  
      }
}

export const fetch_RBAC=async()=>{
      try{


          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ADMIN_ROLES_GENERAL:true,PROTECTED_USERS:true},{headers: {
                "ngrok-skip-browser-warning": "true",
              },
              withCredentials: true,
            })
            return rbacRes
            
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

export const fetch_RBAC_DASH=async()=>{
  try{

     const token = localStorage.getItem('sessionId');
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ADMIN_ROLES_DASHBOARD:true,GENERAL_ACCESS:true,DEPARTMENTAL_ACCESS:true},{headers: {
                Authorization: `Bearer ${token}`,
                 
                "ngrok-skip-browser-warning": "true",
              },
              withCredentials: true,
            })
    return rbacRes

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

export const fetch_RBAC_ordermanagement=async()=>{
  try{

     const token = localStorage.getItem('sessionId');
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ADMIN_ROLES_GENERAL:true,GENERAL_ACCESS_ORDERS:true,DEPARTMENTAL_ACCESS:true,APPROVALS_LIST:true,EDITING_ROLES:true,DELETIONROLES:true},{headers: {
                Authorization: `Bearer ${token}`,
            
                "ngrok-skip-browser-warning": "true",
              },
              withCredentials: true,
            })
    return rbacRes

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
export const fetch_RBAC_department=async()=>{
  try{

     const token = localStorage.getItem('sessionId');
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ADMIN_ROLES_DEPARTMENT:true},{headers: {
                Authorization: `Bearer ${token}`,
                
                "ngrok-skip-browser-warning": "true",
              },
              withCredentials: true,
            })
    return rbacRes

  }catch(error){
    if (error.message === "Network Error" || error.code === "ERR_NETWORK"){
                            window.location.href = '/adminlogin';
    }else if (error.response?.status===401|| error.response?.status===403){
                           
      //localStorage.removeItem('sessionId');
      
      window.location.href = '/adminlogin'; 
    }else{
      
      if (isProd)Sentry.captureException(error);
     
    }
  }
}

