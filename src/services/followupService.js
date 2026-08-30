import axios from "axios";

const API = () => `${process.env.REACT_APP_API_URL}/api`;
const cfg = { withCredentials: true, headers: { "ngrok-skip-browser-warning": "true" } };

// Follow-ups the current user SENT (requester dashboard card).
export const getSentFollowups = () => axios.get(`${API()}/orders/followups/sent`, cfg).then((r) => r.data?.data || []);

// Follow-ups the current user RECEIVED as a notified approver (approver card).
export const getReceivedFollowups = () => axios.get(`${API()}/orders/followups/received`, cfg).then((r) => r.data?.data || []);

// Escalated requests the current user can act on (pending reviewer). Same
// "awaiting your action" audience as received follow-ups.
export const getEscalatedReceived = () => axios.get(`${API()}/orders/followups/escalated`, cfg).then((r) => r.data?.data || []);

// All follow-ups on a specific request (activity timeline).
export const getFollowupsForOrder = (orderId) => axios.get(`${API()}/orders/${orderId}/followups`, cfg).then((r) => r.data?.data || []);

// Send a follow-up on an existing request. Throws (with server message) on 400/403/404/429.
export const sendFollowup = (orderId, note) =>
  axios.post(`${API()}/orders/${orderId}/followup`, { note: note || undefined }, cfg).then((r) => r.data?.data);

export const followupError = (error, fallback = "Couldn't send follow-up") =>
  error?.response?.data?.message || error?.message || fallback;
