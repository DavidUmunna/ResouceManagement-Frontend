// frontend/src/hooks/useFeedback.js
import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api.services';
import { useUser } from '../../../components/usercontext';
import { fetch_RBAC_feedback } from '../../../services/rbac_service';
export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackAdminRoles, setFeedbackAdminRoles] = useState(null);
  const {user}=useUser()

  // RBAC is the source of truth for who may manage all feedback
  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch_RBAC_feedback();
      setFeedbackAdminRoles(res?.data?.data?.FEEDBACK_ADMIN_ROLES || []);
    };
    loadRoles();
  }, []);

  const isFeedbackAdmin = Array.isArray(feedbackAdminRoles) && feedbackAdminRoles.includes(user?.role);
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
      const data = isFeedbackAdmin
        ? await apiService.getAllFeedback(filter)
        : await apiService.getFeedbackById(user.userId);
      setFeedbacks(data);
    } catch (err) {
      setError(err.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }, [isFeedbackAdmin, user?.userId]);
  
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
    canManage: isFeedbackAdmin,
    createFeedback,
    loadFeedbacks,
    updateStatus,
    deleteFeedback,
  };
};