// services/scheduleService.js
export const fetchSchedule = async (scheduleId) => {
  const API_URL = `${process.env.REACT_APP_API_URL}`;
  const response = await axios.get(`${API_URL}/api/scheduling/disbursement-schedules/${scheduleId}`);
  return response.data;
};

export const submitReview = async (scheduleId, reviewData) => {
  const API_URL = `${process.env.REACT_APP_API_URL}`;
  const response = await axios.patch(
    `${API_URL}/api/scheduling/disbursement-schedules/${scheduleId}/review`,
    reviewData
  );
  return response.data;
};