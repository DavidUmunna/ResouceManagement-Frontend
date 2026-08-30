import React from 'react';

const LEAVE_COLORS = {
  Annual:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100' },
  Sick:      { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100' },
  Maternity: { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   badge: 'bg-pink-100' },
  Paternity: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
  Emergency: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
  Unpaid:    { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-700',   badge: 'bg-gray-100' },
};

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];

export default function BalanceSummary({ balance, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {LEAVE_TYPES.map((t) => (
          <div key={t} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!balance) return null;

  const summary = balance.summary || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {LEAVE_TYPES.map((type) => {
        const data = summary[type] || { entitlement: 0, taken: 0, balance: 0 };
        const c = LEAVE_COLORS[type];
        const pct = data.entitlement > 0 ? Math.round((data.taken / data.entitlement) * 100) : 0;

        return (
          <div key={type} className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col gap-2`}>
            <span className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>{type}</span>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-bold ${c.text}`}>{data.balance}</span>
              <span className="text-xs text-gray-500">left</span>
            </div>
            <div className="w-full bg-white rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${c.badge}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{data.taken} / {data.entitlement} days used</span>
          </div>
        );
      })}
    </div>
  );
}
