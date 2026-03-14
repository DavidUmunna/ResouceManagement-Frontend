import React from 'react';
import Navbar from './nav';
import Hero from './Hero';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const Resourcelanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <motion.section
        className="bg-white py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Feature 1: Request Tracking */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-7 h-7 text-indigo-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                    M9 5a2 2 0 002 2h2a2 2 0 002-2
                    M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Request Tracking
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Easily track Requests with status updates and approval workflows.
              </p>
            </motion.div>

            {/* Feature 2: Real-time Updates */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-7 h-7 text-indigo-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M12 8v4l3 3
                    m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-time Updates
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Get instant notifications for Requests changes and approvals.
              </p>
            </motion.div>

            {/* Feature 3: Analytics Dashboard */}
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-7 h-7 text-indigo-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10
                    m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14
                    a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Analytics Dashboard
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Visualize spending patterns and resource allocation with powerful charts.
              </p>
            </motion.div>
            
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-gradient-to-r from-gray-800 to-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-6">
            <span className="block">Ready to streamline your resources?</span>
          </h2>
          
          <p className="text-xl leading-8 text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of teams managing their orders efficiently with ResourceFlow.
          </p>
          
          <motion.button
            onClick={() => navigate("/companydata")}
            className="mt-4 px-8 py-4 border border-transparent text-lg font-semibold rounded-lg 
                      text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 
                      transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Today
          </motion.button>
          
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-white border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            
            <span className="text-2xl font-bold text-indigo-600">
              ResourceFlow
            </span>
            
            <p className="text-gray-600 text-base">
              © 2025 ResourceFlow. All rights reserved.
            </p>
            
          </div>
          
        </div>
      </motion.footer>
      
    </div>
  );
};

export default Resourcelanding;