import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useUser } from '../../components/usercontext';
import { getLeaveRequests, getUserBalance } from '../../services/leaveService';
import { fetch_RBAC_leave } from '../../services/rbac_service';
import InfoModal from '../../components/InfoModal';

const SUMMARY_INSTRUCTIONS = [
  {
    heading: 'Overview',
    items: [
      'This page provides a read-only summary of leave across the entire organisation — only Directors and Global Admins can view it.',
      'The stat cards at the top show totals for all employees: headcount, requests submitted, pending approvals, and approved days taken.',
    ],
  },
  {
    heading: 'Employee Table',
    items: [
      'Each row shows an employee\'s pending, approved, and rejected request counts plus total days taken.',
      'Use the search box to filter by employee name, or use the status dropdown to show only employees with pending or approved requests.',
      'Click "View Balance" on any row to see that employee\'s full leave entitlement and remaining balance per type.',
    ],
  },
  {
    heading: 'All Requests',
    items: [
      'The table below the employee list shows every individual leave request across the organisation.',
      'Use the leave-type filter buttons (Annual, Sick, etc.) to narrow the request list to a specific type.',
    ],
  },
];

const LEAVE_TYPES   = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];

const STATUS_STYLES = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Approved:  'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

// ── Balance modal ─────────────────────────────────────────────────────────────
function BalanceModal({ user, onClose }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBalance(user._id)
      .then((r) => setBalance(r.data))
      .catch(() => toast.error('Failed to load balance'))
      .finally(() => setLoading(false));
  }, [user._id]);

  const summary = balance?.summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Leave Balance</h3>
            <p className="text-sm text-gray-500">{user.name || user.username} · {user.role}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {LEAVE_TYPES.map((t) => (
              <div key={t} className="h-8 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  {['Leave Type', 'Entitlement', 'Taken', 'Remaining'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {LEAVE_TYPES.map((type) => {
                  const d = summary[type] || { entitlement: 0, taken: 0, balance: 0 };
                  return (
                    <tr key={type} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-700">{type}</td>
                      <td className="px-4 py-2 text-gray-600">{d.entitlement}</td>
                      <td className="px-4 py-2 text-gray-600">{d.taken}</td>
                      <td className="px-4 py-2">
                        <span className={`font-semibold ${d.balance < 3 ? 'text-red-600' : 'text-green-700'}`}>
                          {d.balance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeaveSummaryPage() {
  const { user } = useUser();
  const [users, setUsers]       = useState({ data: [] });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [balanceModal, setBalanceModal] = useState(null);
  const [showInfo, setShowInfo]         = useState(false);
  const [userPage, setUserPage]         = useState(1);
  const [reqPage, setReqPage]           = useState(1);
  const USER_PAGE_SIZE = 6;
  const REQ_PAGE_SIZE  =10;
  const [allowedRoles, setAllowedRoles] = useState(null);

  // RBAC is the source of truth for who may view the leave summary
  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch_RBAC_leave();
      setAllowedRoles(res?.data?.data?.LEAVE_SUMMARY_ROLES || []);
    };
    loadRoles();
  }, []);

  const rolesLoaded = Array.isArray(allowedRoles);
  const canView = rolesLoaded && allowedRoles.includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const API = process.env.REACT_APP_API_URL;
      const [usersRes, requestsRes] = await Promise.all([
        axios.get(`${API}/api/users`, {
          withCredentials: true,
          headers: { 'ngrok-skip-browser-warning': 'true' },
        }),
        getLeaveRequests(),
      ]);
      ReactDOM.unstable_batchedUpdates(() => {
        setUsers(usersRes.data?.users || usersRes.data || []);
        setRequests(requestsRes.data || []);
        setLoading(false);
      });
    } catch {
      toast.error('Failed to load leave summary');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  // Per-user request stats derived from request list
  const userStats = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      const uid = r.user?._id || r.user;
      if (!uid) return;
      if (!map[uid]) map[uid] = { pending: 0, approved: 0, rejected: 0, daysTaken: 0 };
      if (r.status === 'Pending')  map[uid].pending  += 1;
      if (r.status === 'Approved') { map[uid].approved += 1; map[uid].daysTaken += r.daysRequested || 0; }
      if (r.status === 'Rejected') map[uid].rejected += 1;
    });
    return map;
  }, [requests]);

  // Org-wide stat cards
  const stats = useMemo(() => ({
    totalUsers:   users?.data?.length ?? users.length ?? 0,
    totalRequests: requests.length,
    pending:  requests.filter((r) => r.status === 'Pending').length,
    daysTaken: requests.filter((r) => r.status === 'Approved').reduce((s, r) => s + (r.daysRequested || 0), 0),
  }), [users, requests]);
  
  // Filtered user rows — reset page when filters change
  const filteredUsers = useMemo(() => {
    setUserPage(1);
    const q = search.toLowerCase();
    return users?.data?.filter((u) => {
      const nameMatch = (u.name || u.username || '').toLowerCase().includes(q);
      if (!nameMatch) return false;
      const uid = u._id;
      const s = userStats[uid] || {};
      if (statusFilter === 'Has Pending'  && !s.pending)  return false;
      if (statusFilter === 'Has Approved' && !s.approved) return false;
      return true;
    });
  }, [users, search, statusFilter, userStats]);

  if (!rolesLoaded) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 mt-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Summary</h1>
          <p className="text-sm text-gray-500 mt-1">Read-only overview of all employee leave across the organisation</p>
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
          title="How to use Leave Summary"
          sections={SUMMARY_INSTRUCTIONS}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={stats.totalUsers}    color="border-gray-200 bg-gray-50 text-gray-800" />
        <StatCard label="Total Requests"  value={stats.totalRequests} color="border-blue-200 bg-blue-50 text-blue-800" />
        <StatCard label="Pending"         value={stats.pending}       color="border-yellow-200 bg-yellow-50 text-yellow-800" />
        <StatCard label="Days Taken (Approved)" value={stats.daysTaken} color="border-green-200 bg-green-50 text-green-800" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by employee name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search employees"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by status"
        >
          <option value="All">All employees</option>
          <option value="Has Pending">Has pending requests</option>
          <option value="Has Approved">Has approved requests</option>
        </select>
      </div>

      {/* Employee table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No employees found.</div>
      ) : (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  {['Employee', 'Role', 'Pending', 'Approved', 'Rejected', 'Days Taken', 'Balance'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody data-testid="employee-table" className="divide-y divide-gray-100 bg-white">
                {filteredUsers
                  .slice((userPage - 1) * USER_PAGE_SIZE, userPage * USER_PAGE_SIZE)
                  .map((u) => {
                    const s = userStats[u._id] || { pending: 0, approved: 0, rejected: 0, daysTaken: 0 };
                    return (
                      <tr key={u._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {u.name || u.username}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.role || '—'}</td>
                        <td className="px-4 py-3">
                          {s.pending > 0
                            ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">{s.pending}</span>
                            : <span className="text-gray-400">0</span>}
                        </td>
                        <td className="px-4 py-3 text-green-700 font-medium">{s.approved}</td>
                        <td className="px-4 py-3 text-red-600">{s.rejected}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{s.daysTaken}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setBalanceModal(u)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                          >
                            View Balance
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={userPage}
            totalPages={Math.ceil(filteredUsers.length / USER_PAGE_SIZE)}
            total={filteredUsers.length}
            limit={USER_PAGE_SIZE}
            onPage={setUserPage}
          />
        </div>
      )}

      {/* All Requests */}
      {requests.length > 0 && (() => {
        const filtered = typeFilter === 'All' ? requests : requests.filter((r) => r.leaveType === typeFilter);
        const totalReqPages = Math.ceil(filtered.length / REQ_PAGE_SIZE);
        const reqSlice = filtered.slice((reqPage - 1) * REQ_PAGE_SIZE, reqPage * REQ_PAGE_SIZE);
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-800">All Requests</h2>
            <div className="flex flex-wrap gap-2">
              {['All', ...LEAVE_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setReqPage(1); }}
                  className={`px-3 py-1 text-xs rounded-full font-medium border transition ${
                    typeFilter === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t} ({t === 'All' ? requests.length : requests.filter((r) => r.leaveType === t).length})
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                  <tr>
                    {['Employee', 'Type', 'Start', 'End', 'Days', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody data-testid="requests-table" className="divide-y divide-gray-100">
                  {reqSlice.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">
                        {r.user?.name || r.user?.username || '—'}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{r.leaveType}</td>
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                        {new Date(r.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                        {new Date(r.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{r.daysRequested}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={reqPage}
              totalPages={totalReqPages}
              total={filtered.length}
              limit={REQ_PAGE_SIZE}
              onPage={setReqPage}
            />
          </div>
        );
      })()}

      {balanceModal && (
        <BalanceModal user={balanceModal} onClose={() => setBalanceModal(null)} />
      )}
    </div>
  );
}
