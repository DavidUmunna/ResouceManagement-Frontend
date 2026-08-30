// frontend/src/components/FeedbackForm/FeedbackForm.jsx
import React, { useState } from 'react';
import { FeedbackType } from '../../constants/Feedback.constants';

export const FeedbackForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    type: FeedbackType.ISSUE,
    title: '',
    description: '',
    email: '',
    priority: 3,
  });
  
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await onSubmit(formData);
      setFormData({
        type: FeedbackType.ISSUE,
        title: '',
        description: '',
        email: '',
        priority: 3,
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Feedback</h2>
      
      <div className="mb-4">
        <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
          Feedback Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value={FeedbackType.ISSUE}>Issue/Bug</option>
          <option value={FeedbackType.IMPROVEMENT}>Improvement/Suggestion</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief summary of your feedback"
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          placeholder="Please provide detailed information..."
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>
      
      {formData.type === FeedbackType.ISSUE && (
        <div className="mb-6">
          <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">
            Priority: {formData.priority}/5
          </label>
          <input
            id="priority"
            name="priority"
            type="range"
            min="1"
            max="5"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </form>
  );
};