import { useState } from "react";
import SearchBar from "../SearchBar";
import FileTrackTable from "./FileTrackTable";
import axios from "axios";
import * as Sentry from '@sentry/react'
import { toast } from "react-toastify";
import AddTrack from "../AddTrack";
import { useUser } from "../../../components/usercontext";
const FileTrackList=({
  fetchData,
  dateRange,
  setDateRange,
  FileTracks,
  setFileTracks,
  setError,
  pagination,
  onPageChange,
  onItemsPerPageChange
})=>{
    
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem,setEditingItem]=useState(null)
    const [showForm,setShowForm]=useState(false)
    const [Loading,setLoading]=useState({selectedTrackId:'',status:false})
    const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
    const [formData,setFormData]=useState({
        FileName:'',
        Issuer:'',
        ExpiresAt:null,
        IssuedTo:'',
        fileUrl:'',
        IssueDate:null,
        status:'Active'
    })
     const [updateLoading,setUpdateLoading]=useState(false)
    const {user}=useUser();
    const fileFormData=new FormData();
    
    

    

   
    const filteredItems=FileTracks
    .filter(item=>
     (item?.FileName?.toLowerCase().includes(searchTerm.toLowerCase()))||
     (item?.Issuer?.toLowerCase().includes(searchTerm.toLowerCase()))||
     (item?.IssuedTo?.toLowerCase().includes(searchTerm.toLowerCase()))||
     (item?.status?.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });


    const formatStatus = (status) => {
    if (!status) return '';
    const formatted = status
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/(^|\s)\S/g, l => l.toUpperCase()); // Capitalize first letters
 
    // Special case for "PVT" to keep it uppercase
    return formatted;
    };
    const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    };
    

    // Handle date range change
    const handleDateRangeChange = (dates) => {
      const [start, end] = dates;
      setDateRange({
        startDate: start,
        endDate: end 
      });
      if (start && end){
        fetchData(undefined,undefined,start,end)
      }
    };
 

    const setupEdit=(item)=>{
        setEditingItem(item)
        setFormData({
            FileName:item.FileName,
            Issuer:item.Issuer,
            ExpiresAt:item.ExpiresAt,
            IssuedTo:item.IssuedTo,
            IssueDate:item.IssueDate,
            status:item.status,
            fileUrl:item.fileUrl
        })
        setShowForm(true)
    }
    const resetForm=()=>{
        setFormData({
             FileName:'',
        Issuer:'',
        ExpiresAt:null,
        IssuedTo:'',
        IssueDate:null,
        fileUrl:'',
        status:'Active'
        })
    }
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setUpdateLoading(true)
    const API_URL = `${process.env.REACT_APP_API_URL}/api`;

    let uploadedFileLink = "";

    // Upload file
    if (fileFormData && fileFormData.has("file")) {
      const fileResponse = await axios.post(
        `${API_URL}/fileupload/create`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }
      );

      uploadedFileLink = fileResponse?.data?.files?.downloadLink;
    }

    // Build final payload (DO NOT use setFormData here)
    const payload = {
      ...formData,
      fileUrl: uploadedFileLink || formData.fileUrl,
      ExpiresAt: formData.ExpiresAt
        ? formData.ExpiresAt.toISOString().split("T")[0]
        : null,
      IssueDate: formData.IssueDate
        ? formData.IssueDate.toISOString().split("T")[0]
        : null,
      userId: user.userId,
    };

    // Submit
    const TrackRes = await axios.post(
      `${API_URL}/v2/filetrack/createtrack`,
      payload,
      { withCredentials: true }
    );

    toast.success("your entry was added successfully", {
      duration: 2000,
      position: "top-right",
    });

    setFileTracks([...FileTracks, TrackRes.data.data]);
    resetForm();
    fetchData();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      setError("Session expired. Please log in again.");
      window.location.href = "/adminlogin";
    } else {
      
      Sentry.captureMessage("Create Failed");
      Sentry.captureException(error.response?.data || error.message);
    }
  } finally {
    setUpdateLoading(false);
    setShowForm(false);
  }
};


const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true)
      const API_URL = `${process.env.REACT_APP_API_URL}/api`
      let uploadedFileLink = '';

            if (fileFormData && fileFormData.has("file")) {
              const fileResponse = await axios.post(
                `${API_URL}/fileupload/create`,
                fileFormData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    "ngrok-skip-browser-warning": "true",
                  },
                  withCredentials: true,
                }
              );
            
              let link = fileResponse?.data?.files?.files[0]?.downloadLink;

              // ensure array
              uploadedFileLink =  link ;
            }
            
            
            
      const res = await axios.put(`${API_URL}/v2/filetrack/${editingItem._id}`, {...formData,
        fileUrl:uploadedFileLink
      }, {
        headers: {"ngrok-skip-browser-warning": "true"}
      ,withCredentials:true});
      toast.success(
        "your update was a success",{duration: 2000,
                 position: "top-right",}
      )
      await new Promise(resolve=>setTimeout(resolve,2000))
      setFileTracks(FileTracks.map(item => 
        item._id === editingItem._id ? res.data.data : item
      ));
      resetForm();
      setEditingItem(null);
      setShowForm(false);
      fetchData(); // Refresh data
    } catch (error) {
        toast.error(error.response?.data?.message)
        Sentry.captureMessage('Update Failed');
        Sentry.captureException(error.response?.data || error.message)
    }finally{
      setUpdateLoading(false)
    }
  };


    const handleInputChange=(e)=>{
        const {name,value}=e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));

    }

    const handleDateChange = (field, date) => {
    setFormData({ ...formData, [field]: date });
    };
  const deleteItem = async (id) => {
        try {
          setLoading((prev)=>(
            {...prev,
              selectedTrackId:id,
              status:true
            }
          ))
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
          await axios.delete(`${API_URL}/v2/filetrack/${id}`, {
            withCredentials:true
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setFileTracks(FileTracks.filter(item => item._id !== id));
          fetchData(); // Refresh data
        } catch (error) {
            Sentry.captureMessage('Delete Failed');
            Sentry.captureException(error.response?.data || error.message)
        }finally{
          setLoading((prev)=>(
            {
              ...prev,
              selectedTrackId:'',
              status:false
            }
          ))
        }
      };

    return (
        <div className="max-w-full p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">File Tracking</h1>

            <div>
                <SearchBar handleDateRangeChange={handleDateRangeChange} dateRange={dateRange} setEditingItem={setEditingItem}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm} resetForm={resetForm} setShowForm={setShowForm}/>
            </div>

            <div className="mt-10" >
                <FileTrackTable filteredItem={filteredItems} requestSort={requestSort} setLoading={setLoading} Loading={Loading}
                setupEdit={setupEdit} DeleteItem={deleteItem} formatStatus={formatStatus} />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Rows per page:</span>
                <select
                  value={pagination?.limit || 10}
                  onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <button
                  type="button"
                  onClick={() => onPageChange && onPageChange(Math.max((pagination?.page || 1) - 1, 1))}
                  disabled={!pagination?.page || pagination?.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {pagination?.page || 1} of {Math.max(Math.ceil((pagination?.total || filteredItems.length) / (pagination?.limit || 10)), 1)}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange && onPageChange((pagination?.page || 1) + 1)}
                  disabled={
                    !pagination?.page ||
                    (pagination?.page || 1) >= Math.ceil((pagination?.total || filteredItems.length) / (pagination?.limit || 10))
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {showForm&&(
                <AddTrack  handleSubmit={handleSubmit}  editingItem={editingItem} setEditingItem={setEditingItem} setShowForm={setShowForm} setFormData={setFormData}  updateLoading={updateLoading}
                 handleUpdate={handleUpdate} handleInputChange={handleInputChange} formData={formData} formatStatus={formatStatus}  handleDateChange={handleDateChange} fileFormData={fileFormData}/>
            )}

        </div>

    )
}

export default FileTrackList;
