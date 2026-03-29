// frontend/src/hooks/useStats.js
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.services';

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  return { stats, loading, error, refreshStats: loadStats };
};