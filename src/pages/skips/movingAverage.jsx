/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MovingAverageChart = () => {
  const [skipData, setSkipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [DateField,setDateField]=useState('DM')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)), // 1st of current month
    endDate: new Date() // Today
  });
  const [windowSize, setWindowSize] = useState(7); // Default 7-day moving average

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Calculate moving average
  const calculateMovingAverage = (data, window) => {
    return data.map((_, index) => {
      if (index < window - 1) return null; // Not enough data points
      const sum = data
        .slice(index - window + 1, index + 1)
        .reduce((acc, val) => acc + val.count, 0);
      return (sum / window).toFixed(2);
    });
  };

  // Fetch skip data
  const fetchSkipData = async (start=formatDate(dateRange.startDate),
    end=formatDate(dateRange.endDate)) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      
      const response = await axios.get(`${API_URL}/skiptrack/analytics`, {
        params: {
          startDate: start,
          endDate: end,
          DateField:DateField,
          groupBy: 'day' // Can be 'day', 'week', or 'month'
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true,
      });

      setSkipData(response.data.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 402) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem('sessionId');
        window.location.href = '/adminlogin'; 
      } else {
        setError('Failed to fetch skip data');
        console.error('Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.startDate &&dateRange.endDate){

        fetchSkipData();
    }
  }, []);

  // Prepare chart data
  const prepareChartData = () => {
    const labels = skipData.map(item => new Date(item.date).toLocaleDateString());
    const counts = skipData.map(item => item.count);
    const movingAverages = calculateMovingAverage(skipData, windowSize);

    return {
      labels,
      datasets: [
        {
          label: 'Daily Skip weight total',
          data: counts,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: `${windowSize}-Day Moving Average`,
          data: movingAverages,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Added for better control of chart dimensions
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Skip Trends with Moving Average',
        font: {
          size: 16 // Larger title on desktop
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
             
              label += context.parsed.y + 'tonnes';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14 // Larger axis labels
          }
        },
        ticks: {
          font: {
            size: 12 // Larger tick labels
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'weight of Skips(Tonnes)',
          font: {
            size: 14
          }
        },
        ticks: {
          font: {
            size: 12
          }
        },
        beginAtZero: true
      }
    }
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      startDate: start,
      endDate: end 
    });
    if (start && end && DateField){
      fetchSkipData(start,end);
    }

  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-transparent"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>;
  }

  return (
    <div className="bg-white w-full p-10  lg:p-10 xl:p-8 rounded-lg shadow-sm border border-gray-200 mt-6 ">
      <div className="flex flex-col  justify-between items-start xl:items-center mb-4 lg:mb-6 gap-4">
        <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800">Skip Trends Analysis</h2>
        
        <div className="flex  flex-wrap p-3  gap-3 w-full xl:w-auto">
          {/* Date range picker */}
          <div className="relative w-full lg:w-56 xl:w-64">
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(update)=>handleDateRangeChange(update)}
              isClearable={true}
              placeholderText="Select date range"
              className="pl-6 pr-7 py-2 mr-5 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            />
          </div>
          
          {/* Window size selector */}
          <select
            value={windowSize}
            onChange={(e) => setWindowSize(Number(e.target.value))}
            className="w-full lg:w-40 xl:w-48 px-3 lg:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm lg:text-base"
          >
            <option value={3}>3-Day Moving Avg</option>
            <option value={7}>7-Day Moving Avg</option>
            <option value={14}>14-Day Moving Avg</option>
            <option value={30}>30-Day Moving Avg</option>
          </select>
      
          <select
          value={DateField}
          
          onChange={(e)=>setDateField(e.target.value)}
           className="w-full lg:w-40 xl:w-48 px-3 lg:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm lg:text-base"
        
          >

            
            <option value={"DM"}>DM(Mobilization)</option>
            <option value={"DRL"}>DRL(Recieved)</option>
            <option value={"DD"} >DD(Demobilization)</option>
            <option value={"DF"}>DF(Filled)</option>
          </select>
        </div>
      </div>

      <div className="h-64 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] w-full">
        {skipData.length > 0 ? (
          <Line data={prepareChartData()} options={chartOptions} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No data available for the selected date range
          </div>
        )}
      </div>

      <div className="mt-3 lg:mt-4 text-xs lg:text-sm text-gray-600">
        {/*<p>Displaying data from {dateRange.startDate} to {dateRange.endDate}</p>*/}
        <p className="mt-1">The moving average helps smooth out daily fluctuations to show the underlying trend.</p>
      </div>
    </div>
  );
};

export default MovingAverageChart;