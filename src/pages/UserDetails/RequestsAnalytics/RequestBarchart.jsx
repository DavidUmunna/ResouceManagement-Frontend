// components/PurchaseOrderBarChart.js
import React, { useState,useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import axios from 'axios';
import { useUser } from '../../../components/usercontext';
const RequestBarChart = ({DepartmentalAccess=[],GeneralAccess=[]}) => {
  const {user}=useUser()
  const [viewMode, setViewMode] = useState('daily');
  const [displayMetric, setDisplayMetric] = useState('count'); // 'count' or 'value'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [Loading, setLoading]=useState(false)

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = `${process.env.REACT_APP_API_URL}/api`;
        const params={}
        params.view=viewMode

        if (DepartmentalAccess?.includes(user.role)){
          params.Department=user.Department
        }else if (GeneralAccess?.includes(user.role)){
          
        }else{
          params.staffId=user.userId
        }

        const response = await axios.get(`${API_URL}/orders/analytics/purchase-orders`, {
        params,
        withCredentials:true
        });

        const data = response.data;
        
        setAnalyticsData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]);

  const chartData = {
    labels: analyticsData?.chartData.map(item => item.date),
    datasets: [
      {
        label: displayMetric === 'count' ? 'Number of Requests' : 'Total Value (NGN)',
        data: analyticsData?.chartData.map(item => 
          displayMetric === 'count' ? item.count : item.totalValue
        ),
        backgroundColor: displayMetric === 'count' 
          ? 'rgba(54, 162, 235, 0.7)' 
          : 'rgba(75, 192, 192, 0.7)',
        borderColor: displayMetric === 'count' 
          ? 'rgba(54, 162, 235, 1)' 
          : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Avg Approval Time (days)',
        data: analyticsData?.chartData.map(item => 
          item.avgApprovalTime ? item.avgApprovalTime / (1000 * 60 * 60 * 24) : 0
        ),
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    mainAspectRatio:false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: `Purchase Orders Analytics (${viewMode} view)`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              label += displayMetric === 'count' 
                ? context.raw 
                : new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(context.raw);
            } else {
              label += context.raw.toFixed(2) + ' days';
            }
            return label;
          },
          
          afterLabel: function(context) {
            const dataItem = analyticsData?.chartData[context.dataIndex];
           
            const statusLines = Object.entries(dataItem.statusCounts || {})
              .map(([status, count]) => `${status}: ${count}`)
              .join('\n');
           
            return ['Status Distribution:', statusLines].join('');
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: displayMetric === 'count' 
            ? 'Number of Requests' 
            : 'Total Value (NGN)'
        },
        ticks: {
          callback: displayMetric === 'value' 
            ? function(value) {
                return '₦' + value.toLocaleString();
              }
            : undefined
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Avg Approval Time (days)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };
 

  return (
  <div className="w-full bg-white shadow-lg p-5 rounded-2xl max-h-screen flex flex-col">
  {/* Filters */}
  <div className="mb-5 flex flex-col  md:w-full sm:flex-wrap gap-3">
    <div className="w-full sm:w-full md:w-full">
      <label className="block mb-1 font-medium">View Mode:</label>
      <select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full sm:w-full"
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>

    <div className="w-full sm:w-full  md:w-full">
      <label className="block mb-1 font-medium">Display Metric:</label>
      <select
        value={displayMetric}
        onChange={(e) => setDisplayMetric(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full sm:w-full"
      >
        <option value="count">Order Count</option>
        <option value="value">Total Value</option>
      </select>
    </div>
  </div>

  {/* Bar Chart */}
  <div className="w-full mb-5">
    <div className="relative w-full h-[300px] sm:h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  </div>

  {/* Summary Statistics */}
  {/*<div className="p-5 bg-gray-100 rounded w-full">
    <h3 className="text-lg font-semibold mb-2">Summary Statistics</h3>
    <p>Total Requests: {analyticsData?.summary.totalOrders}</p>
    <p>
      Total Value:{' '}
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(analyticsData?.summary.totalValue)}
    </p>
    <p>
      Average Order Value:{' '}
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(analyticsData?.summary.avgOrderValue)}
    </p>
    <p>Approval Rate: {analyticsData?.summary.approvalRate.toFixed(1)}%</p>
  </div>*/}
</div>



  );
};

export default RequestBarChart;