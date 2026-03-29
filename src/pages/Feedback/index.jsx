// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { FeedbackForm } from './Components/FeedbackForm/FeedbackForm';
import { FeedbackList } from './Components/FeedbackList/FeedbackList';
import { Stats } from './Components/Stats/Stats';
import { useFeedback } from './Hooks/useFeedback';
import { useStats } from './Hooks/useStats';
function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const {
    loading: feedbackLoading,
    error: feedbackError,
    feedbacks,
    createFeedback,
    loadFeedbacks,
    updateStatus,
    deleteFeedback
  } = useFeedback();

  const { stats, loading: statsLoading, refreshStats } = useStats();

  useEffect(() => {
    if (activeTab === 'list') {
      loadFeedbacks();
    }
  }, [activeTab, loadFeedbacks]);
  
  const handleSubmit = async (data) => {
    await createFeedback(data);
    refreshStats();
    setActiveTab('list');
  };
  
  const handleStatusUpdate = async (id, status) => {
    await updateStatus(id, status);
    refreshStats();
  };
  
  const handleDelete = async (id) => {
    await deleteFeedback(id);
    refreshStats();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-700   mt-8">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Feedback & Issue Tracker
          </h1>
          <p className="text-lg text-purple-100">
            Help us improve by sharing your thoughts or reporting issues
          </p>
        </header>
      

          
          <div className="mb-8">
          <Stats stats={stats} loading={statsLoading} />
        </div>
      
        
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-purple-300">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
                activeTab === 'submit'
                  ? 'text-white border-b-2 border-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Submit Feedback
            </button>
           <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
                activeTab === 'list'
                  ? 'text-white border-b-2 border-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              View All Feedback
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          {activeTab === 'submit' && (
            <div className="max-w-2xl mx-auto">
              <FeedbackForm onSubmit={handleSubmit} loading={feedbackLoading} />
            </div>
          )}
          
          {activeTab === 'list' && (
            <div className="max-w-4xl mx-auto">
              {feedbackError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {feedbackError}
                </div>
              )}
              <FeedbackList
                feedbacks={feedbacks}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                loading={feedbackLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;