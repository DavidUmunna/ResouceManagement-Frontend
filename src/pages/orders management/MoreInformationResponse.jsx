import React, { useEffect, useState, useCallback } from "react";
import * as Sentry from "@sentry/react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import {X} from "lucide-react"
import { useUser } from "../../components/usercontext";
import { isProd } from "../../components/env";
const MoreInformationResponse = ({
  responseText,
  setResponseText,
  RefreshRequest,
  responses,
  setResponses,
  order,
  toast,
  canApprove,
  setIsLoading,
  setResponseByOrder,
  OpenResponseOrderId,
  ResponseByOrder,
  selectedOrderId,
  setToast,
  setOpenResponseOrderId
}) => {
  const { user } = useUser();
  const [approvalNames, setApprovalNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [admin, setAdmin] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const fetchAdminNames = useCallback(async (orderId) => {
    if (!orderId) return;
    
    setIsFetching(true);
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const response = await axios.get(`${API_URL}/orders/reviewed`, {
        params: { orderId },
        withCredentials: true,
      });

      setApprovalNames(response.data.data || []);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = '/adminlogin';
        return;
      }
      
      setError("Failed to load admin names");
      if (isProd)Sentry.captureException(error);
      console.error("Error fetching approval names:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const fetchData = async (orderId) => {
    if (!orderId) return;
    setIsFetching(true);
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const Datares = await axios.get(`${API_URL}/orders/staffresponses`, {
        params: { orderId }, 
        withCredentials: true
      });
      setResponses(Datares.data.data || []);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to fetch Responses",
        type: "error"
      });
      if (isProd)Sentry.captureException(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      fetchAdminNames(selectedOrderId);
      fetchData(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleResponseChange = (orderId) => (e) => {
    setResponseByOrder((prev) => ({
      ...prev,
      [orderId]: e.target.value
    }));
  };
  
  const handleResponseSubmit = async (e, orderId) => {
    e.preventDefault();
    if (!admin) {
      setToast({
        show: true,
        message: "Please select an admin",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const message = ResponseByOrder[orderId]?.trim();
      
      if (!message) {
        setToast({
          show: true,
          message: "Please enter a response before submitting",
          type: "error"
        });
        return;
      }

      await axios.put(
        `${API_URL}/orders/${orderId}/staffResponse`,
        { message, admin },
        { withCredentials: true }
      );

      setToast({
        show: true,
        message: "Response submitted successfully",
        type: "success"
      });
      
      // Reset form
      setResponseByOrder(prev => ({ ...prev, [orderId]: "" }));
      setAdmin("");
      
      // Refresh data
      await fetchData(selectedOrderId);
      RefreshRequest();
    } catch (error) {
      if (error.response?.status===401|| error.response?.status===403){
          setError("Session expired. Please log in again.");
          //localStorage.removeItem('sessionId');
          
          window.location.href = '/adminlogin'; 
      }
      setToast({
        show: true,
        message: "Failed to submit response",
        type: "error"
      });
      if(isProd)Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (orderId, responseId) => {
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const response = await axios.delete(`${API_URL}/orders/${orderId}/staffresponse`, {
        params: { responseId }, 
        withCredentials: true
      });
      
      if (response.data.success === true) {
        setToast({
          show: true,
          message: "Response deleted successfully",
          type: "success"
        });
        await fetchData(selectedOrderId);
        RefreshRequest()
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Error in deletion",
        type: "error"
      });
      if(isProd)Sentry.captureException(error);
    }
  };

  const handleCloseModal = (orderId) => {
    setOpenResponseOrderId(prev => prev === orderId ? null : orderId);
    setResponseByOrder(prev => ({ ...prev, [orderId]: "" }));
    setAdmin("");
  };

  if (!order) return null;
  if (toast){
    setTimeout(()=>(setToast({show:false,type:'',message:''})),3000)
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-800 p-4 text-white flex justify-between items-start gap-5">
          <div>

          <h3 className="text-lg font-semibold">Respond to More Information Decision</h3>
          <p className="text-sm opacity-90">ID: {order.orderNumber}</p>
          <p className="text-sm opacity-90">Title: {order.Title}</p>
          </div>
          <button 
              onClick={() => handleCloseModal(selectedOrderId)}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
         </button>

        </div>

        <div className="mt-4 border rounded-xl p-3 mx-5 mb-3">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Past Responses:</h3>

          {isFetching ? (
            <p className="text-sm text-gray-400">Loading responses...</p>
          ) : responses.length === 0 ? (
            <p className="text-sm text-gray-400">No responses yet.</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {responses.map((response) => (
                <li
                  key={response._id}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-gray-700"><strong>To:</strong> {response.admin}</p>                      
                    <p className="text-sm text-gray-700"><strong>Response:</strong> {response.message}</p>                      
                    <p className="text-sm text-gray-700"><strong>Date of Response:</strong> {new Date(response.timestamps).toLocaleDateString()}</p>
                  </div>
                  
                  {(canApprove || String(user.name)===String(order.staff?.name) ) &&(

                    <button
                    onClick={() => handleDelete(order._id, response._id)}
                    className="text-red-500 hover:text-red-700 text-xs p-1 "
                    disabled={isSubmitting}
                    >
                    <FaTrash />
                  </button>
                    )
                  }
                </li>
              ))}
            </ul>
          )}
        </div>
        {(String(user.name)===String(order.staff?.name) ) &&(

          <form onSubmit={(e) => handleResponseSubmit(e, order._id)} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admins Requesting Information
            </label>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              {isFetching ? (
                <p className="text-gray-500">Loading admins...</p>
              ) : approvalNames.length > 0 ? (
                <select
                  className="w-full p-2 bg-white rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  onChange={(e) => setAdmin(e.target.value)}
                  value={admin}
                  required
                >
                  <option value="">-- Select an admin --</option>
                  {approvalNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500">No admins found</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor={`response-${order._id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              id={`response-${order._id}`}
              rows="4"
              value={ResponseByOrder[order._id] || ""}
              onChange={handleResponseChange(order._id)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your response here..."
              disabled={isSubmitting}
              required
              />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => handleCloseModal(order._id)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
              >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting || isFetching}
              >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Submitting...
                </>
              ) : "Submit Response"}
            </button>
          </div>
        </form>
          )
        }
       
      </div>
    </div>
  );
};

export default MoreInformationResponse;