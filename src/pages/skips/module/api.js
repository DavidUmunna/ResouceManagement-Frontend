import axios from "axios";

// Central API client for the Skip Tracking module. Every call goes through the
// shared axios config: withCredentials (session cookie) + the implicit CSRF
// header, matching the rest of the ERP.

const API = () => `${process.env.REACT_APP_API_URL}/api`;
const cfg = {
  withCredentials: true,
  headers: { "ngrok-skip-browser-warning": "true" },
};

// unwrap { success, data } / { success, items } envelopes
const data = (res) => res.data;

// ── Skips ────────────────────────────────────────────────────────────────────
export const listSkips = (params = {}) =>
  axios.get(`${API()}/skips`, { ...cfg, params }).then(data);
export const getSkip = (id) => axios.get(`${API()}/skips/${id}`, cfg).then(data);
export const registerTag = (id, rfidTag) =>
  axios.post(`${API()}/skips/${id}/register-tag`, { rfidTag }, cfg).then(data);
export const assignDeliveryTruck = (id, truckId) =>
  axios.put(`${API()}/skips/${id}/assign-delivery-truck`, { truckId }, cfg).then(data);
export const assignCollectionTruck = (id, truckId) =>
  axios.put(`${API()}/skips/${id}/assign-collection-truck`, { truckId }, cfg).then(data);
export const scanSkip = (skipTag, scanType) =>
  axios.post(`${API()}/skips/scan`, { skipTag, scanType }, cfg).then(data);
export const manualScan = (skip_id, scanType, reason) =>
  axios.post(`${API()}/skips/manual-scan`, { skip_id, scanType, reason }, cfg).then(data);
export const setRental = (id, payload) =>
  axios.put(`${API()}/skips/${id}/rental`, payload, cfg).then(data);
export const setSkipProject = (id, projectId) =>
  axios.put(`${API()}/skips/${id}/project`, { projectId }, cfg).then(data);
export const returnSkip = (id) => axios.put(`${API()}/skips/${id}/return`, {}, cfg).then(data);
// Create a skip via the legacy flat endpoint (accepts optional rental fields).
export const createSkip = (payload) => axios.post(`${API()}/skiptrack/create`, payload, cfg).then(data);

// ── Trucks & Drivers ─────────────────────────────────────────────────────────
export const listTrucks = (params = {}) => axios.get(`${API()}/trucks`, { ...cfg, params }).then(data);
export const getTruck = (id) => axios.get(`${API()}/trucks/${id}`, cfg).then(data);
export const createTruck = (payload) => axios.post(`${API()}/trucks`, payload, cfg).then(data);
export const updateTruck = (id, payload) => axios.put(`${API()}/trucks/${id}`, payload, cfg).then(data);
export const assignDriverToTruck = (id, driverId) =>
  axios.put(`${API()}/trucks/${id}/assign-driver`, { driverId }, cfg).then(data);

// Site approvers (staff view — for assigning a manifest's approver + admin mgmt).
export const listSiteApprovers = (params = {}) => axios.get(`${API()}/site-approvers`, { ...cfg, params }).then(data);
export const createSiteApprover = (payload) => axios.post(`${API()}/site-approvers`, payload, cfg).then(data);
export const updateSiteApprover = (id, payload) => axios.put(`${API()}/site-approvers/${id}`, payload, cfg).then(data);

export const listDrivers = (params = {}) => axios.get(`${API()}/drivers`, { ...cfg, params }).then(data);
export const getDriver = (id) => axios.get(`${API()}/drivers/${id}`, cfg).then(data);
export const createDriver = (payload) => axios.post(`${API()}/drivers`, payload, cfg).then(data);
export const updateDriver = (id, payload) => axios.put(`${API()}/drivers/${id}`, payload, cfg).then(data);

// ── Waybills ─────────────────────────────────────────────────────────────────
export const listWaybills = (params = {}) => axios.get(`${API()}/waybills`, { ...cfg, params }).then(data);
export const getWaybill = (id) => axios.get(`${API()}/waybills/${id}`, cfg).then(data);
export const createWaybill = (payload) => axios.post(`${API()}/waybills`, payload, cfg).then(data);
export const approveWaybill = (id, otp) =>
  axios.put(`${API()}/waybills/${id}/approve`, { otp }, cfg).then(data);
export const rejectWaybill = (id, reason, otp) =>
  axios.put(`${API()}/waybills/${id}/reject`, { reason, otp }, cfg).then(data);

// ── Manifests ────────────────────────────────────────────────────────────────
export const listManifests = (params = {}) => axios.get(`${API()}/manifests`, { ...cfg, params }).then(data);
export const getManifest = (id) => axios.get(`${API()}/manifests/${id}`, cfg).then(data);
export const createManifest = (payload) => axios.post(`${API()}/manifests`, payload, cfg).then(data);
export const attachManifestSkips = (id, skipIds) =>
  axios.put(`${API()}/manifests/${id}/attach-skips`, { skipIds }, cfg).then(data);
// Fetch the manifest PDF as a blob (sends the auth cookie) and open it in a tab.
export const openManifestPdf = async (id) => {
  const res = await axios.get(`${API()}/manifests/${id}/pdf`, { ...cfg, responseType: "blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ── Projects ─────────────────────────────────────────────────────────────────
export const listProjects = (params = {}) => axios.get(`${API()}/projects`, { ...cfg, params }).then(data);
export const getProject = (id) => axios.get(`${API()}/projects/${id}`, cfg).then(data);
export const createProject = (payload) => axios.post(`${API()}/projects`, payload, cfg).then(data);
export const updateProject = (id, payload) => axios.put(`${API()}/projects/${id}`, payload, cfg).then(data);
export const getRevenue = (params = {}) => axios.get(`${API()}/projects/revenue`, { ...cfg, params }).then(data);

// ── Suppliers (existing endpoint — reused as the vendor list for "rented from") ─
// Returns a plain array of suppliers; we surface the active ones.
export const listSuppliers = () => axios.get(`${API()}/supplier`, cfg).then((res) => res.data);

// ── Internal 2FA (existing OTP endpoint) ─────────────────────────────────────
// Generates + emails a 6-digit approval code to the current user. The :id path
// param is unused server-side (the OTP is per-user), but kept for route shape.
export const sendApprovalOtp = (id) =>
  axios.post(`${API()}/otp/${id}/send-otp`, {}, cfg).then(data);

// ── Compliance (existing v2 read endpoint) ───────────────────────────────────
export const listComplianceLogs = (params = {}) =>
  axios.get(`${API()}/v2/compliance/logs`, { ...cfg, params }).then(data);

// ── Helpers ──────────────────────────────────────────────────────────────────
// Turn an axios error into a specific, user-facing message (stale-state handling).
export const errMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
