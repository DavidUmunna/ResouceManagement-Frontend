import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api`;

export const fetchTenders = async (params = {}) => {
  const response = await axios.get(`${API}/tenders`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const uploadTenderDoc = async (formData) => {
  const response = await axios.post(`${API}/tenders/upload`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchTenderChecklist = async (tenderId) => {
  const response = await axios.get(`${API}/tenders/${tenderId}/checklist`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateChecklistItem = async (tenderId, itemId, body) => {
  const response = await axios.patch(
    `${API}/tenders/${tenderId}/checklist/${itemId}`,
    body,
    { withCredentials: true }
  );
  return response.data;
};

export const fetchAIDraft = async (tenderId) => {
  const response = await axios.get(`${API}/tenders/${tenderId}/ai-draft`, {
    withCredentials: true,
  });
  return response.data;
};

export const saveDraft = async (tenderId, body) => {
  const response = await axios.put(`${API}/tenders/${tenderId}/draft`, body, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchComplianceIssues = async (tenderId) => {
  const response = await axios.get(
    `${API}/tenders/${tenderId}/compliance-issues`,
    { withCredentials: true }
  );
  return response.data;
};

export const exportTender = async (tenderId, format) => {
  const response = await axios.post(
    `${API}/tenders/${tenderId}/export`,
    { format },
    { withCredentials: true }
  );
  return response.data;
};
