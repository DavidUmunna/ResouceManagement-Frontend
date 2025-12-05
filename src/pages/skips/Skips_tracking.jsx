/* eslint-disable react-hooks/exhaustive-deps */

import * as Sentry from '@sentry/react';
import React, { useState, useEffect } from 'react';
import { FiPlus,FiSearch, FiCalendar } from 'react-icons/fi';
import { useUser } from '../../components/usercontext';
import axios from 'axios';
import PaginationControls from '../../components/Paginationcontrols';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ExcelExport from './excelexport';
import SkipsToast from './skipsToast';
import AddSkip from './AddSkip';
import SkipsTable from './SkipsTable';
import SkipSummaryCard from './SkipSummaryCard';


const SkipsManagement = () => {
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [IsLoading,setIsLoading]=useState(false)
  const [data, setData] = useState({
    activities: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  });
  const [toast, setToast] = useState(null)
  const [SkipItems, setSkipItems] = useState([]);
  const [formData, setFormData] = useState({
    Quantity: {value:0,unit:''},
    WasteStream: '',
    skip_id: '',
    DeliveryWaybillNo:Number,
    DateMobilized:null,
    DateReceivedOnLocation:null,
    SkipsTruckRegNo:'',
    SkipsTruckDriver:'',
    WasteSource:"",
    DispatchManifestNo:"",
    WasteTruckRegNo:'',
    WasteTruckDriverName:"",
    DemobilizationOfFilledSkips:null,
    DateFilled:null,

  });
  if(toast){
    setTimeout(()=>setToast(null),3000)
  }
  // Date range state
 
  const [dateRange, setDateRange] = useState({
    startDate: null, 
    endDate: null 
  });
  const [openmodal,setopenmodal]=useState(false)
  //const [closemodal,setclosemodal]=useState(false)
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  //const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWasteStream, setselectedWasteStream] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [Error, setError] = useState("");

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Fetch skips data with date range
  const fetchData = async (
    page = data.pagination?.page,
    limit = data.pagination?.limit,
    startDate = formatDate(dateRange.startDate),
    endDate = formatDate(dateRange.endDate),
    search = "",
    WasteStream = ""
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
   
      const params = {
        page,
        limit,
        startDate: startDate,
        endDate: endDate
      };
      if (search) params.searchTerm = search;
      if (search) params.WasteSource = search;
      if (WasteStream) params.WasteStream = WasteStream;

      const [skipsRes, statsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/skiptrack`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }),
        axios.get(`${API_URL}/skiptrack/stats`, {
          params:params,
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }),
        axios.get(`${API_URL}/skiptrack/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }),
      ]);
      
      setData({
        orders: skipsRes.data.data,
        pagination: skipsRes.data.Pagination
      });
      setSkipItems(skipsRes.data.data || []);
      setStats(statsRes.data.data);
      setCategories(categoriesRes.data.data.categories);
      
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 402  ) {
        setError("Session expired. Please log in again.");
        
        
        window.location.href = '/adminlogin'; 
      } else {
        Sentry.captureMessage('Failed to fetch data:');
        Sentry.captureException(err)
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchData();
  }, []); // Add dateRange to dependencies

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      startDate: start,
      endDate: end 
    });
    if (start && end){
      triggerFilteredFetch(formatDate(start), formatDate(end));
    }
  };

  // Format category name for display
  const formatCategory = (category) => {
    if (!category) return '';
    const formatted = category
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/(^|\s)\S/g, l => l.toUpperCase()); // Capitalize first letters
 
    // Special case for "PVT" to keep it uppercase
    return category === 'PVT' ? 'PVT' : formatted;
  };

  const handleDateChange = (field, date) => {
  setFormData({ ...formData, [field]: date });
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const triggerFilteredFetch = (
    start = formatDate(dateRange.startDate),
    end = formatDate(dateRange.endDate),
    page = 1,
    limit = data.pagination?.limit
  ) => {
    const search = searchTerm.trim();
    const wasteStream = selectedWasteStream !== 'All' ? selectedWasteStream : "";
    fetchData(page, limit, start, end, search.length > 3 ? search : "", wasteStream);
  };
  
  // Filter and sort
  const filteredItems = SkipItems
    .filter(item => 
      
      (item?.skip_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item?.DriverName && item?.DriverName.toLowerCase().includes(searchTerm.toLowerCase()))||
      (item?.WasteSource.toLowerCase().includes(searchTerm.toLowerCase()))||
      (item?.DispatchManifestNo?.includes(searchTerm))||
      (item?.DeliveryWaybillNo?.toString().includes(searchTerm))

    )
    .filter(item => 
        selectedWasteStream === 'All' || item?.WasteStream === selectedWasteStream
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
 
  // Handle the two nested quantity fields
  if (name === 'value' || name === 'unit') {
   
    setFormData(prev => ({
      ...prev,
      Quantity: {
        ...prev.Quantity,
        [name]: name === 'value' 
          ? parseInt(value, 10) || ''  // parse to number (or empty string)
          : value                      // keep unit as string
      }
    }));
    return;
  }

  // Everything else
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};


  const handlePageChange = (newPage) => {
    const search = searchTerm.trim();
    const wasteStream = selectedWasteStream !== 'All' ? selectedWasteStream : "";
    fetchData(newPage, data.pagination?.limit, undefined, undefined, search.length > 3 ? search : "", wasteStream);
  };

  const handleItemsPerPageChange = (newLimit) => {
    const search = searchTerm.trim();
    const wasteStream = selectedWasteStream !== 'All' ? selectedWasteStream : "";
    fetchData(1, newLimit, undefined, undefined, search.length > 3 ? search : "", wasteStream);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true)
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      const res = await axios.post(`${API_URL}/skiptrack/create`, {
        ...formData,
        DateMobilized: formData.DateMobilized
      ? formData.DateMobilized.toISOString().split("T")[0]
      : null,
        DateReceivedOnLocation: formData.DateReceivedOnLocation
      ? formData.DateReceivedOnLocation.toISOString().split("T")[0]
      : null,
        DemobilizationOfFilledSkips: formData.DemobilizationOfFilledSkips
          ? formData.DemobilizationOfFilledSkips.toISOString()
          : null,
        DateFilled: formData.DateFilled
      ? formData.DateFilled.toISOString().split("T")[0]
      : null,
        addedBy: user.userId
      }, {
        withCredentials:true
      });
      setToast({
        show:true,
        type:"success",
        message:"your entry was added successfully"
      })
      setSkipItems([...SkipItems, res.data.data]);
      resetForm();
      setShowForm(false);
      fetchData(); // Refresh data
    } catch (err) {
      if (err.response?.status===401|| err.response?.status===403){
        setError("Session expired. Please log in again.");
       
        
        window.location.href = '/adminlogin'; 
      } else {
         setToast({
        show: true,
        type: 'error',
        message: 'Operation failed'
        });
        
        Sentry.captureMessage('Create Failed');
        Sentry.captureException(err.response?.data || err.message)
      }
      
    }finally{
      setIsLoading(false)
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true)
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
  
      const res = await axios.put(`${API_URL}/skiptrack/${editingItem._id}`, formData, {
        headers: {"ngrok-skip-browser-warning": "true"}
      ,withCredentials:true});
      setToast({
        show:true,
        type:"success",
        message:"your update was  success"
      })
      setSkipItems(SkipItems.map(item => 
        item._id === editingItem._id ? res.data.data : item
      ));
      resetForm();
      setEditingItem(null);
      setShowForm(false);
      fetchData(); // Refresh data
    } catch (err) {
      
        Sentry.captureMessage('Update Failed');
        Sentry.captureException(err.response?.data || err.message)
    }finally{
      setIsLoading(false)
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true)
      const API_URL = `${process.env.REACT_APP_API_URL}/api`

      await axios.delete(`${API_URL}/skiptrack/${id}`, {
      withCredentials:true
      });
      setSkipItems(SkipItems.filter(item => item._id !== id));
      fetchData(); // Refresh data
    } catch (err) {
        Sentry.captureMessage('Delete Failed');
        Sentry.captureException(err.response?.data || err.message)
    }finally{
      setLoading(false)
    }
  };

  const resetForm = () => {
    setFormData({
    skip_id: '',
    DeliveryWaybillNo:Number,
    DateMobilized:null,
    DateReceivedOnLocation:null,
    SkipsTruckRegNo:Number,
    SkipsTruckDriver:'',
    WasteStream: '',
    Quantity: {
      value:0,
      unit:''
    },
    WasteSource:"",
    DispatchManifestNo:'',
    WasteTruckRegNo:'',
    WasteTruckDriverName:"",
    DemobilizationOfFilledSkips:null,
    DateFilled:null,
    });
  };
  
  const setupEdit = (item) => {
    setEditingItem(item);
    setFormData({
       skip_id: item.skip_id,
       DeliveryWaybillNo:item.DeliveryWaybillNo,
       DateMobilized:item.DateMobilized,
       DateReceivedOnLocation:item.DateReceivedOnLocation,
       SkipsTruckRegNo:item.SkipsTruckRegNo,
       SkipsTruckDriver:item.SkipsTruckDriver,
       WasteStream: item.WasteStream,
       Quantity: {
         value:item.Quantity?.value||0,
         unit:item.Quantity?.unit||""
       },
       WasteSource:item.WasteSource,
       DispatchManifestNo:item.DispatchManifestNo,
       WasteTruckRegNo:item.WasteTruckRegNo,
       WasteTruckDriverName:item.WasteTruckDriverName||"",
       DemobilizationOfFilledSkips:item.DemobilizationOfFilledSkips,
       DateFilled:item.DateFilled,
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

  /*const toggleItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };*/

  // Preset date range handlers
  const setTodayRange = () => {
    const today = new Date();
    setDateRange({
      startDate: today,
      endDate: today
    });
    triggerFilteredFetch(formatDate(today), formatDate(today));
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    setDateRange({
      startDate: firstDay,
      endDate: new Date()
    });
    triggerFilteredFetch(formatDate(firstDay), formatDate(new Date()));
  };

  const setThisMonthRange = () => {
    const today = new Date();
    setDateRange({
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date()
    });
    triggerFilteredFetch(formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), formatDate(new Date()));
  };

  const setLastMonthRange = () => {
    const today = new Date();
    setDateRange({
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), 0)
    });
    triggerFilteredFetch(formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)), formatDate(new Date(today.getFullYear(), today.getMonth(), 0)));
  };



  
  

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-sm mt-12">
      {/* Header and Controls */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Skips Management</h1>
      

      <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 mb-6">

        <div className="flex-1 flex flex-row flex-wrap gap-3 min-w-[250px]">
          {/* Search input */}
          <div className="relative flex-1 xs:flex-initial xs:w-48 sm:w-56">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                const trimmed = value.trim();
                const wasteStream = selectedWasteStream !== 'All' ? selectedWasteStream : "";
                if (trimmed.length === 0 || trimmed.length > 3) {
                  fetchData(1, data.pagination?.limit, undefined, undefined, trimmed.length > 3 ? trimmed : "", wasteStream);
                }
              }}
            />
          </div>
          
          {/* Category filter */}
          <select
            className="flex-1 xs:flex-initial xs:w-40 sm:w-48 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
            value={selectedWasteStream}
            onChange={(e) => {
              const value = e.target.value;
              setselectedWasteStream(value);
              const search = searchTerm.trim();
              const wasteStream = value !== 'All' ? value : "";
              fetchData(1, data.pagination?.limit, undefined, undefined, search.length > 3 ? search : "", wasteStream);
            }}
          >
            <option value="All">All Categories</option>
            {Array.isArray(categories) && categories.map((category,index) => (
              <option key={category._id || index} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
          
          {/* Date range picker */}
          <div className="relative flex-1 xs:flex-initial xs:w-48 sm:w-56">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
               onChange={(update) => {
                handleDateRangeChange(update);
              }}
              isClearable={true}
              placeholderText="Date range"
              className="pl-4 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>
      
        {/* Bottom row for buttons - will wrap on medium screens */}
        <div className="flex flex-row flex-wrap gap-3 w-full sm:w-auto">
          {/* Excel Export Button */}
          <button
            onClick={() => {
              resetForm();
              setopenmodal(true);
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base whitespace-nowrap"
          >
            Export Excel
          </button>
          
          {/* Add Skip Button */}
          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base"
          >
            <FiPlus className="mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">Add Skip</span>
          </button>
        </div>
      </div>

      {/* Date range display and presets */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-gray-600">
          Showing data from {formatDisplayDate(dateRange.startDate)} to {formatDisplayDate(dateRange.endDate)}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={setTodayRange}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Today
          </button>
          <button 
            onClick={setThisWeekRange}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            This Week
          </button>
          <button 
            onClick={setThisMonthRange}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            This Month
          </button>
          <button 
            onClick={setLastMonthRange}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Last Month
          </button>
        </div>
      </div>

      {/* Skip Summary Cards */}
      {stats && (
        <SkipSummaryCard
        stats={stats}
        />
      )}

      <SkipsTable
      requestSort={requestSort}
      filteredItems={filteredItems}
      formatCategory={formatCategory}
      setupEdit={setupEdit}
      deleteItem={deleteItem}
      />

      {/* Pagination */}
      <div className="mt-4">
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

      {/* Form Modal */}
      {showForm && (
        <AddSkip
        setShowForm={setShowForm}
        handleSubmit={handleSubmit}
        handleUpdate={handleUpdate}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        formData={formData}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        categories={categories}
        IsLoading={IsLoading}
        setFormData={setFormData}
        formatCategory={formatCategory}
        />
      )}
      {openmodal && (<ExcelExport setopenmodal={setopenmodal} categories={categories} setIsLoading={setIsLoading} IsLoading={IsLoading} />)}

      {/* Error Display */}
      {Error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {Error}
        </div>
      )}
      {toast && (<SkipsToast toast={toast} setToast={setToast}/>)}
    </div>
  );
};

export default SkipsManagement;
