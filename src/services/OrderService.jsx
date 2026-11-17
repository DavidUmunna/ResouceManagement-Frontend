import * as Sentry from "@sentry/react"
import axios from "axios";
import { isProd } from "../components/env";

const API_URL = `${process.env.REACT_APP_API_URL}/api`; //  backend URL
const orders="orders"



// Mint a 7-day public link to the PO's PDF
export const getShareLink = async (orderId) => {
  const res = await axios.post(`${API_URL}/${orders}/${orderId}/share-link`, {}, {
    headers: { "ngrok-skip-browser-warning": "true" },
    withCredentials: true,
  });
  return res.data?.url;
};

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


// ── Purchase-order submission (duplicate-protected) ──────────────────────────

/**
 * One key per submission attempt, sent as the Idempotency-Key header. Retrying
 * the same attempt reuses it (the server returns the order it already created);
 * changed content or a new attempt gets a new key. Format: [A-Za-z0-9-_].
 */
export const newIdempotencyKey = () => {
  const c = typeof window !== "undefined" ? window.crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

const orderRequestConfig = (idempotencyKey) => ({
  headers: { "ngrok-skip-browser-warning": "true", "Idempotency-Key": idempotencyKey },
  withCredentials: true,
});

/** Map a duplicate-protection response (or axios error) to a result, or null. */
const toDedupeResult = (status, data) => {
  if (status === 409 && data?.code === "POSSIBLE_DUPLICATE") {
    return {
      status: "duplicate",
      existingOrder: data.existingOrder || null,
      inProgress: !!data.inProgress,
      message: data.message,
    };
  }
  if (status === 422 && data?.code === "IDEMPOTENCY_KEY_REUSED") return { status: "key_reused" };
  return null;
};

const releasePrecheck = (idempotencyKey) =>
  axios
    .post(`${API_URL}/${orders}/precheck/release`, {}, orderRequestConfig(idempotencyKey))
    .catch(() => {}); // best-effort; the reservation also expires on its own

/**
 * Submit a purchase order: precheck (reserve) → upload attachment → create.
 *
 * The precheck runs BEFORE the upload so a duplicate is rejected before any
 * file is uploaded. Resolves to one of:
 *   { status: "created", order, replayed }      — 201, or 200 replay of this attempt
 *   { status: "duplicate", existingOrder, inProgress, message } — 409
 *   { status: "key_reused" }                    — 422 (caller should use a new key)
 * Throws on other errors (network, 401/403, 5xx) after releasing the reservation.
 *
 * @param {{ orderData: object, files?: File[], idempotencyKey: string,
 *           confirmDuplicate?: boolean, onStage?: (stage: "checking"|"uploading"|"creating") => void }} args
 */
export const submitPurchaseOrder = async ({ orderData, files = [], idempotencyKey, confirmDuplicate = false, onStage = () => {} }) => {
  const body = confirmDuplicate ? { ...orderData, confirmDuplicate: true } : { ...orderData };
  let reserved = false;

  // 1. Precheck — reserve this submission before uploading anything.
  onStage("checking");
  try {
    const pre = await axios.post(`${API_URL}/${orders}/precheck`, body, orderRequestConfig(idempotencyKey));
    if (pre?.data?.replayed) {
      return { status: "created", order: pre.data.newOrder, replayed: true };
    }
    reserved = true;
  } catch (error) {
    const result = toDedupeResult(error.response?.status, error.response?.data);
    if (result) return result;
    // 404: backend without the precheck endpoint — fall through to the
    // classic upload + create (still protected server-side on create).
    if (error.response?.status !== 404) throw error;
  }

  try {
    // 2. Upload the attachment(s).
    if (files.length > 0) {
      onStage("uploading");
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));
      const fileResponse = await axios.post(`${API_URL}/fileupload/create`, formData, {
        headers: { "Content-Type": "multipart/form-data", "ngrok-skip-browser-warning": "true" },
        withCredentials: true,
      });
      const fileId = fileResponse?.data?.files?._id;
      if (fileId) body.fileRefs = fileId;
    }

    // 3. Create the order.
    onStage("creating");
    const res = await axios.post(`${API_URL}/${orders}`, body, orderRequestConfig(idempotencyKey));
    return { status: "created", order: res.data?.newOrder, replayed: res.status === 200 };
  } catch (error) {
    const result = toDedupeResult(error.response?.status, error.response?.data);
    if (result) return result;
    // Abandoned attempt: free the reservation (no-op if the order was created).
    if (reserved) await releasePrecheck(idempotencyKey);
    if (isProd) {
      Sentry.captureMessage("Error creating order");
      Sentry.captureException(error);
    }
    throw error;
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


