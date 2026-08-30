/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { getRevenue, errMessage } from "./api";

const usd = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const firstOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);

export default function Revenue() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // send `to` as end-of-day so the chosen day is fully included
      const res = await getRevenue({ from: from || undefined, to: to ? `${to}T23:59:59` : undefined });
      setData(res.data);
    } catch (e) { setError(errMessage(e, "Failed to load revenue")); }
    finally { setLoading(false); }
  }, [from, to]);
  useEffect(() => { load(); }, [load]);

  const rows = data?.projects || [];

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={() => { setFrom(""); setTo(""); }} className="text-sm text-blue-600 pb-2">All time</button>
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700 ml-auto" title="Refresh"><FiRefreshCw /></button>
      </div>

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      {/* Totals */}
      {!loading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-xs text-green-700 uppercase font-medium">Total revenue (USD)</div>
            <div className="text-2xl font-bold text-green-800">{usd(data.totals.revenue)}</div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase font-medium">Billable skip-days</div>
            <div className="text-2xl font-bold text-gray-800">{data.totals.billableDays.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase font-medium">Deployed skips</div>
            <div className="text-2xl font-bold text-gray-800">{data.totals.skipCount}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No billable skip activity in this range.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Project</th>
              <th className="px-4 py-3 text-left font-medium">Client (IOC)</th>
              <th className="px-4 py-3 text-right font-medium">Rate / day</th>
              <th className="px-4 py-3 text-right font-medium">Skips</th>
              <th className="px-4 py-3 text-right font-medium">Skip-days</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.projectId} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.code || p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.client || "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.dailyRateUsd ? usd(p.dailyRateUsd) : <span className="text-red-500">no rate</span>}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.skipCount}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.billableDays.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{usd(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3" colSpan={3}>Total</td>
                <td className="px-4 py-3 text-right">{data.totals.skipCount}</td>
                <td className="px-4 py-3 text-right">{data.totals.billableDays.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-700">{usd(data.totals.revenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!loading && data?.unratedSkipCount > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {data.unratedSkipCount} deployed skip{data.unratedSkipCount === 1 ? "" : "s"} on a project with no daily rate set — not earning revenue. Set a rate in the Projects tab.
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">Billable days = mobilized → demobilized (or today if still on site). Rate is the project's daily USD charge per skip.</p>
    </div>
  );
}
