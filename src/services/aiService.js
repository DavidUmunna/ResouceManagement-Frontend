import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/ai`;

const handleError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;
  throw new Error(message);
};

export const predictMaintenance = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/predict-maintenance`, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch maintenance prediction.");
  }
};

export const interpretLabResults = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/interpret-lab`, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to interpret lab results.");
  }
};

export const optimizeLogistics = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/optimize-logistics`, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to optimize logistics.");
  }
};

export const generateReport = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/generate-report`, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to generate report.");
  }
};
