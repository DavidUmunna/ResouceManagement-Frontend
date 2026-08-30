import * as Sentry from "@sentry/react"
import  {  useState,useEffect } from "react";

import {

  updateOrderStatus,
  deleteOrder,
  downloadFile,
  escalateOrder,
  deescalateOrder,
  recordPayment,
  downloadReceipt,
  getShareLink,

} from "../../services/OrderService";
import SignatureModal from "../../components/SignatureModal";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { FaFilePdf,FaInfoCircle, FaFile, FaTrash, 
  FaEllipsisV, FaCheck, FaTimes, FaClock, FaComment,FaTimesCircle, FaMoneyBillWave, FaSignature, FaShareAlt } from "react-icons/fa";
import { FiDownload,FiEdit2  } from "react-icons/fi";
import { useUser } from "../../components/usercontext";
import Searchbar from "./searchbar";
import axios from "axios";
import { useSelector } from "react-redux";
import ExportMemoModal from "./ExportMemoModal";
import MoreInformationResponse from "./MoreInformationResponse";
import SkipsToast from "../skips/skipsToast";
import DownloadStatus from "../../components/Downloadstatus";
import ReviewVerification from "../../components/ReviewVerification";
import { toast } from "react-toastify";
import { isProd } from "../../components/env";
import EditOrderModal from "./EditOrderModal";
import { DeleteConfirmationModal } from "../../components/DeleteConfirmationModal";
import { PAYMENT_ROLES, PAYMENT_DEPTS } from "../../constants/roles";

// Relative time, e.g. "just now", "3 hours ago", "2 days ago"
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const then = new Date(dateStr);
  if (isNaN(then.getTime())) return "";
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const OrderList = ({orders,setOrders, selectedOrderId,setSelectedOrderId ,error, setError ,RefreshRequest,accRoles, EditingRoles,DeletionRoles}) => {
  const { keyword, status, dateRange, orderedby } = useSelector(
    (state) => state.search
  );
  const { user } = useUser();
  //const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsByOrder, setCommentsByOrder] = useState({});
  const [ResponseByOrder, setResponseByOrder] = useState({});
  const [openCommentOrderId, setOpenCommentOrderId] = useState(null);
  const [isVisible, setIsVisible]=useState(false)
  const [Toast, setToast] = useState({ show: false,type:null ,message: '' });
  const [ExportOpen, setIsExportOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [OpenResponseOrderId,setOpenResponseOrderId]=useState(null)
  const [responseText, setResponseText] = useState("");
  const [responses, setResponses] = useState([]);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [StatusState,setStatusState]=useState("")
  const [RVModalOpen, setRVModalOpen] = useState(false);
  const [isOpen,setIsOpen]=useState(false)
  const [signature, setSignature] = useState(null);
  const [EditingModalId,setEditingModalId]=useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadingDownload, setLoadingDownload]=useState({selectedOrderId:'',status:false})
  const [payModalOrder, setPayModalOrder] = useState(null);
  const [payForm, setPayForm] = useState({ reference: '', channel: 'bank_transfer', paidAt: '', amount: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [shareData, setShareData] = useState(null); // { orderId, url }
  const [sharingId, setSharingId] = useState(null);
  const getOverallStatus = (approvals, Department,role) => {
    if (!approvals || approvals.length === 0) return "Pending";
    if (approvals.some(a => a.status === "Rejected")) return "Rejected";
    if (approvals.some(a => a.status === "Completed")) return "Completed";
    const approvalCount = approvals.filter(a => a.status === "Approved").length;
    
    let REQUIRED_APPROVALS=2;
   
  
    switch (Department) {
      case "waste_management_dep":
        if(role==="Waste Management Manager"){
          REQUIRED_APPROVALS=2;
      }else{
          REQUIRED_APPROVALS = 4;
        }        
        break;
      case "Environmental_lab_dep":
        if (role==="Environmental_lab_manager"){

          REQUIRED_APPROVALS = 2;
        }else{
          REQUIRED_APPROVALS=3;
        }
        break;
        default:
          REQUIRED_APPROVALS = 2;
        }

      const hasMoreInfo = approvals.some(a => a.status === "More Information");
      const hasAwaitingFunding = approvals.some(a => a.status === "Awaiting Funding");
      
      if (approvalCount >= REQUIRED_APPROVALS) return "Approved";
      if (approvalCount > 0 && !hasMoreInfo && !hasAwaitingFunding) return "Partially Approved";
      if (hasMoreInfo && !hasAwaitingFunding) return "More Information";
      if (hasAwaitingFunding) return "Awaiting Funding";
  
    return "Pending";
  };
  
  const getStatusExplanation = (approvals,Department,role,pendingApprovals) => {
    const status = getOverallStatus(approvals,Department,role);
    
    const approvalsCount = Array.isArray(approvals)?approvals?.filter(a => a.status === "Approved").length : 0;

    
    let REQUIRED_APPROVALS=3;
    
    switch (Department) {
      case "waste_management_dep":
        if(role==="Waste Management Manager"){
            REQUIRED_APPROVALS = 2;
        }else{
          REQUIRED_APPROVALS=4
        }
        break;
      case "Environmental_lab_dep":
        if (role==="Environmental_lab_manager"){
            REQUIRED_APPROVALS = 2;
        }
        break;
      default:
        REQUIRED_APPROVALS = 3;
        break;
    }

    
    switch(status) {
      case "Approved":
        return `Approved by ${approvalsCount} administrator(s)`;
      case "Partially Approved":
        return `Partially approved (${approvalsCount} of ${REQUIRED_APPROVALS} required approvals)`;
      case "Rejected":
        const rejectors = approvals?.filter(a => a.status === "Rejected").map(a => a.admin).join(", ");
        return `Rejected by ${rejectors}`;
      case "More Information":
        return `More Information required`
      case "Awaiting Funding":
        return `Request Awaiting Funding`
      default:
        return "Awaiting review";
    }
  };
  

 
 

  const filterOrders = (orders, filters) => {
    const { orderedby, keyword, status, dateRange } = filters;
  
    
    return orders.filter((order) => {
      if (orderedby && order.orderedBy.toLowerCase() !== orderedby.toLowerCase()) {
        return false;
      }
      
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchTerm);
        const matchesOrderedBy = order.staff.name?.toLowerCase().includes(searchTerm);
        const matchesTitle = order.Title?.toLowerCase().includes(searchTerm);
        const matchDepartment=order.staff.Department.toLowerCase().includes(searchTerm)
        
        if (!matchesOrderNumber && !matchesOrderedBy && !matchesTitle && !matchDepartment) {
          return false;
        }
      }
      
      if (status && order.status !== status) {
        return false;
      }
      
      if (dateRange?.start && dateRange?.end) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  useEffect(()=>{
    let Timer;
    if (error){
      setIsVisible(true)
      Timer=setTimeout(()=>{
        setIsVisible(false)
      },3000)
    }
   
    return ()=>clearTimeout(Timer)


  },[error])

 

 useEffect(() => {
  if (selectedOrderId) {
    setCommentsByOrder(prev => ({
      ...prev,
      [selectedOrderId]: "" // Clear comment for this specific order
    }));
    setResponseByOrder(prev=>({
      ...prev,
      [selectedOrderId]:""
    }))
  }
  
}, [selectedOrderId]);

  const handleCommentChange = (orderId) => (e) => {
    setCommentsByOrder(prev => ({
    ...prev,
    [orderId]: e.target.value
  }));
  };

 const handleCommentSubmit = (orderId) => (e) => {
    e.preventDefault();
  
    setOpenCommentOrderId(null);
    setToast({ show: true, type:'success', message: 'Comment saved successfully!' });
    setTimeout(() => setToast({ show: false, type:null, message: '' }), 3000);

  };
  const updateOrderStatus_Specific = async (endpoint, data,orderId) => {
    try{
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      await axios.put(`${API_URL}/orders/${orderId}/${endpoint}`, data, { withCredentials: true });
    }catch(error){
      
      if(isProd)Sentry.captureException(error)
      if(error.response?.status===403){
      toast.error(error.response.data.message)


    }
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
  try {
    
  
    setIsLoading(true);

    
    
    // Get the comment for this specific order
    const orderComment = commentsByOrder[orderId] || '';

    
    // Optimistic update
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              Approvals: (() => {
                const existingApprovals = Array.isArray(order.Approvals) ? order.Approvals : [];
                const filteredApprovals = existingApprovals.filter(a => a.admin !== user.name);

                return [
                  ...filteredApprovals, 
                  {
                    admin: user.name,
                    status: newStatus,
                    comment: orderComment, // Use the specific order comment
                    timestamp: new Date().toISOString()
                  }
                ]
              })()
            } 
          : order
      )
      return updatedOrders.sort((a,b) => {
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (a.status !== "Completed" && b.status === "Completed") return -1;
        return 0;
      })
    });

    // First update the general status
    await updateOrderStatus(orderId, newStatus);
    
    // Then send specific approve/reject requests
    
    if (newStatus === "Approved") {
    
      await updateOrderStatus_Specific("approve", {

        adminName: user.name,
        comment: orderComment,
        SignatureData:signature,
        orderId,
      },orderId);
    } else if (newStatus === "Rejected") {
      await updateOrderStatus_Specific("reject", {
        
        adminName: user.name,
        comment: orderComment,
        orderId,
      },orderId);
    } else if (newStatus === "Completed") {
    
      await updateOrderStatus_Specific("completed", { orderId },orderId);
    } else if (newStatus === "More Information") {
     
      await updateOrderStatus_Specific("MoreInfo", {
        
        adminName: user.name,
        comment: orderComment,
        orderId,
      },orderId);
    } else if(newStatus==="Awaiting Funding") {
      
      await updateOrderStatus_Specific("funding",{
        adminName:user.name,
        comment:orderComment,
        orderId
      },orderId)
    }


    RefreshRequest()
    
  } catch (error) {
    if(isProd){

      Sentry.captureMessage("Error updating status")
      Sentry.captureException(error)
    }

    setError("Failed to update order status");
    const orderComment = commentsByOrder[orderId] || '';
    // Revert changes if API call fails
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: order.status,
              Approvals: Array.isArray(order.Approvals) ? order.Approvals?.filter(approval => 
                approval.admin !== user.name || approval.status !== newStatus || approval.comment !== orderComment
              ) : []
            } 
          : order
      )
    );
    if(error.response?.status===403){
      toast.error(error.response.data.message)


    }
     if (error.response?.status===401){
          
      setError("Session expired. Please log in again.");
      //localStorage.removeItem('sessionId');
      
      window.location.href = '/adminlogin';}
  } finally {
    setIsLoading(false);
    setDropdownOpen(null);
  }
};



  const handleDelete = async (orderId) => {
    try {
      setIsLoading(true);
      await deleteOrder(orderId);
      RefreshRequest()
      //setOrders(orders.filter(order => order._id !== orderId))

    } catch (error) {
      if(isProd){

        Sentry.captureMessage("Error updating status")
        Sentry.captureException(error)
      }
      setError("Failed to delete order");
    } finally {
      setIsLoading(false);
    }
  };
   
  const handleDeleteClick=(orderId)=>{
    setSelectedOrderId(orderId);
    setDeleteModalOpen(true);
  }

  const handleShare = async (e, order) => {
    e.stopPropagation();
    try {
      setSharingId(order._id);
      const url = await getShareLink(order._id);
      if (!url) throw new Error('no url');
      // Prefer the native share sheet (mobile → WhatsApp, etc.); fall back to a menu
      if (navigator.share) {
        try {
          await navigator.share({ title: `Purchase Order #${order.orderNumber}`, text: order.Title || 'Purchase Order', url });
          return;
        } catch { /* user cancelled or unsupported — fall through to menu */ }
      }
      setShareData({ orderId: order._id, url });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create share link');
    } finally {
      setSharingId(null);
    }
  };

  const handleEscalate = async (e, order) => {
    e.stopPropagation();
    try {
      await escalateOrder(order._id);
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, escalated: true } : o));
      toast.success('Order escalated — approvers have been notified');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to escalate order');
    }
  };

  const handleDeescalate = async (e, order) => {
    e.stopPropagation();
    try {
      await deescalateOrder(order._id);
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, escalated: false } : o));
      toast.success('Escalation removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove escalation');
    }
  };

  const openPayModal = (e, order) => {
    e.stopPropagation();
    const total = (order.products || []).reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0);
    setPayForm({
      reference: '',
      channel: 'bank_transfer',
      paidAt: new Date().toISOString().slice(0, 10),
      amount: total,
    });
    setPayModalOrder(order);
  };

  const handleRecordPayment = async () => {
    if (!payForm.reference.trim()) {
      toast.error('Payment reference is required');
      return;
    }
    setPayLoading(true);
    try {
      const result = await recordPayment(payModalOrder._id, payForm);
      toast.success('Payment recorded successfully');
      setOrders(prev =>
        prev.map(o =>
          o._id === payModalOrder._id
            ? { ...o, payment: { ...o.payment, ...result.payment } }
            : o
        )
      );
      setPayModalOrder(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    } finally {
      setPayLoading(false);
    }
  };

  
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    if (expandedOrder===null){
      setDropdownOpen(!dropdownOpen)
    }
  };

  const toggleDropdown = (orderId, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === orderId ? null : orderId);
  };
 
   const handleFileDownload = async (fileId,filename,OrderId) => {
 
    try {
      setError("");
      setDownloaded(0);
      setTotal(0);
      setLoadingDownload((prev)=>(
        {
          ...prev,
          selectedOrderId:OrderId,
          status:true
        }
        
      )
      );
      
      const fileData = await downloadFile(fileId,filename, (e) => {
      setDownloaded(e.loaded);
      setTotal(e.total || 0);
    });
      const url = window.URL.createObjectURL(new Blob([fileData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if(isProd){

        Sentry.captureMessage("Error updating status")
        Sentry.captureException(error)
      }
      setError("Failed to download file");
    } finally {
      setLoadingDownload(prev=>(
        {
          ...prev,
          selectedOrderId:'',
          status:false
        }
      ));
    }
  };

  

  

  const getStatusBadge = (order) => {
    let bgColor, textColor, icon;
    const status = order.status==="Completed"?order.status:order.status==="More Information"?order.status:getOverallStatus(order.Approvals,order.staff?.Department,order.staff?.role,order.PendingApprovals?.length);
    switch (status) {
      case "Approved":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <FaCheck className="mr-1" />;
        break;
      case "Rejected":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        icon = <FaTimes className="mr-1" />;
        break;
      case "Pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <FaClock className="mr-1" />;
        break;
      case "Completed":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <FaCheck className="mr-1" />;
        break;
      case "More Information":
        bgColor = "bg-yellow-100";       
        textColor = "text-yellow-800";   
        icon = <FaInfoCircle className="mr-1" />;  
        break;
      case "Remove Action":  
        bgColor = "bg-gray-100";       
        textColor = "text-gray-500";   
        icon = <FaTimesCircle className="mr-1" />;  
        break;
      case "Awaiting Funding":
        bgColor = "bg-purple-100";       
        textColor = "text-purple-800";   
        icon = <FaMoneyBillWave className="mr-1" />;  // Money/funding icon
        break;
      
        
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon} {status}
      </span>
    );
  };

  const renderOrderDetails = (order) => (
    <motion.div
      className="mt-4 space-y-3 text-sm"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      
      <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-700">
            Current Status: <span className="ml-2">{order.status==="Completed"?order.status:getOverallStatus(order.Approvals,order.staff?.Department,order.staff?.role,order.PendingApprovals.length)}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {getStatusExplanation(order.Approvals,order?.staff?.Department,order.staff?.role)}
          </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600"><span className="font-medium">Request Title:</span> {order.Title || "N/A"}</p>
          <p className="text-gray-600"><span className="font-medium">Request Number:</span> {order.orderNumber || "N/A"}</p>
          {order.supplier!=="Halden"&&(<p className="text-gray-600"><span className="font-medium">Supplier:</span> {order.supplier || "N/A"}</p>)}
          <p className="text-gray-600"><span className="font-medium">Requested By:</span> {order.staff?.name}</p>
          <p><span className="font-semibold">EditedBy:</span> {order?.EditedBy?.name || "N/A" }</p>
          <p className="text-gray-600"><span className="font-medium">Employee Email:</span> {order.staff?.email}</p>
          <p className="text-gray-600"><span className="font-medium">Employee Department:</span> {order.staff?.Department}</p>
        </div>
       <div>
  <p className="text-gray-600">
    <span className="font-medium">Date Created:</span> {new Date(order.createdAt).toLocaleDateString()}
  </p>

  {(
    <div className="text-gray-600 mt-2">
      <p className="font-medium">Review Actions:</p>

      {order.Approvals?.length > 0 ? (
        <ul className="mt-1 space-y-2 max-h-40 overflow-y-auto list-none ">
          {order.Approvals.map((a, index) => (
            <li key={index} className="bg-gray-100 p-2 rounded-lg shadow-sm">
              <p><span className="font-semibold">Admin:</span> {a.admin}</p>
              <p><span className="font-semibold">Status:</span> {a.status}</p>
              <p><span className="font-semibold">Time Reviewed:</span> {a.timestamp.split('T')[0]} ({a.timestamp.split('T')[1].split(".")[0]})</p>
              {a.comment && (
                <p><span className="font-semibold">Comment:</span> {a.comment}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No approvals yet.</p>
      )}
    </div>
  )}

  {/* Add the Pending Approvals section here */}
 {order.PendingApprovals?.length > 0 && (
  <div className="text-gray-600 mt-3">
    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-t-lg border border-blue-100">
      <p className="font-medium text-blue-800 flex items-center">
        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Pending Approvals ({order.PendingApprovals.length})
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

  <p className={`${order.urgency === "VeryUrgent" ? "text-red-600" : "text-gray-600"} mt-2`}>
    <span className="font-medium">Urgency:</span> {order.urgency}
  </p>
</div>

      </div>

      <div>
        <p className="font-medium text-gray-600">Products:</p>
        <ul className="mt-1 space-y-1">
          {order.products?.map((item, index) => (
            <li key={index} className="text-gray-600">
              • {item.name} (Qty: {item.quantity}, Price: ₦{item.price})
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-600">Files:</span>
        {order.filenames?.length > 0 ? (
          order.filenames.map((filename, index) => (
           

            <button
              key={index}
              onClick={(e) => handleFileDownload(order.fileRefs,filename,order._id)}
              className="flex items-center text-blue-600 hover:text-blue-800"
              >
              <FaFilePdf className="mr-1" /> {filename}
            </button>
           
            
          ))
        ) : (
          <span className="text-gray-500 flex items-center">
            <FaFile className="mr-1" /> No files attached
          </span>
        )}
      </div>
      {order.payment?.status === 'paid' && (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Payment Receipt:</span>
          <button
            onClick={(e) => { e.stopPropagation(); downloadReceipt(order._id, order.orderNumber); }}
            className="flex items-center gap-1.5 text-green-600 hover:text-green-800 text-sm"
            title="Download payment receipt"
          >
            <FaMoneyBillWave className="w-3.5 h-3.5" />
            {order.payment.reference} — Download Receipt
          </button>
        </div>
      )}

       {order.remarks && (
        <div>
          <p className="font-medium text-gray-600">Remarks:</p>
          <p className="text-gray-600">{order.remarks}</p>
        </div>
      )}
      <div className="flex  justify-between flex-wrap gap-2">

        {(accRoles?.includes(user.Department))&&(<button
          onClick={() => {
            setSelectedRequest(prev => prev === order ? null : order)
            setIsExportOpen(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
          <FileText className="h-4 w-4" />
          Export Memo
        </button>)}
        {order.Approvals?.some(a=>(a.status==="More Information" || a.status==="Rejected")) &&(

          
          <button
      
          onClick={()=> setOpenResponseOrderId(prev=>prev===order._id? null:order._id)}
       className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
       >
          Response
       
           {order.staffResponse.length > 0 && (
          <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {order.staffResponse.length}
          </span>
           )}
        </button>
          )
        }
      

        {(EditingRoles?.includes(user.role)&&(

          <div>
           <button 
             onClick={() => setEditingModalId(order._id)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
           >
             <FiEdit2 className="h-4 w-4" />
             Edit
           </button>
          </div>
            ))

        }
      </div>
     
    </motion.div>
  );
  const renderEmptyState = () => (
    <div className="p-8 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
        <FaFile className="h-5 w-5 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No Requests found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search filters or create a new Request
      </p>
    </div>
  );

  const displayedOrders = filterOrders(orders, {
    keyword,
    status,
    dateRange,
    orderedby,
  });

 

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      
      <div className="max-w-7xl mx-auto ">
        <motion.div 
          className=" mb-6  "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
            <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap gap-3">

          <Searchbar />
        
          </div>


        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border z-20 border-gray-200 overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          

          

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : displayedOrders.length === 0 ? (
            renderEmptyState()
          ) : (
            <motion.ul className="max-h-screen overflow-y-auto space-y-3 p-2 sm:p-3">
              <AnimatePresence>
                {displayedOrders.map((order) => (
                  <motion.li
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    id={`order-${order._id}`}
                    className={`relative p-4 border border-gray-200 bg-white rounded-lg cursor-pointer transition hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-md hover:z-10`}
                  >
                    <div 
                      className="p-4 sm:p-6 cursor-pointe"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800 ">
                              {(order.Title || "Untitled Order").length > 40
                               ? (order.Title || "Untitled Order").slice(0, 40) + "..."
                               : order.Title || "Untitled Order"}
                            </h3>
                            {getStatusBadge(order)}
                            {order.escalated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Escalated
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            #{order.orderNumber} • {order.orderedBy}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-500 text-right">
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">{timeAgo(order.createdAt)}</div>
                          </div>

                          {(() => {
                            const meId    = String(user?.userId || user?._id || user?.id || '');
                            const staffId = order.staff?._id ? String(order.staff._id) : String(order.staff ?? '');
                            const emailMatch = !!(user?.email && order.staff?.email && order.staff.email.toLowerCase() === user.email.toLowerCase());
                            const idMatch    = !!(meId && staffId && meId === staffId);
                            const isOwner    = emailMatch || idMatch;
                            const computedStatus      = getOverallStatus(order.Approvals, order.staff?.Department, order.staff?.role);
                            const isPending           = computedStatus === 'Pending';
                            const isPartiallyApproved = computedStatus === 'Partially Approved';

                            const svgIcon = (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            );

                            return (
                              <>
                                {/* Escalate: only owner, only while active */}
                                {(isPending || isPartiallyApproved) && isOwner && !order.escalated && (
                                  <button
                                    onClick={(e) => handleEscalate(e, order)}
                                    title="Escalate this order"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors bg-yellow-500 text-white hover:bg-yellow-600"
                                  >
                                    {svgIcon}
                                    Escalate
                                  </button>
                                )}
                                {/* De-escalate: owner or any approver */}
                                {order.escalated && (isOwner || user.canApprove) && (
                                  <button
                                    onClick={(e) => handleDeescalate(e, order)}
                                    title="Remove escalation"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
                                  >
                                    {svgIcon}
                                    De-escalate
                                  </button>
                                )}
                              </>
                            );
                          })()}

                          {/* Payment badge / record button */}
                          {order.payment?.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              <FaMoneyBillWave className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            (PAYMENT_ROLES.includes(user.role) || PAYMENT_DEPTS.includes(user.Department)) &&
                            order.status === 'Approved' && (
                              <button
                                onClick={(e) => openPayModal(e, order)}
                                title="Record payment receipt"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                              >
                                <FaMoneyBillWave className="w-3 h-3" />
                                Record Payment
                              </button>
                            )
                          )}

                          {order.filenames?.length > 0 && (
                            <div className="flex justify-between">

                              <button
                                onClick={(e) => handleFileDownload(order.fileRefs,order.filenames[0],order._id)}
                                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Download file"
                                >
                                <FiDownload />
                              </button>
                              {loadingDownload.selectedOrderId.toString()===String(order._id) &&(<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                               
                              )}
                            </div>
                          )}

                          <div className="relative ">
                              <button
                                onClick={(e) => toggleDropdown(order._id, e)}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors inset-0"
                                aria-label="Order actions"
                              >
                                <FaEllipsisV />
                              </button>
                          
                              <AnimatePresence>
                                {dropdownOpen === order._id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200"
                                  >
                                    <div className="py-1">
                                      {user.canApprove && (<>
                                      {["Pending", "Approved", "Rejected", "Completed","More Information", "Awaiting Funding"]
                                        .filter(
                                          (statusOption) =>

                                            statusOption !== "Completed" || accRoles?.includes(user?.Department)


                                        ).filter(
                                            (statusOption) =>


                                            statusOption !== "Awaiting Funding" || accRoles?.includes(user?.Department)
                                        )
                                        .map((statusOption) => (
                                          <div
                                            key={statusOption}
                                            className={`flex items-center w-full px-4 py-2 text-sm ${
                                              order.status === statusOption
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                          
                                              setRVModalOpen(true)
                                              setStatusState(statusOption)
                                           }}
                                          >
                                            <span className="mr-5">
                                              {statusOption === "Approved" && (
                                                <FaCheck className="text-green-500" />
                                              )}
                                              {statusOption === "Rejected" && (
                                                <FaTimes className="text-red-500" />
                                              )}
                                              {statusOption === "Pending" && (
                                                <FaClock className="text-yellow-500" />
                                              )}
                                              {statusOption === "More Information" && (
                                                <FaInfoCircle className="text-black" />
                                              )}
                                              {statusOption === "Completed" && accRoles?.includes(user?.Department) && (
                                                <FaCheck className="text-blue-500" />
                                              )}
                                              {(statusOption === "Awaiting Funding" && accRoles?.includes(user?.Department)) && (
                                                <FaMoneyBillWave className="text-yellow-600" />
                                              )}

                                            </span>
                                            {statusOption}
                                            
                                            {RVModalOpen&&(
                                             <ReviewVerification
                                             onClose={() => setRVModalOpen(false)}
                                             statusOption={StatusState}
                                             order={order}
                                             orderId={order._id}
                                             onSubmit={handleStatusChange}
                                               />
                                             )
                                             }
                                          </div>
                                        ))}
                                      {DeletionRoles.includes(user.role)&&(<button
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          
                                          handleDeleteClick(order._id);
                                        }}
                                      >
                                        <FaTrash className="mr-2" />
                                        Delete
                                      </button>)}
                                      <button 
                                        onClick={() => setIsOpen(true)} 
                                        className="flex items-center px-4 py-2 w-full text-sm text-blue-600 hover:bg-blue-50 "
                                      >
                                        <FaSignature className="mr-2"/>
                                        <span>Add Signature</span>
                                      </button>
                                       <button
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={() => setOpenCommentOrderId(prev => prev === order._id ? null : order._id)}
                                       >
                                        <FaComment className="mr-2" />
                                        <span>{openCommentOrderId === order._id ? 'Hide' : 'Add'} Comment</span>
                                      </button>
                                      </>)}
                                      {/* Share — available to everyone */}
                                      <button
                                        onClick={(e) => { handleShare(e, order); setDropdownOpen(null); }}
                                        disabled={sharingId === order._id}
                                        className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                      >
                                        <FaShareAlt className="mr-2" />
                                        <span>{sharingId === order._id ? 'Sharing…' : 'Share'}</span>
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                           

                          {openCommentOrderId===order._id && (
                            <div key={order._id}
                            id={`order-${order._id}`}

                              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                 <div 
                                   className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                                   onClick={e => e.stopPropagation()}  // prevent backdrop click
                                 >
                                <form onSubmit={handleCommentSubmit(order._id)} className="space-y-4" >
                                  <div>
                                    <label 
                                      htmlFor={`comment-${order._id}` }
                                      className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                      Make your comment here
                                    </label>
                                    <input
                                      
                                      type="text"
                                      name="comment"
                                      value={commentsByOrder[order._id] || ""}
                                      onChange={handleCommentChange(order._id)}
                                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Type your comment…"
                                      />
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                      Submit Comment
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>  setOpenCommentOrderId(prev => prev === order._id ? null : order._id)}
                                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                      >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                                </div>
                            </div>
                                )
                              }
                        {EditingModalId===order._id &&(
                          <EditOrderModal Order={order}
                          setEditingModalId={setEditingModalId}
                          setOrders={setOrders}
                          Onclose={(e)=>{

                            e.preventDefault()
                            setEditingModalId(null)
                          }
                          }
                          />

                        )

                        }

                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedOrder === order._id && renderOrderDetails(order)}
                      </AnimatePresence>
                    </div>

                    {OpenResponseOrderId===order._id && <MoreInformationResponse 
                    responseTesxt={responseText}
                    setResponseText={setResponseText}
                    responses={responses}
                    setResponses={setResponses}
                    setToast={setToast}
                    toast={Toast}
                    canApprove={user.canApprove}
                    setResponseByOrder={setResponseByOrder}
                    ResponseByOrder={ResponseByOrder}
                    order={order}
                    
                    selectedOrderId={order._id}
                    setIsLoading={setIsLoading}
                    RefreshRequest={RefreshRequest}
                    setOpenResponseOrderId={setOpenResponseOrderId}/>}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </motion.div>
        {isVisible && (
            <div className="p-4 flex  justify-center items-center  text-red-600 border-l-4 border-red-500 bg-red-200">
              {error}
            </div>
          )}
          {Toast.show && (
           <SkipsToast toast={Toast} 
           setToast={setToast}/>
          )}
         
         <ExportMemoModal
           isOpen={ExportOpen}
           onClose={()=>setIsExportOpen(false)}
           requestId={selectedRequest?._id}
           requestTitle={selectedRequest?.Title}
          />
           <SignatureModal 
           isOpen={isOpen} 
           onClose={() => setIsOpen(false)} 
           onSave={(sig) => setSignature(sig)} 
         />
          <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        orderId={selectedOrderId}
        />

        {/* Payment receipt recording modal */}
        {payModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Record Payment</h2>
              <p className="text-sm text-gray-500">
                {payModalOrder.Title} &mdash; {payModalOrder.orderNumber}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Reference *</label>
                  <input
                    type="text"
                    placeholder="e.g. TRF/2025/001234"
                    value={payForm.reference}
                    onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Channel</label>
                  <select
                    value={payForm.channel}
                    onChange={e => setPayForm(f => ({ ...f, channel: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount Paid (₦)</label>
                  <input
                    type="number"
                    value={payForm.amount}
                    onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payForm.paidAt}
                    onChange={e => setPayForm(f => ({ ...f, paidAt: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPayModalOrder(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={payLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-60"
                >
                  {payLoading ? 'Saving…' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share PO link */}
        {shareData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShareData(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Share Purchase Order</h2>
                <button onClick={() => setShareData(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">×</button>
              </div>
              <p className="text-xs text-gray-500 break-all bg-gray-50 border border-gray-200 rounded-lg p-2">{shareData.url}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareData.url)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent('Purchase Order')}&body=${encodeURIComponent(`View the purchase order:\n${shareData.url}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                >
                  Outlook
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Purchase Order')}&body=${encodeURIComponent(`View the purchase order:\n${shareData.url}`)}`}
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                >
                  Email
                </a>
                <button
                  onClick={() => { navigator.clipboard?.writeText(shareData.url); toast.success('Link copied'); }}
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Opens a read-only PDF of this PO. Link is valid for 7 days — anyone with it can view the order.
              </p>
            </div>
          </div>
        )}

          {isLoading && total > 0 && (
            <DownloadStatus
              downloadedBytes={downloaded}
              totalBytes={total}
              label={`Downloading file`}
            />
          )}
         

      </div>
    </div>
  );
};

export default OrderList;
