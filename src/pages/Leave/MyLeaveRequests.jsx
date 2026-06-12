import React, { useState } from 'react';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Approved:  'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyLeaveRequests({ requests, loading, onCancel }) {
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        You have no leave requests yet.
      </div>
    );
  }

  const totalPages = Math.ceil(requests.length / PAGE_SIZE);
  const slice = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
            <tr>
              {['Type', 'Start', 'End', 'Days', 'Status', 'Admin Comment', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {slice.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{r.leaveType}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.startDate)}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.endDate)}</td>
                <td className="px-4 py-3 text-gray-600">{r.daysRequested}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.adminComment || '—'}</td>
                <td className="px-4 py-3">
                  {r.status === 'Pending' && (
                    <button
                      onClick={() => onCancel(r._id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium transition"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={requests.length}
        limit={PAGE_SIZE}
        onPage={(p) => setPage(p)}
      />
    </div>
  );
}
