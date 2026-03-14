import React from "react";
import { motion } from "framer-motion";
import HeroImage from "../../components/assets/management.jpeg"; // adjust if needed

const Hero = () => {
  return (
    <motion.section
      className="w-full bg-gradient-to-br from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text Section */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Simplify Your{" "}
              <span className="text-indigo-600">Resource Management</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Track Requests, manage approvals, and optimize resources in one powerful platform 
              designed for modern teams.
            </p>
            
            {/*<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg 
                          hover:bg-indigo-700 transition-colors duration-300 
                          transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
              
              <motion.button
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg 
                          hover:bg-gray-50 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </div>*/}
          </motion.div>

          {/* Right: Image Section */}
          <motion.div
            className="flex justify-center"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative md:ml-32">
              <img
                src={HeroImage}
                alt="Resource Management Dashboard"
                className="w-full max-w-lg rounded-2xl shadow-2xl"
              />
              
              {/* Optional: Add a decorative element */}
              <motion.div
                className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-100 rounded-2xl -z-10"
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </div>
          </motion.div>
          
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;