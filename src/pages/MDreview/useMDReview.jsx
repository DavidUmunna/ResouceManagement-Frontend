import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useMDReview = (scheduleId) => {
  const queryClient = useQueryClient();
  const API_URL = `${process.env.REACT_APP_API_URL}/api`;
  // Fetch schedule data
 const { 
  data: schedule, 
  isLoading, 
  isError,
  error: queryError 
} = useQuery(
  ['schedule', scheduleId],
  async () => {
    try {
      const response = await axios.get(
        `${API_URL}/scheduling/disbursement-schedules/${scheduleId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      // Transform Axios error into a consistent error object
      throw new Error(
        err.response?.data?.message || 
        err.message || 
        'Failed to fetch schedule'
      );
    }
  },
  {
    enabled: !!scheduleId,
    retry: 2, // Retry twice before failing
    onError: (error) => {
      // Log to error monitoring service
      console.error('Schedule fetch error:', error);
      // Optionally show toast notification
      toast.error(error.message);
    }
  }
);

  // Submit review mutation
  const reviewMutation = useMutation(
  async (reviewData) => {
    try {
      const response = await axios.patch(
        `${API_URL}/scheduling/disbursement-schedules/${scheduleId}/review`,
        reviewData,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || 
        'Failed to submit review. Please try again.'
      );
    }
  },
  {
    onSuccess: () => {
      queryClient.invalidateQueries('submittedSchedules');
      queryClient.invalidateQueries('onHoldRequests');
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      console.error('Review submission error:', error);
      toast.error(error.message);
    },
    retry: 1, // Retry once on failure
  }
);

  return {
    schedule,
    isLoading,
    reviewSchedule: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isLoading
  };
};