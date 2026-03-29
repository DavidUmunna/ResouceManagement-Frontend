// frontend/src/hooks/useFeedback.js
import { useState, useCallback } from 'react';
import { apiService } from '../services/api.services';
import { useUser } from '../../../components/usercontext';
export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const {user}=useUser()
  const createFeedback = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const feedback = await apiService.createFeedback(data);
      setFeedbacks(prev => [feedback, ...prev]);
      return feedback;
    } catch (err) {
      setError(err.message || 'Failed to create feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadFeedbacks = useCallback(async (filter = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let data ;
      
      user.role==="global_admin"? data=await apiService.getAllFeedback(filter):
      data=await apiService.getFeedbackById(user.userId)
      setFeedbacks(data);
    } catch (err) {
      setError(err.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await apiService.updateFeedbackStatus(id, status);
      setFeedbacks(prev =>
        prev.map(f => f.id === id ? updated : f)
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteFeedback = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteFeedback(id);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    error,
    feedbacks,
    createFeedback,
    loadFeedbacks,
    updateStatus,
    deleteFeedback,
  };
};