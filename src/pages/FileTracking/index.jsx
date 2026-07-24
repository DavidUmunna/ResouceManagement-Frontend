import FileTrackList from "./FileTrackList";
import FileTrackingDashboard from "./Dashboard";
import ComplianceLog from "./ComplianceLog";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as Sentry from '@sentry/react';
import InfoModal from "../../components/InfoModal";

const FILE_TRACKING_INSTRUCTIONS = [
  {
    heading: 'File Track List',
    items: [
      'The centre panel lists all tracked files. Use the search bar to filter by file name, issuer, or recipient.',
      'Filter by date range to narrow down files by their issue or expiry date.',
      'Click "Add Track" to log a new file — fill in the file name, issuer, recipient, and expiry date.',
      'Edit or delete an existing entry using the action buttons on each row.',
    ],
  },
  {
    heading: 'Compliance Log',
    items: [
      'The left panel shows files approaching or past their expiry date.',
      'Entries highlighted in red are overdue; amber entries expire soon.',
      'Review this panel regularly to ensure no compliance deadlines are missed.',
    ],
  },
  {
    heading: 'Dashboard',
    items: [
      'The right panel gives a quick summary of total files, active files, and upcoming expirations.',
      'Use it to get an at-a-glance status of your document compliance health.',
    ],
  },
];
const FileTracking=()=>{
    const [showInfo, setShowInfo] = useState(false);
    const [data, setData] = useState({
            Tracks: [],
            pagination: {
              page: 1,
              limit: 10,
             total: 0
            }
    });
    const [Loading,setLoading]=useState(false)
    const [FileTracks, setFileTracks]=useState([])
    const [Error, setError] = useState("");
    const [dateRange, setDateRange] = useState({
            startDate: null, 
            endDate: null 
    });
    

    const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
    };



    const fetchData = useCallback(async (page, limit, startDate, endDate) => {
        try{
            setLoading(true);
    
            const API_URL = `${process.env.REACT_APP_API_URL}/api/v2`;
         
            const params = {
              page,
              limit,
              startDate: startDate,
              endDate: endDate
            };

            const trackRes=await  
                axios.get(`${API_URL}/filetrack/paginatedtracks`,{
             params,
             headers: {
            
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
          })
        
        setData({
            Tracks:trackRes?.data?.data,
            pagination:trackRes?.data?.Pagination
        })
        setFileTracks(trackRes.data.data||[])

            

        }catch(error){
            if (error.response?.status === 401 || error.response?.status === 402  ) {
                    setError("Session expired. Please log in again.");
                    
                    
                    window.location.href = '/adminlogin'; 
                  } else {
                    Sentry.captureMessage('Failed to fetch data:');
                    Sentry.captureException(error)
                  }


        }finally{
            setLoading(false)
        }
    }, [])

    useEffect(() => {
      fetchData(
        data.pagination?.page,
        data.pagination?.limit,
        formatDate(dateRange.startDate),
        formatDate(dateRange.endDate)
      );
    }, [fetchData, data.pagination?.page, data.pagination?.limit, dateRange.startDate, dateRange.endDate])
    const handlePageChange = (newPage) => {
      fetchData(newPage, data.pagination?.limit, formatDate(dateRange.startDate), formatDate(dateRange.endDate));
    };

    const handleItemsPerPageChange = (newLimit) => {
      fetchData(1, newLimit, formatDate(dateRange.startDate), formatDate(dateRange.endDate));
    };


    return(
        <>
        <div className="max-w-full mx-auto px-2 sm:px-6  py-6 mb-20 pt-16">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">File Tracking</h1>
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
                title="How to use File Tracking"
                sections={FILE_TRACKING_INSTRUCTIONS}
                onClose={() => setShowInfo(false)}
              />
            )}

            <div className="flex flex-col lg:flex-row gap-3">
            <div className="w-full lg:w-1/4 bg-gray-50">
              <ComplianceLog />
            </div>
            <div className="w-full lg:w-2/4 bg-gray-50">
               <FileTrackList
                 dateRange={dateRange}
                 setDateRange={setDateRange}
                 FileTracks={FileTracks}
                 setFileTracks={setFileTracks}
                 setError={setError}
                 fetchData={fetchData}
                 pagination={data.pagination}
                 onPageChange={handlePageChange}
                 onItemsPerPageChange={handleItemsPerPageChange}
               />
            </div>
            <div className="w-full lg:w-1/4 bg-gray-50">
              <FileTrackingDashboard />
            </div>

            </div>
            {Error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {Error}
              </div>
            )}
            {Loading&&(
               <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500" />
            )}
            
        </div>
        </>

    )

}

export default FileTracking;
