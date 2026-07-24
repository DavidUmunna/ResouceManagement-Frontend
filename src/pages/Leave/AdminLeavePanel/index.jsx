import React, { useEffect, useState, useCallback } from 'react';
import Pagination from '../../../components/Pagination';
import { toast } from 'react-toastify';
import { useUser } from '../../../components/usercontext';
import {
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  deleteLeaveRequest,
  exportLeaveRequests,
} from '../../../services/leaveService';
import ActionModal from './ActionModal';
import EntitlementEditor from './EntitlementEditor';
import InfoModal from '../../../components/InfoModal';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { fetch_RBAC_leave } from '../../../services/rbac_service';
import axios from 'axios';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];
const STATUSES    = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

const ADMIN_INSTRUCTIONS = [
  {
    heading: 'All Requests',
    items: [
      'Use the search bar to filter by employee name, leave type, status, or date range, then click "Search".',
      'Click "Approve" or "Reject" on any Pending request — you will be prompted to add an optional comment before confirming.',
      'Approved requests can be cancelled by clicking the "Cancel" button on that row.',
    ],
  },
  {
    heading: 'Entitlements',
    items: [
      'Set the organisation-wide default leave policy (e.g. 21 days Annual, 10 days Sick) under "Organisation Leave Policy" and click "Save Policy".',
      'To override entitlements for a specific employee, select them from the dropdown and edit each leave type individually, then click "Save All Changes".',
      'Per-employee overrides take precedence over the organisation-wide policy.',
    ],
  },
];

const STATUS_STYLES = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Approved:  'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const TABS = ['All Requests', 'Entitlements'];

const EMPTY_SEARCH = { employee: '', leaveType: '', status: '', startDate: '', endDate: '' };

function fmt(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminLeavePanel() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('All Requests');
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage]   = useState(1);
  const [meta, setMeta]   = useState({ total: 0, totalPages: 1, limit: 15 });
  const [users, setUsers] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminRoles, setAdminRoles] = useState(null);

  // RBAC is the source of truth for who may administer leave
  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch_RBAC_leave();
      setAdminRoles(res?.data?.data?.LEAVE_ADMIN_ROLES || []);
    };
    loadRoles();
  }, []);

  const rolesLoaded = Array.isArray(adminRoles);
  const isAdmin = rolesLoaded && adminRoles.includes(user?.role);

  const loadRequests = useCallback(async (params = {}) => {
    setLoadingReqs(true);
    try {
      const res = await getLeaveRequests(params);
      setRequests(res.data || []);
      if (res.total !== undefined) {
        setMeta({ total: res.total, totalPages: res.totalPages || 1, limit: res.limit || 20 });
      }
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setLoadingReqs(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadRequests({ ...search, page, limit: meta.limit });
  }, [isAdmin, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab !== 'Entitlements') return;
    const API = process.env.REACT_APP_API_URL;
    axios
      .get(`${API}/api/users`, {
        withCredentials: true,
        headers: { 'ngrok-skip-browser-warning': 'true' },
      })
      .then((r) => setUsers(r.data?.users || r.data || []))
      .catch(() => toast.error('Failed to load users'));
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadRequests({ ...search, page: 1, limit: meta.limit });
  };

  const handleReset = () => {
    setSearch(EMPTY_SEARCH);
    setPage(1);
    loadRequests({ page: 1, limit: meta.limit });
  };

  const handleConfirm = async (id, comment) => {
    setActionLoading(true);
    try {
      if (modal.action === 'approve') {
        await approveLeaveRequest(id, comment);
        toast.success('Request approved');
      } else {
        await rejectLeaveRequest(id, comment);
        toast.success('Request rejected');
      }
      setModal(null);
      loadRequests({ ...search, page, limit: meta.limit });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLeaveRequests(search);
    } catch {
      toast.error('Failed to export leave data');
    } finally {
      setExporting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelLeaveRequest(id);
      toast.success('Leave cancelled');
      loadRequests({ ...search, page, limit: meta.limit });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLeaveRequest(id);
      toast.success('Leave request permanently deleted');
      setDeleteTarget(null);
      loadRequests({ ...search, page, limit: meta.limit });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete request');
    }
  };

  if (!rolesLoaded) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        You do not have permission to view this page.
      </div>
    );
  }

  const counts = {
    total:     requests.length,
    Pending:   requests.filter((r) => r.status === 'Pending').length,
    Approved:  requests.filter((r) => r.status === 'Approved').length,
    Rejected:  requests.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 mt-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Administration</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, and manage employee leave</p>
        </div>
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
          title="How to use Leave Administration"
          sections={ADMIN_INSTRUCTIONS}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total',    value: counts.total,    color: 'bg-gray-100 text-gray-700' },
          { label: 'Pending',  value: counts.Pending,  color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Approved', value: counts.Approved, color: 'bg-green-100 text-green-700' },
          { label: 'Rejected', value: counts.Rejected, color: 'bg-red-100 text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`px-4 py-2 rounded-full text-sm font-semibold ${color}`}>
            {label}: {value}
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'All Requests' && (
        <div className="space-y-4">
          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="text-xs text-gray-500 font-medium">Employee name</label>
              <input
                type="text"
                placeholder="Search by name…"
                aria-label="Employee name"
                value={search.employee}
                onChange={(e) => setSearch((s) => ({ ...s, employee: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-xs text-gray-500 font-medium">Leave Type</label>
              <select
                aria-label="Leave type"
                value={search.leaveType}
                onChange={(e) => setSearch((s) => ({ ...s, leaveType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All types</option>
                {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <select
                aria-label="Status"
                value={search.status}
                onChange={(e) => setSearch((s) => ({ ...s, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">From</label>
              <input
                type="date"
                aria-label="From date"
                value={search.startDate}
                onChange={(e) => setSearch((s) => ({ ...s, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">To</label>
              <input
                type="date"
                aria-label="To date"
                value={search.endDate}
                onChange={(e) => setSearch((s) => ({ ...s, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pb-0.5">
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || loadingReqs}
                className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Exporting…
                  </>
                ) : 'Export Excel'}
              </button>
            </div>
          </form>

          {loadingReqs ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No requests found.</div>
          ) : (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                    <tr>
                      {['Employee', 'Type', 'Start', 'End', 'Days', 'Reason', 'Status', 'Submitted', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {requests.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {r.user?.name || r.user?.username || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.leaveType}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.startDate)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.endDate)}</td>
                        <td className="px-4 py-3 text-gray-600">{r.daysRequested}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || ''}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          {r.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setModal({ request: r, action: 'approve' })}
                                className="text-xs px-2.5 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setModal({ request: r, action: 'reject' })}
                                className="text-xs px-2.5 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {r.status === 'Approved' && (
                            <button
                              onClick={() => handleCancel(r._id)}
                              className="text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
                            >
                              Cancel
                            </button>
                          )}
                          {r.status !== 'Pending' && r.status !== 'Approved' && r.adminComment && (
                            <span className="text-xs text-gray-400 italic">{r.adminComment}</span>
                          )}
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPage={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'Entitlements' && (
        <EntitlementEditor users={users} />
      )}

      {modal && (
        <ActionModal
          request={modal.request}
          action={modal.action}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          orderId={deleteTarget._id}
        />
      )}
    </div>
  );
}
