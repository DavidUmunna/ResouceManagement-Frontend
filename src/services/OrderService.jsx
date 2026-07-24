import * as Sentry from "@sentry/react"
import axios from "axios";
import { isProd } from "../components/env";

const API_URL = `${process.env.REACT_APP_API_URL}/api`; //  backend URL
const orders="orders"



export const getOrders = async (page , limit ) => {
  try {


    const response = await axios.get(`${API_URL}/${orders}`,{
      params: { page, limit },
      headers:{
        
       
      "ngrok-skip-browser-warning":"true"},
      withCredentials:true});
    //console.log("response",response)
    return response.data;
  } catch (error) {
    if(isProd){

      Sentry.captureMessage("Error fetching orders")
      Sentry.captureException(error)
    }

    return [];
  }
};export const get_user_orders = async ( userId ,page,limit) => {
 
  try {
    const requests = [];

    if (userId) {
      const token=localStorage.getItem("sessionId")
      requests.push(axios.get(`${API_URL}/${orders}/${userId}`,{ params: {
                
                page,
                limit,
              },headers:{"x-session-id":token},withCredentials:true,"ngrok-skip-browser-warning": "true"}));
     
    }
    
    const results = await Promise.allSettled(requests);
   

    const orderResponse = results[0].status === "fulfilled" ? results[0].value : null;
    

    return { orders: orderResponse?.data };
  } catch (error) {
    if(isProd){

      Sentry.captureMessage("Error fetching orders")
      Sentry.captureException(error)
    }

    return {};
  }
};


export const createOrder = async ({ formData, orderData }) => {
  try {
    let uploadedFileIds = [];
    //const token_csrf = getCookie('XSRF-TOKEN');
    
    // STEP 1: Upload files if present
  
    if (formData && formData.has("file")) {
      const fileResponse = await axios.post(`${API_URL}/fileupload/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
          
      },withCredentials:true}
    );

      // Extract file IDs from response
      uploadedFileIds = fileResponse?.data?.files?._id; //the file Id is gotten and attatched tot he oerderdata for use as fileRef
    }

    // STEP 2: Attach file IDs if available
    if (uploadedFileIds.length > 0) {
      orderData.fileRefs = uploadedFileIds;
    }

    //  STEP 3: Always send order
    const orderResponse = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
       
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials:true
    });

    return {
      file: uploadedFileIds,
      order: orderResponse,
    };
  } catch (error) {
    if(isProd){

      Sentry.captureMessage("Error creating order");
      Sentry.captureException(error);
    }
    return {
      file: null,
      order: null,
      error,
    };
  }
};



export const updateOrderStatus = async (orderId, status) => {
  try {
    
    const response = await axios.put(`${API_URL}/${orders}/${orderId}`, { status },{headers:{"ngrok-skip-browser-warning": "true"},
      withCredentials:true});
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
  }
};
export const downloadFile = async (fileId,filename,onProgress) => {
  try {
   
    const response_2 = await axios.get(`${API_URL}/fileupload/download/${fileId}/${filename}`,{responseType: "blob" ,
      onDownloadProgress: (e) => {
      if (onProgress) onProgress(e);
    },
      headers:{ "ngrok-skip-browser-warning": "true"}});
    return response_2.data;
  } catch (err) {
    if (isProd) Sentry.captureException(err)
    
  }
};

export const deleteOrder = async (orderId) => {
  try {
    //const token_csrf = getCookie('XSRF-TOKEN');
    await axios.delete(`${API_URL}/${orders}/${orderId}`,
      {withCredentials:true});
  } catch (error) {
    if(isProd){

      Sentry.captureMessage("Error deleting  orders")
      Sentry.captureException(error)
    }

  }
};

export const escalateOrder = async (orderId) => {
  const response = await axios.put(
    `${API_URL}/${orders}/${orderId}/escalate`,
    {},
    { withCredentials: true, headers: { 'ngrok-skip-browser-warning': 'true' } }
  );
  return response.data;
};

export const deescalateOrder = async (orderId) => {
  const response = await axios.put(
    `${API_URL}/${orders}/${orderId}/deescalate`,
    {},
    { withCredentials: true, headers: { 'ngrok-skip-browser-warning': 'true' } }
  );
  return response.data;
};

export const recordPayment = async (orderId, { reference, channel, paidAt, amount }) => {
  const response = await axios.post(
    `${API_URL}/${orders}/${orderId}/pay/record`,
    { reference, channel, paidAt, amount },
    { withCredentials: true, headers: { 'ngrok-skip-browser-warning': 'true' } }
  );
  return response.data; // { success, payment }
};

export const downloadReceipt = async (orderId, orderNumber) => {
  const response = await axios.get(
    `${API_URL}/${orders}/${orderId}/pay/receipt`,
    { responseType: 'blob', withCredentials: true, headers: { 'ngrok-skip-browser-warning': 'true' } }
  );
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${orderNumber}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const getSpendByDepartment = async (params = {}) => {
  const response = await axios.get(`${API_URL}/${orders}/analytics/purchase-orders/by-department`, {
    params,
    withCredentials: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  return response.data;
};

export const getSpendByStatus = async (params = {}) => {
  const response = await axios.get(`${API_URL}/${orders}/analytics/purchase-orders/by-status`, {
    params,
    withCredentials: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  return response.data;
};

export const getSpendSummary = async (params = {}) => {
  const response = await axios.get(`${API_URL}/${orders}/analytics/purchase-orders/spend-summary`, {
    params,
    withCredentials: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  return response.data;
};


