import axios from 'axios';
import * as Sentry from '@sentry/react';
import { isProd } from '../components/env';

const BASE = `${process.env.REACT_APP_API_URL}/api/v2/leave`;

const cfg = {
  withCredentials: true,
  headers: { 'ngrok-skip-browser-warning': 'true' },
};

function capture(msg, err) {
  if (isProd) {
    Sentry.captureMessage(msg);
    Sentry.captureException(err);
  }
}

export const createLeaveRequest = async (data) => {
  try {
    const res = await axios.post(`${BASE}/requests`, data, cfg);
    return res.data;
  } catch (err) {
    capture('Error creating leave request', err);
    throw err;
  }
};

export const getLeaveRequests = async (params = {}) => {
  try {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    const url = query ? `${BASE}/requests?${query}` : `${BASE}/requests`;
    const res = await axios.get(url, cfg);
    return res.data;
  } catch (err) {
    capture('Error fetching leave requests', err);
    throw err;
  }
};

export const approveLeaveRequest = async (id, adminComment = '') => {
  try {
    const res = await axios.put(`${BASE}/requests/${id}/approve`, { adminComment }, cfg);
    return res.data;
  } catch (err) {
    capture('Error approving leave request', err);
    throw err;
  }
};

export const rejectLeaveRequest = async (id, adminComment = '') => {
  try {
    const res = await axios.put(`${BASE}/requests/${id}/reject`, { adminComment }, cfg);
    return res.data;
  } catch (err) {
    capture('Error rejecting leave request', err);
    throw err;
  }
};

export const cancelLeaveRequest = async (id) => {
  try {
    const res = await axios.delete(`${BASE}/requests/${id}`, cfg);
    return res.data;
  } catch (err) {
    capture('Error cancelling leave request', err);
    throw err;
  }
};

export const deleteLeaveRequest = async (id) => {
  try {
    const res = await axios.delete(`${BASE}/requests/${id}/hard`, cfg);
    return res.data;
  } catch (err) {
    capture('Error deleting leave request', err);
    throw err;
  }
};

export const getMyBalance = async () => {
  try {
    const res = await axios.get(`${BASE}/balance`, cfg);
    return res.data;
  } catch (err) {
    capture('Error fetching leave balance', err);
    throw err;
  }
};

export const getUserBalance = async (userId) => {
  try {
    const res = await axios.get(`${BASE}/balance/${userId}`, cfg);
    return res.data;
  } catch (err) {
    capture('Error fetching user leave balance', err);
    throw err;
  }
};

export const updateEntitlement = async (userId, leaveType, entitlement) => {
  try {
    const res = await axios.put(`${BASE}/balance/${userId}`, { leaveType, entitlement }, cfg);
    return res.data;
  } catch (err) {
    capture('Error updating entitlement', err);
    throw err;
  }
};

export const exportLeaveRequests = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  const url = query ? `${BASE}/requests/export?${query}` : `${BASE}/requests/export`;
  const res = await axios.get(url, { ...cfg, responseType: 'blob' });
  const filename = `leave_requests_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([res.data]));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const getPolicy = async () => {
  try {
    const res = await axios.get(`${BASE}/policy`, cfg);
    return res.data;
  } catch (err) {
    capture('Error fetching leave policy', err);
    throw err;
  }
};

export const updatePolicy = async (values) => {
  try {
    const res = await axios.put(`${BASE}/policy`, values, cfg);
    return res.data;
  } catch (err) {
    capture('Error updating leave policy', err);
    throw err;
  }
};
