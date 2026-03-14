import React, { useEffect, useState, useCallback } from "react";
import { createUser } from "../services/userService";
import { Eye, EyeOff } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import { fetch_RBAC_ALL } from "../services/rbac_service";
import * as Sentry from "@sentry/react";
import { FiX } from "react-icons/fi";
import { isProd } from "../components/env";

const AddUserModal = ({ onClose }) => {
  const [ALLROLES, set_ALLROLES] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    Department: "",
    password: "",
    role: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoized function to fetch roles
  const fetchAllRoles = useCallback(async () => {
    try {
      const response = await fetch_RBAC_ALL();
      set_ALLROLES(response.data.data.ALL_ROLES || []);
    } catch (error) {
      if (isProd) {
        Sentry.captureException(error);
        Sentry.captureMessage("Error fetching roles");
      }
    }
  }, []);

  useEffect(() => {
    fetchAllRoles();
  }, [fetchAllRoles]);

  // Handle error visibility with timeout
  useEffect(() => {
    if (error) {
      setIsErrorVisible(true);
      const timer = setTimeout(() => {
        setIsErrorVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const user_data = await createUser(formData);

      if (user_data) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          Department: "",
          password: "",
          role: ""
        });
        setError("");
        // Optionally close modal or show success message
      } else {
        setError("User was not created");
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Session Expired. Please refresh the page");
        setTimeout(() => {
          window.location.href = '/adminlogin';
        }, 2000);
      } else {
        setError("Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Departments list to avoid repetition
  const departments = [
    { value: "waste_management_dep", label: "Waste Management Department" },
    { value: "PVT", label: "PVT Department" },
    { value: "Environmental_lab_dep", label: "Environmental Lab Department" },
    { value: "accounts_dep", label: "Accounts Department" },
    { value: "Human resources", label: "Human Resources" },
    { value: "IT", label: "Information Technology" },
    { value: "Administration", label: "Administration" },
    { value: "Procurement_department", label: "Procurement Department" },
    { value: "QHSE_dep", label: "QHSE Department" },
    { value: "Contracts_Department", label: "Contracts Department" },
    { value: "Engineering_Department", label: "Engineering Department" },
    { value: "Business_Development", label: "Business Development Department" },
    { value: "Visitor", label: "Visitor" }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email/Username *</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Department</label>
            <select
              value={formData.Department}
              onChange={(e) => handleInputChange("Department", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              {ALLROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </motion.button>
        </form>

        {/* Error message */}
        <AnimatePresence>
          {isErrorVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 mx-6 mb-4 text-red-600 bg-red-100 border-l-4 border-red-500 rounded"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AddUserModal;