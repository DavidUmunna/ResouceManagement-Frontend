import React from 'react';
import Navbar from './nav';
import Hero from './Hero';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import CookieConsent from '../../components/CookieConsent';

const STATS = [
  { value: '10k+', label: 'Requests processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '30+', label: 'Teams onboarded' },
  { value: '24/7', label: 'Support' },
];

const STEPS = [
  {
    step: '1',
    title: 'Create your workspace',
    body: 'Register your organisation and invite your team in minutes — no complex setup required.',
  },
  {
    step: '2',
    title: 'Submit & route requests',
    body: 'Staff raise purchase and resource requests that are automatically routed to the right approvers.',
  },
  {
    step: '3',
    title: 'Approve & track',
    body: 'Approvers act with one click, and everyone gets real-time status updates and full audit history.',
  },
];

const Resourcelanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Trust / Stats band */}
      <section className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-indigo-100">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Get up and running in three simple steps — from setup to full visibility over every request.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                className="relative bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-6">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-2xl font-bold text-white">ResourceFlow</span>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-xs">
                A secure platform for managing requests, approvals, and resources across your organisation.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigate("/companydata")} className="hover:text-white transition">Get Started</button></li>
                <li><Link to="/aboutus" className="hover:text-white transition">About Us</Link></li>
                <li><button onClick={() => navigate("/adminlogin")} className="hover:text-white transition">Log In</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/aboutus" className="hover:text-white transition">Our Story</Link></li>
                <li><Link to="/aboutus" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ResourceFlow. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">Built for modern teams.</p>
          </div>
        </div>
      </footer>

      {/* Cookie consent modal */}
      <CookieConsent />

    </div>
  );
};

export default Resourcelanding;