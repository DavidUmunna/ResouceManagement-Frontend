import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Cell,
} from 'recharts';
import InfoModal from '../../components/InfoModal';
import { getSpendSummary, getSpendByDepartment, getSpendByStatus } from '../../services/OrderService';

const INSTRUCTIONS = [
  {
    heading: 'Overview',
    items: [
      'The KPI cards at the top show org-wide totals: gross spend, approved spend, order count, and average order value.',
      'All figures use the price × quantity formula across every product line in each order.',
    ],
  },
  {
    heading: 'Filters',
    items: [
      'Use the Start Date and End Date fields to narrow all three charts and cards to a specific period.',
      'Leave both dates empty to see all-time data.',
      'Click "Apply" to refresh, or "Reset" to clear the date range.',
    ],
  },
  {
    heading: 'Charts',
    items: [
      'Department Spend — horizontal bar chart showing total spend per requesting department, sorted highest first.',
      'Spend by Status — bar chart showing total spend and order count per approval status.',
      'Hover over any bar for exact figures.',
    ],
  },
  {
    heading: 'Department Table',
    items: [
      'The table below the charts lists each department with its order count, total spend, and per-status breakdown.',
    ],
  },
];

const STATUS_COLORS = {
  Pending:           '#f59e0b',
  Approved:          '#22c55e',
  Completed:         '#3b82f6',
  Rejected:          '#ef4444',
  'More Information': '#a855f7',
  'Awaiting Funding': '#64748b',
};

const NGN = (value) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value ?? 0);

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return <div className="rounded-xl border border-gray-200 p-4 h-24 animate-pulse bg-gray-100" />;
}

function ChartSkeleton({ height = 260 }) {
  return <div className={`rounded-xl bg-gray-100 animate-pulse w-full`} style={{ height }} />;
}

const DeptTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-sm space-y-1">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-blue-700">{NGN(payload[0]?.value)}</p>
    </div>
  );
};

const StatusTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-sm space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill || p.color }}>
          {p.name}: {p.name === 'Spend' ? NGN(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

function currentMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { first, last };
}

export default function POAnalyticsPage() {
  const { first: monthStart, last: monthEnd } = currentMonthRange();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary]           = useState(null);
  const [byDept, setByDept]             = useState([]);
  const [byStatus, setByStatus]         = useState([]);
  const [startDate, setStartDate]       = useState(monthStart);
  const [endDate, setEndDate]           = useState(monthEnd);
  const [pendingStart, setPendingStart] = useState(monthStart);
  const [pendingEnd, setPendingEnd]     = useState(monthEnd);
  const [showInfo, setShowInfo]         = useState(false);

  const load = useCallback(async (sd, ed) => {
    setLoading(true);
    try {
      const params = {};
      if (sd) params.startDate = sd;
      if (ed) params.endDate   = ed;

      const [sumRes, deptRes, statusRes] = await Promise.all([
        getSpendSummary(params),
        getSpendByDepartment(params),
        getSpendByStatus(params),
      ]);

      setSummary(sumRes.data);
      setByDept(deptRes.data?.byDepartment ?? []);
      setByStatus(statusRes.data?.byStatus ?? []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(monthStart, monthEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleApply = (e) => {
    e.preventDefault();
    setStartDate(pendingStart);
    setEndDate(pendingEnd);
    load(pendingStart, pendingEnd);
  };

  const handleReset = () => {
    setPendingStart(monthStart);
    setPendingEnd(monthEnd);
    setStartDate(monthStart);
    setEndDate(monthEnd);
    load(monthStart, monthEnd);
  };

  const totals = summary?.totals ?? { totalOrders: 0, totalSpend: 0, avgOrderValue: 0 };
  const approvedSpend = (summary?.byStatus ?? [])
    .filter((s) => ['Approved', 'Completed'].includes(s.status))
    .reduce((acc, s) => acc + s.totalSpend, 0);

  // Recharts needs a key named for the dataKey; rename department → name for XAxis
  const deptChartData = byDept.map((d) => ({ ...d, name: d.department || 'Unknown' }));
  const statusChartData = byStatus.map((s) => ({
    ...s,
    name: s.status,
    Spend: s.totalSpend,
    Orders: s.totalOrders,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 mt-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchase Order Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Spend breakdown by department and approval status
            {(startDate || endDate) && (
              <span className="ml-2 text-blue-600 font-medium">
                · {startDate === monthStart && endDate === monthEnd
                  ? 'This month'
                  : `${startDate || '…'} → ${endDate || '…'}`}
              </span>
            )}
          </p>
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
          title="How to use PO Analytics"
          sections={INSTRUCTIONS}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Date filter */}
      <form
        onSubmit={handleApply}
        className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Start Date</label>
          <input
            type="date"
            value={pendingStart}
            onChange={(e) => setPendingStart(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">End Date</label>
          <input
            type="date"
            value={pendingEnd}
            onChange={(e) => setPendingEnd(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 pb-0.5">
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            Apply
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Gross Spend"
              value={NGN(totals.totalSpend)}
              color="border-blue-200 bg-blue-50 text-blue-800"
            />
            <StatCard
              label="Approved Spend"
              value={NGN(approvedSpend)}
              sub="Approved + Completed"
              color="border-green-200 bg-green-50 text-green-800"
            />
            <StatCard
              label="Total Orders"
              value={totals.totalOrders.toLocaleString()}
              color="border-gray-200 bg-gray-50 text-gray-800"
            />
            <StatCard
              label="Avg Order Value"
              value={NGN(totals.avgOrderValue)}
              color="border-purple-200 bg-purple-50 text-purple-800"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department spend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Spend by Department</h2>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : deptChartData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(260, deptChartData.length * 44)}>
              <BarChart
                data={deptChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: '#374151' }}
                />
                <Tooltip content={<DeptTooltip />} />
                <Bar dataKey="totalSpend" name="Spend" radius={[0, 4, 4, 0]}>
                  {deptChartData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Spend &amp; Orders by Status</h2>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : statusChartData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusChartData} margin={{ top: 4, right: 16, left: 8, bottom: 24 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  yAxisId="spend"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip content={<StatusTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="spend" dataKey="Spend" name="Spend" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Bar>
                <Bar yAxisId="count" dataKey="Orders" name="Orders" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Department detail table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Department Detail</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : byDept.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No department data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  {['Department', 'Orders', 'Total Spend', 'Avg Order', 'Status Breakdown'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byDept.map((row) => (
                  <tr key={row.department} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {row.department || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{NGN(row.totalSpend)}</td>
                    <td className="px-4 py-3 text-gray-600">{NGN(row.avgOrderValue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(row.statusBreakdown ?? {}).map(([status, count]) => (
                          <span
                            key={status}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${STATUS_COLORS[status] ?? '#94a3b8'}20`,
                              color: STATUS_COLORS[status] ?? '#64748b',
                            }}
                          >
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
