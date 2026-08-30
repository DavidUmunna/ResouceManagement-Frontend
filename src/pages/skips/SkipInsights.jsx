/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const usd = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const STREAM_COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#9333ea"];

function Kpi({ label, value, sub, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-50 border-gray-100 text-gray-800",
    green: "bg-green-50 border-green-100 text-green-800",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-800",
    red: "bg-red-50 border-red-100 text-red-800",
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    indigo: "bg-blue-50 border-blue-100 text-blue-800",
  };
  return (
    <div className={`border rounded-lg p-4 ${tones[tone]}`}>
      <div className="text-xs uppercase font-medium opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

const shortWeek = (w) => { const d = new Date(w); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); };

// Uniform empty placeholder — same size + styling across every panel.
function EmptyPanel({ children }) {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
      {children}
    </div>
  );
}

export default function SkipInsights() {
  const [range, setRange] = useState({ startDate: new Date(Date.now() - 90 * 864e5), endDate: new Date() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const res = await axios.get(`${API_URL}/skiptrack/insights`, {
        params: {
          from: range.startDate ? range.startDate.toISOString() : undefined,
          to: range.endDate ? range.endDate.toISOString() : undefined,
        },
        headers: { "ngrok-skip-browser-warning": "true" },
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const k = data?.kpis;
  const chartOpts = () => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: false } },
    scales: { y: { beginAtZero: true } },
  });

  return (
    <div className="bg-white w-full p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 pt-10">Skip Insights</h2>
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange startDate={range.startDate} endDate={range.endDate}
            onChange={([s, e]) => setRange({ startDate: s, endDate: e })}
            isClearable placeholderText="Date range"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm w-56"
          />
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error} <button onClick={load} className="underline ml-2">Retry</button></div>}

      {loading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Kpi label="On site now" value={k.onSite} sub={`${k.utilizationPct}% of ${k.totalActive} active`} tone="blue" />
            <Kpi label={`Overdue (>${k.overdueDaysThreshold}d)`} value={k.overdue} sub="awaiting collection" tone={k.overdue ? "red" : "gray"} />
            <Kpi label="Avg turnaround" value={`${k.avgTurnaroundDays} d`} sub="mobilize → demobilize" tone="blue" />
            <Kpi label="Utilization" value={`${k.utilizationPct}%`} sub="deployed vs active" tone="gray" />
            <Kpi label="Rentals expiring" value={k.rentalsExpiringSoon} sub="within lead window" tone={k.rentalsExpiringSoon ? "yellow" : "gray"} />
            <Kpi label="Revenue (period)" value={usd(k.periodRevenueUsd)} sub="USD" tone="green" />
          </div>

          {/* Throughput + Turnaround */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Throughput — mobilized vs demobilized (per week)</h3>
              {data.throughput.some((t) => t.mobilized || t.demobilized) ? (
                <div className="h-64">
                  <Bar
                    data={{
                      labels: data.throughput.map((t) => shortWeek(t.week)),
                      datasets: [
                        { label: "Mobilized", data: data.throughput.map((t) => t.mobilized), backgroundColor: "#4f46e5" },
                        { label: "Demobilized", data: data.throughput.map((t) => t.demobilized), backgroundColor: "#16a34a" },
                      ],
                    }}
                    options={chartOpts()}
                  />
                </div>
              ) : <EmptyPanel>No throughput in range</EmptyPanel>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Turnaround time trend (per week)</h3>
              {data.turnaround.some((t) => t.avgDays != null) ? (
                <div className="h-64">
                  <Line
                    data={{
                      labels: data.turnaround.map((t) => shortWeek(t.week)),
                      datasets: [{ label: "Avg turnaround (days)", data: data.turnaround.map((t) => t.avgDays), borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.4)", tension: 0.2, spanGaps: true }],
                    }}
                    options={chartOpts()}
                  />
                </div>
              ) : <EmptyPanel>No turnaround in range</EmptyPanel>}
            </div>
          </div>

          {/* By stream + By project */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Waste by stream (tonnes)</h3>
              {data.byStream.length ? (
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: data.byStream.map((s) => s.stream),
                      datasets: [{ data: data.byStream.map((s) => s.tonnes), backgroundColor: STREAM_COLORS }],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                  />
                </div>
              ) : <EmptyPanel>No volume in range</EmptyPanel>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Revenue by project (IOC)</h3>
              {data.byProject.length ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg h-64">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600"><tr>
                      <th className="px-3 py-2 text-left font-medium">Project</th>
                      <th className="px-3 py-2 text-left font-medium">Client</th>
                      <th className="px-3 py-2 text-right font-medium">Skips</th>
                      <th className="px-3 py-2 text-right font-medium">Revenue</th>
                    </tr></thead>
                    <tbody>
                      {data.byProject.map((p) => (
                        <tr key={p.projectId} className="border-b border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-800">{p.code || p.name}</td>
                          <td className="px-3 py-2 text-gray-600">{p.client || "—"}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{p.skipCount}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-800">{usd(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyPanel>No project revenue in range</EmptyPanel>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
