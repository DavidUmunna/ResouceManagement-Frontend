/* eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from "@sentry/react"
import React,{ useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiChevronDown, FiChevronUp,  FiSearch } from 'react-icons/fi';
import { useUser } from '../../components/usercontext';
import Assetsanalysis from "./Assetsanalysis";
import AssetsConditionChart from './Asssetvisuals';
import axios from 'axios';
import {toast} from "react-toastify"
import PaginationControls from '../../components/Paginationcontrols';
import Pagination from '../../components/Pagination';
import { isProd } from "../../components/env";
import AssetExportModal from "./AssetExport";
import InfoModal from "../../components/InfoModal";
import { CONDITION_STYLES, formatCurrency, formatDate } from "./assetUtils";

const ASSET_INSTRUCTIONS = [
  {
    heading: 'Viewing Assets',
    items: [
      'All assets are listed in the table. Click the chevron on a row to expand it and see the SKU, location, and description.',
      'Use the search box to filter by name, description, condition, or location.',
      'Use the category dropdown to narrow the list to a specific asset category.',
      'Click any column header to sort the table by that field.',
    ],
  },
  {
    heading: 'Adding & Editing Assets',
    items: [
      'Click "Add Asset Item" to open the form and register a new asset.',
      'Fill in the name, category, quantity, monetary value, condition, location, and an optional description.',
      'To update an existing asset, click the edit (pencil) icon on its row — the same form reopens pre-filled.',
      'Click "Save Item" / "Update Item" to confirm, or "Cancel" to discard changes.',
    ],
  },
  {
    heading: 'Deleting & Exporting',
    items: [
      'Click the delete (trash) icon on a row to permanently remove that asset.',
      'Use the "Excel Export" button to download asset data as a spreadsheet.',
    ],
  },
  {
    heading: 'Analytics (Admin)',
    items: [
      'The charts on the right show a category breakdown and condition distribution of your assets.',
      'These panels are only visible to users with admin-level access.',
    ],
  },
];

const AssetManagement = ({setAuth}) => {
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
   const [data, setData] = useState({
      activities: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    });
  // State
  const [AssetItems, setAssetItems] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    quantity: 1,
    condition: 'New',
    description: '',
    location: '',
    value: 0
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showmodal,setshowmodal]=useState(false)
  const [showInfo,setShowInfo]=useState(false)
  const [ADMIN_ROLES_ASSET_MANAGEMENT,set_ADMIN_ROLES_ASSET_MANAGEMENT]=useState([])
  const [Error,setError]=useState("")
  // Maintenance expenditure
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expData, setExpData] = useState({ expenditureBySubCategory: [], totalExpenditure: 0 });
  const [expFilterActive, setExpFilterActive] = useState(false);
  const [expSearch, setExpSearch] = useState('');
  const [expandedExp, setExpandedExp] = useState(null);
  const [expPage, setExpPage] = useState(1);
  const EXP_PAGE_SIZE = 5;

  // Fetch Asset data
  const fetchData = async (page=data.pagination?.page,limit=data.pagination?.limit) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-session-id": token,
        "ngrok-skip-browser-warning": "true",
      };
      const [AssetRes, statsRes, categoriesRes, subCategoriesRes] = await Promise.all([
        axios.get(`${API_URL}/assets`, { params: { page, limit }, headers, withCredentials: true }),
        axios.get(`${API_URL}/assets/stats`, { headers, withCredentials: true }),
        axios.get(`${API_URL}/assets/categories`, { headers, withCredentials: true }),
        axios.get(`${API_URL}/assets/subcategories`, { headers, withCredentials: true }),
      ]);
        setData({
          orders: AssetRes.data.data,
          pagination: AssetRes.data.Pagination
        });
        setAssetItems(AssetRes.data.data);
        setStats(statsRes.data.data);
        setCategories(categoriesRes.data.data);
        setSubCategories(subCategoriesRes.data.data?.subCategories || []);
        
      } catch (err) {  // add `: any` if you want better type safety
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('sessionId');
          setAuth(false);
          window.location.href = '/adminlogin'; 
        } else {
          if(isProd){

            Sentry.captureMessage('Failed to fetch data:');
            Sentry.captureException(err)
          }
        }
      } finally {
        setLoading(false);
      }
      
    }
  const fetch_RBAC=async ()=>{
    try{
        setLoading(true)
        const token = localStorage.getItem('sessionId');
        const API_URL = `${process.env.REACT_APP_API_URL}/api`
        const rbacRes=await axios.post(`${API_URL}/roles&departments`,{ADMIN_ROLES_ASSET_MANAGEMENT:true},{headers: {
              "x-session-id":token,

            },
            withCredentials: true,
          })
    
      set_ADMIN_ROLES_ASSET_MANAGEMENT(rbacRes.data.data.ADMIN_ROLES_ASSET_MANAGEMENT)
    }catch(error){
      if (isProd){

        Sentry.captureException(error)
      }

    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch_RBAC()
    fetchData();
    loadExpenditure();
  }, [setAuth]);

  const formatCategory = (category) => {
    const formatted = category
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/(^|\s)\S/g, l => l.toUpperCase()); // Capitalize first letters
    
    // Special case for "PVT" to keep it uppercase
    return category === 'PVT' ? 'PVT' : formatted;
  };

  // Filter and sort
  const filteredItems = AssetItems
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))||
      (item.condition.toLowerCase().includes(searchTerm.toLowerCase()))||
      (item.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(item => 
      selectedCategory === 'All' || item.category === selectedCategory
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'value' ? parseInt(value)  : value
    });
  };

  const loadExpenditure = async (start, end) => {
    try {
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const res = await axios.get(`${API_URL}/assets/expenditure`, {
        params: { startDate: start || undefined, endDate: end || undefined },
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
        withCredentials: true,
      });
      setExpData(res.data?.data || { expenditureBySubCategory: [], totalExpenditure: 0 });
    } catch (err) {
      if (isProd) Sentry.captureException(err);
    }
  };

  const applyExpFilter = async () => {
    setExpPage(1);
    setExpandedExp(null);
    if (!expStart && !expEnd) {
      setExpFilterActive(false);
      await loadExpenditure();
      return;
    }
    setExpFilterActive(true);
    await loadExpenditure(expStart, expEnd);
  };

  const clearExpFilter = async () => {
    setExpStart('');
    setExpEnd('');
    setExpFilterActive(false);
    setExpPage(1);
    setExpandedExp(null);
    await loadExpenditure();
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, data.pagination?.limit);
  };

  const handleItemsPerPageChange = (newLimit) => {
    fetchData(1, newLimit); // Reset to page 1 when changing limit
  };
  
/*const handleExpand = (id) => {
  setExpandedItem((prev) => (prev === id ? null : id));
};*/
  // Only take over the whole screen on the very first load; subsequent
  // refetches (pagination) dim the table instead of replacing the page.
  if (loading && AssetItems.length === 0) {
    return <div className="p-8 flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      const token = localStorage.getItem('sessionId');
      const res = await axios.post(`${API_URL}/assets`, {
        ...formData,
        addedBy: user.userId
      }, {
        headers: { "x-session-id":token }
      });
      
      setAssetItems([...AssetItems, res.data.data]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      if (err.response?.status===401|| err.response?.status===403){
        setError("Session expired. Please log in again.");
        localStorage.removeItem('sessionId');
        setAuth(false)
        window.location.href = '/adminlogin'; 
      }else{

        console.error('Create failed:', err.response?.data || err.message);
      }

      
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      const res = await axios.put(`${API_URL}/assets/${editingItem._id}`, formData, {
       withCredentials:true
      });
      
      setAssetItems(AssetItems.map(item => 
        item._id === editingItem._id ? res.data.data : item
      ));
      resetForm();
      setEditingItem(null);
      setShowForm(false);
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      await axios.delete(`${API_URL}/assets/${id}`, {

      });
      setAssetItems(AssetItems.filter(item => item._id !== id));
    } catch (error) {
     if(error.response){
      toast.error(error.response.data.message)
      }
      Sentry.captureException(error)
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subCategory: '',
      quantity: 1,
      condition: 'New',
      description: '',
      location: '',
      value: 0
    });
  };

  const setupEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      subCategory: item.subCategory || '',
      quantity: item.quantity,
      condition: item.condition,
      description: item.description || '',
      location: item.location || '',
      value: item.value || 0
    });
    setShowForm(true);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortArrow = (key) =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '';
  

  const toggleItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  //if (loading) return <div className="text-center py-8">Loading Assets...</div>;

  return (
    <div className="w-full p-6 bg-gray-50 rounded-lg shadow-sm mt-12">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asset Management</h1>
        <button
          onClick={() => setShowInfo(true)}
          className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-blue-300 text-blue-500 hover:bg-blue-50 hover:border-blue-400 transition flex items-center justify-center text-sm font-bold"
          aria-label="How to use this page"
        >
          i
        </button>
      </div>

      {showInfo && (
        <InfoModal
          title="How to use Asset Management"
          sections={ASSET_INSTRUCTIONS}
          onClose={() => setShowInfo(false)}
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search Assets..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
              className="w-full sm:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              
              {Array.isArray(categories?.categories) && categories.categories.length > 0 ? (
                categories.categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
        </div>
        <div className="w-full flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center lg:w-auto">

        <button
                 onClick={() => setshowmodal(!showmodal)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                 >
                   Excel Export 
        </button>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
          <FiPlus className="mr-2" />
          Add Asset Item
        </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Asset Item' : 'Add New Asset Item'}
              </h2>
              
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={editingItem ? handleUpdate : handleSubmit}>

              <div className="space-y-4">
                {/* Form fields remain the same as your original */}
                {/* ... */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
               >
                  <option value="">Select a category</option>
                {Array.isArray(categories?.categories) && categories.categories.length > 0 ? (
                  categories.categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
                </select>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                  <input
                    type="text"
                    name="subCategory"
                    list="asset-subcategories"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    placeholder="Optional — e.g. Laptops, Chairs"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <datalist id="asset-subcategories">
                    {subCategories.map((sc) => (
                      <option key={sc} value={sc} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monetary Value</label>
                    <input
                      type="number"
                      name="value"
                      min="1"
                      placeholder='Price'
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              
                

              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiSave className="mr-2" />
                  {editingItem ? 'Update Item' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Summary Cards */}
      {stats&&(<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalItems || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalQuantity || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCategories || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₦{stats.totalValue ? stats.totalValue.toLocaleString() : 0}
          </p>
        </div>
      </div>)}

      {/* Maintenance expenditure by asset sub-category */}
      {(() => {
        const allRows = Array.isArray(expData.expenditureBySubCategory) ? expData.expenditureBySubCategory : [];
        // Show the panel if there's any expenditure, or a date filter is active
        if (allRows.length === 0 && !expFilterActive) return null;

        // Search matches the sub-category name, or any expense's reason / title / PO number
        const q = expSearch.trim().toLowerCase();
        const rows = !q ? allRows : allRows.filter((r) => {
          if (r.subCategory?.toLowerCase().includes(q)) return true;
          return (r.entries || []).some((en) =>
            (en.remark || '').toLowerCase().includes(q) ||
            (en.title || '').toLowerCase().includes(q) ||
            (en.orderNumber || '').toLowerCase().includes(q)
          );
        });

        const totalExpPages = Math.ceil(rows.length / EXP_PAGE_SIZE);
        const pagedRows = rows.slice((expPage - 1) * EXP_PAGE_SIZE, expPage * EXP_PAGE_SIZE);

        return (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Maintenance Expenditure by Sub-Category</h3>
              <span className="text-sm font-bold text-gray-800">
                Total{expFilterActive ? ' (filtered)' : ''}: {formatCurrency(expData.totalExpenditure)}
              </span>
            </div>

            {/* Search + date filter */}
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-gray-500 mb-1">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-2.5 top-2.5 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={expSearch}
                    onChange={(e) => { setExpSearch(e.target.value); setExpPage(1); }}
                    placeholder="Sub-category, item, or reason…"
                    className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={expStart}
                  onChange={(e) => setExpStart(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={expEnd}
                  onChange={(e) => setExpEnd(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={applyExpFilter}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Apply
              </button>
              {expFilterActive && (
                <button
                  onClick={clearExpFilter}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Sub-Category</th>
                    <th className="px-4 py-2 text-left font-medium">Orders</th>
                    <th className="px-4 py-2 text-left font-medium">Last Expense</th>
                    <th className="px-4 py-2 text-right font-medium">Expenditure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                        No matching expenditure
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((e) => {
                      const key = `${e.category}-${e.subCategory}`;
                      const open = expandedExp === key;
                      return (
                        <React.Fragment key={key}>
                          <tr
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setExpandedExp(open ? null : key)}
                          >
                            <td className="px-4 py-2 font-medium text-gray-800">
                              <span className="inline-flex items-center gap-1">
                                {open ? <FiChevronUp /> : <FiChevronDown />}
                                {e.subCategory}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-500">{e.orderCount}</td>
                            <td className="px-4 py-2 text-gray-500">{formatDate(e.lastExpenseAt)}</td>
                            <td className="px-4 py-2 text-right text-gray-800">{formatCurrency(e.totalExpenditure)}</td>
                          </tr>
                          {open && (
                            <tr>
                              <td colSpan="4" className="px-4 py-3 bg-gray-50">
                                {(e.entries || []).length === 0 ? (
                                  <p className="text-xs text-gray-500">No individual expenses recorded.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead className="text-gray-500 uppercase">
                                        <tr>
                                          <th className="px-3 py-1.5 text-left font-medium">Date</th>
                                          <th className="px-3 py-1.5 text-left font-medium">PO</th>
                                          <th className="px-3 py-1.5 text-left font-medium">Reason</th>
                                          <th className="px-3 py-1.5 text-right font-medium">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {e.entries.map((en, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-1.5 text-gray-500 whitespace-nowrap">{formatDate(en.at)}</td>
                                            <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">{en.orderNumber || '—'}</td>
                                            <td className="px-3 py-1.5 text-gray-700">
                                              <div>{en.title || '—'}</div>
                                              {en.remark ? <div className="text-gray-400">{en.remark}</div> : null}
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-gray-800">{formatCurrency(en.amount)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={expPage}
              totalPages={totalExpPages}
              total={rows.length}
              limit={EXP_PAGE_SIZE}
              onPage={setExpPage}
            />
          </div>
        );
      })()}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 min-w-0">
          {/* Assets Table */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'name', label: 'Asset Name/Type' },
                      { key: 'category', label: 'Category' },
                      { key: 'quantity', label: 'Quantity' },
                      { key: 'condition', label: 'Condition' },
                      { key: 'value', label: 'Value' },
                      { key: 'lastUpdated', label: 'Last Updated' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => requestSort(key)}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          <span className="text-[10px] text-blue-500">{sortArrow(key)}</span>
                        </span>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        No asset items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <React.Fragment key={item._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleItem(item._id)}
                              className="text-gray-400 hover:text-gray-600 mr-2"
                              aria-label={expandedItem === item._id ? 'Collapse' : 'Expand'}
                            >
                              {expandedItem === item._id ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            <span className="font-medium text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {formatCategory(item.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${CONDITION_STYLES[item.condition] || 'bg-gray-100 text-gray-700'}`}>
                            {item.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{formatCurrency(item.value)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.lastUpdated)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setupEdit(item)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedItem === item._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-700">SKU</h4>
                                <p className="text-gray-600">{item.sku || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-700">Sub-Category</h4>
                                <p className="text-gray-600">{item.subCategory || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-700">Location</h4>
                                <p className="text-gray-600">{item?.location || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-700">Description</h4>
                                <p className="text-gray-600">{item.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    )))}
                </tbody>
              </table>
            </div>
          </div>
           <div>
              {/* Your data display */}
              <PaginationControls
                currentPage={data.pagination?.page}
                totalPages={data.pagination?.totalPages}
                itemsPerPage={data.pagination?.limit}
                totalItems={data.pagination?.total}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isLoading={loading}
              />
            </div>
        </div>

        {/* Analytics */}
        {ADMIN_ROLES_ASSET_MANAGEMENT.includes(user.role) && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                <Assetsanalysis AssetItems={AssetItems} />
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-2">
                <AssetsConditionChart AssetItems={AssetItems} />
              </div>
            </div>
          </div>
        )}
      </div>

      {Error && (
        <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {Error}
        </div>
      )}
      {showmodal && (
        <AssetExportModal
          onClose={() => setshowmodal(false)}
          setLoading={setLoading}
        />
      )}
    </div>
  );
};

export default AssetManagement; 
