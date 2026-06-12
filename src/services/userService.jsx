import * as Sentry from "@sentry/react"
import axios from "axios";
import { toast } from "react-toastify";
import { isProd } from "../components/env";


const API_URL = `${process.env.REACT_APP_API_URL}/api`

const route="users"



export const get_users = async (params = {}) => {
  try {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
    ).toString();
    const url = query ? `${API_URL}/${route}?${query}` : `${API_URL}/${route}`;
    const response = await axios.get(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    return response.data;
  } catch (error) {
    if (isProd) {
      Sentry.captureMessage('Error fetching users');
      Sentry.captureException(error);
    }
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
};

export const sendResetLink=async(email)=>{
  try{
    const response=await axios.put(`${API_URL}/${route}/reset`,{email},{headers:{ "ngrok-skip-browser-warning": "true"}})
    
    if (response.data?.success===true){
      
      return response
    }else{
      if (isProd)Sentry.captureMessage("user does not exist")
      
      
    }

  }catch(error){
    const response=error

    //console.error("an error occured:",error)
    return response
  }
}

export const createUser = async (userData) => {
    try {
      
     
      const response = await axios.post(`${API_URL}/${route}`,userData,{withCredentials:true});
      toast.success(response.data.message)
    
      return response.data;
    } catch (error) {
      
       if (error.response){
      
          toast.error(error.response.data.message)
        }
      if(isProd){

        Sentry.captureMessage("Error Creating users")
        Sentry.captureException(error)
      }
      
    }
  };
 

  export const updateUserpassword = async (token, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}/${route}/reset-password`, { token,newPassword });
      return response.data;
    } catch (error) {
      if(isProd){

        Sentry.captureMessage("Error updating password users")
        Sentry.captureException(error)
      }

      throw error; // Rethrow error for proper handling in calling function
    }
  };
  

export const updateUser= async (userId, payload) => {
    try {
    
      const response = await axios.put(`${API_URL}/${route}/${userId}/updateuser`,  payload,{withCredentials:true} );
     
      return response.data;
    } catch (error) {
      if(isProd){

        Sentry.captureMessage("Error updatng user")
        Sentry.captureException(error)
      }

    }
  };

export const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/${route}/${userId}`,{withCredentials:true});
    } catch (error) {
      if(isProd){

        Sentry.captureMessage("Error Deleting user")
        Sentry.captureException(error)
      }
      
    }
  };