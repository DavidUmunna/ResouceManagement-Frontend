import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const MonitoringDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
        const API = process.env.REACT_APP_API_URL;
      const logsRes = await axios.get(`${API}/api/monitoring?page=${page}&limit=10`);
      const statsRes = await axios.get(`${API}/api/monitoring/stats`);
      setLogs(logsRes.data.logs);
      setTotalPages(logsRes.data.totalPages);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-10">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Monitoring Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time performance metrics and log insights</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                {stat._id.method} {stat._id.endpoint}
              </h2>
              <p className="text-sm text-gray-500 mb-1">Avg Response Time: {Math.round(stat.avgResponseTime)} ms</p>
              <p className="text-sm text-gray-700">Hits: {stat.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Recent Logs</h2>
        <p className="text-sm text-gray-500 mb-4">Visualization of response times over the latest requests</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={logs?.map((log) => ({
            time: new Date(log.createdAt).toLocaleTimeString(),
            responseTime: log.responseTimeMs,
            error: log.isError
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">Showing latest logs</p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Detailed Log Entries</h2>
        <div className="overflow-auto rounded-lg shadow ring-1 ring-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Endpoint</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Error</th>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">User Agent</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {logs.map((log, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 font-medium">{log.method}</td>
                  <td className="px-4 py-2">{log.endpoint}</td>
                  <td className="px-4 py-2">{log.statusCode}</td>
                  <td className={`px-4 py-2 ${log.isError ? 'text-red-600' : 'text-green-600'}`}>
                    {log.isError ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-2">{log.userMeta?.ip || '-'}</td>
                  <td className="px-4 py-2 truncate max-w-[200px]">{log.userMeta?.userAgent || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
