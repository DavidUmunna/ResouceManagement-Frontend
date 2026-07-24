import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import BalanceSummary from './BalanceSummary';
import LeaveRequestForm from './LeaveRequestForm';
import MyLeaveRequests from './MyLeaveRequests';
import InfoModal from '../../components/InfoModal';
import {
  createLeaveRequest,
  getLeaveRequests,
  cancelLeaveRequest,
  getMyBalance,
} from '../../services/leaveService';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];
const STATUSES    = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

const LEAVE_INSTRUCTIONS = [
  {
    heading: 'My Balance',
    items: [
      'See your remaining entitlement for each leave type (Annual, Sick, Maternity, etc.).',
      'Your balance updates automatically after every approved or cancelled request.',
    ],
  },
  {
    heading: 'Request Leave',
    items: [
      'Switch to the "Request Leave" tab and fill in the leave type, dates, and reason.',
      'The number of working days is calculated automatically from your chosen dates.',
      'Click "Submit Request" — your manager will be notified for approval.',
    ],
  },
  {
    heading: 'My Requests',
    items: [
      'Use the search bar to filter your requests by type, status, or date range, then click "Search".',
      'A request that is still Pending can be cancelled by clicking the Cancel button.',
      'Approved or Rejected requests cannot be modified — contact HR if needed.',
    ],
  },
];

const TABS = ['My Balance', 'Request Leave', 'My Requests'];

const EMPTY_SEARCH = { leaveType: '', status: '', startDate: '', endDate: '' };

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('My Balance');
  const [showInfo, setShowInfo] = useState(false);
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [search, setSearch] = useState(EMPTY_SEARCH);

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await getMyBalance();
      setBalance(res.data);
    } catch {
      toast.error('Failed to load leave balance');
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async (params = {}) => {
    setRequestsLoading(true);
    try {
      const res = await getLeaveRequests(params);
      setRequests(res.data || []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    if (activeTab === 'My Requests') loadRequests();
  }, [activeTab, loadRequests]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadRequests(search);
  };

  const handleReset = () => {
    setSearch(EMPTY_SEARCH);
    loadRequests();
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createLeaveRequest(data);
      toast.success('Leave request submitted successfully');
      loadBalance();
      setActiveTab('My Requests');
      return true;
    } catch (err) {
      const body = err?.response?.data;
      if (body?.message) {
        setSubmitError({ message: body.message, detail: body.detail || null });
      } else {
        const fallback = body?.errors?.[0] || 'Failed to submit request';
        setSubmitError({ message: fallback, detail: null });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelLeaveRequest(id);
      toast.success('Request cancelled');
      loadRequests(search);
      loadBalance();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to cancel request';
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 mt-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">View your balance, submit requests, and track their status</p>
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
          title="How to use Leave Management"
          sections={LEAVE_INSTRUCTIONS}
          onClose={() => setShowInfo(false)}
        />
      )}

      <BalanceSummary balance={balance} loading={balanceLoading} />

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

      <div>
        {activeTab === 'My Balance' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Your leave balance is shown above. It refreshes automatically after each request.
            </p>
          </div>
        )}

        {activeTab === 'Request Leave' && (
          <div className="max-w-lg mx-auto">
            <LeaveRequestForm onSubmit={handleSubmit} loading={submitting} serverError={submitError} />
          </div>
        )}

        {activeTab === 'My Requests' && (
          <div className="space-y-4">
            {/* Search form */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
            >
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-xs text-gray-500 font-medium">Leave Type</label>
                <select
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
                  value={search.startDate}
                  onChange={(e) => setSearch((s) => ({ ...s, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">To</label>
                <input
                  type="date"
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
              </div>
            </form>

            <MyLeaveRequests
              requests={requests}
              loading={requestsLoading}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
