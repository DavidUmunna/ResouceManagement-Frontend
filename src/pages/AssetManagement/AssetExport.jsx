import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { FiCalendar, FiX, FiDownload, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssetExportModal = ({ onClose, setLoading }) => {
  const [formData, setFormData] = useState({
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
    category: "All",
    filename: "Asset_report",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFormData((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  };

  const resetForm = () => {
    setFormData({
      startDate: new Date(new Date().setDate(1)),
      endDate: new Date(),
      category: "All",
      filename: "Asset_report",
    });
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      errors.dateRange = "Start date cannot be after end date";
    }
    if (!formData.filename.trim()) {
      errors.filename = "File name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsExporting(true);
      setLoading(true);
      setDownloadProgress(0);

      const API_URL = `${process.env.REACT_APP_API_URL}/api`;


      const response = await axios.post(
        `${API_URL}/assets/export`,
        {
          ...formData,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        },
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setDownloadProgress(percentCompleted);
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${formData.filename}_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Asset export completed successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close modal after short delay
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error("Download failed", error);

      let errorMessage = "Export failed. Please try again.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsExporting(false);
      setLoading(false);
      setDownloadProgress(0);
    }
  };

  const presetDateRanges = {
    today: () => {
      const today = new Date();
      setFormData((prev) => ({
        ...prev,
        startDate: today,
        endDate: today,
      }));
    },
    thisWeek: () => {
      const today = new Date();
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      setFormData((prev) => ({
        ...prev,
        startDate: firstDay,
        endDate: new Date(),
      }));
    },
    thisMonth: () => {
      const today = new Date();
      setFormData((prev) => ({
        ...prev,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(),
      }));
    },
    lastMonth: () => {
      const today = new Date();
      setFormData((prev) => ({
        ...prev,
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        endDate: new Date(today.getFullYear(), today.getMonth(), 0),
      }));
    },
  };

 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center min-h-screen z-50 p-4">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Export Assets</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isExporting}
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name*
            </label>
            <input
              type="text"
              name="filename"
              value={formData.filename}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter file name"
              required
            />
            {validationErrors.filename && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.filename}
              </p>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Filter
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="IT_equipment">IT Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Office_Supplies">Office Supplies</option>
              <option value="waste_management">Waste Management</option>
              <option value="lab">Lab Equipment</option>
              <option value="PVT">PVT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range*
            </label>

            {/* Date Presets */}
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(presetDateRanges).map(([key, handler]) => (
                <button
                  key={key}
                  type="button"
                  onClick={handler}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </button>
              ))}
            </div>

            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <DatePicker
                selectsRange={true}
                startDate={formData.startDate}
                endDate={formData.endDate}
                onChange={handleDateRangeChange}
                isClearable={true}
                placeholderText="Select date range"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isExporting}
              />
            </div>

            {validationErrors.dateRange && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.dateRange}
              </p>
            )}
            {validationErrors.startDate && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.startDate}
              </p>
            )}
            {validationErrors.endDate && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.endDate}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {downloadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Exporting...</span>
                <span>{downloadProgress}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              disabled={isExporting}
            >
              <FiRefreshCw className="mr-2" />
              Reset
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${
                isExporting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isExporting}
            >
              <FiDownload className="mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetExportModal;