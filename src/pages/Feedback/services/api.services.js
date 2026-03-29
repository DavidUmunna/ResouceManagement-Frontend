import axios from "axios";

// frontend/src/services/api.service.js
class ApiService {
  static instance = null;
  
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL ;
  }
  
  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  async request(endpoint,options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
   const response = await axios({
    url,
    method: options.method || 'get',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },withCredentials:true
  });
 
    const data = await response.data;
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data.data;
  }
  
  async createFeedback(data) {
    return this.request('/feedback', {
      method: 'POST',
      data
    });
  }
  
  async getAllFeedback(filter = null) {
    const queryString = filter ? `?${new URLSearchParams(filter)}` : '';
    return this.request(`/feedback${queryString}`);
  }
  
  async getFeedbackById(id) {
    return this.request(`/feedback/${id}`);
  }
  
  async updateFeedbackStatus(id, status) {
    return this.request(`/feedback/${id}/status`, {
      method: 'PATCH',
      data:{status}
    });
  }
  
  async deleteFeedback(id) {
    await this.request(`/feedback/${id}`, {
      method: 'DELETE',
    });
  }
  
  async getStats() {
    return this.request('/feedback/stats');
  }
}

export const apiService = ApiService.getInstance();