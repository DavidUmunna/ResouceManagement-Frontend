import FileTrackList from "./FileTrackList";
import FileTrackingDashboard from "./Dashboard";
import ComplianceLog from "./ComplianceLog";
import { useState, useEffect } from "react";
import axios from "axios";
import *as Sentry from '@sentry/react'
const FileTracking=()=>{
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
    

    useEffect(()=>{
        fetchData()
    },[])
    const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
    };



    const fetchData=async(page = data.pagination?.page,
    limit = data.pagination?.limit ,
    startDate=formatDate(dateRange.startDate),
    endDate=formatDate(dateRange.endDate)
    )=>{
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
    }
    const handlePageChange = (newPage) => {
      fetchData(newPage, data.pagination?.limit);
    };

    const handleItemsPerPageChange = (newLimit) => {
      fetchData(1, newLimit);
    };


    return(
        <>
        <div className="max-w-full mx-auto px-2 sm:px-6  py-6 mb-20 pt-16">
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
