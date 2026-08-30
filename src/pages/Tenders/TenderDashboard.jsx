import React, { useEffect, useState } from "react";
import { fetchTenders } from "../../services/tenderService";

const statusPill = {
  Draft: "bg-gray-100 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Submitted: "bg-green-100 text-green-800",
};

const TenderDashboard = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    startDate: "",
    endDate: "",
  });

  const loadTenders = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        search: filters.search || undefined,
        status: filters.status !== "All" ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      const res = await fetchTenders(params);
      setTenders(res?.data || res?.tenders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load tenders.");
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deadlineClass = (date) => {
    if (!date) return "";
    const now = new Date();
    const d = new Date(date);
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-red-600 font-semibold";
    if (diff <= 3) return "text-yellow-600 font-semibold";
    return "text-gray-800";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tenders</p>
          <h2 className="text-lg font-semibold text-gray-800">Tender Dashboard</h2>
        </div>
        <button
          onClick={loadTenders}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search tenders"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All</option>
          <option>Draft</option>
          <option>In Progress</option>
          <option>Submitted</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Deadline</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-left">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-gray-600">
                  Loading tenders...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : tenders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                  No tenders found.
                </td>
              </tr>
            ) : (
              tenders.map((tender) => (
                <tr key={tender._id || tender.id}>
                  <td className="px-3 py-2 text-gray-800 font-medium">{tender.title || "Untitled"}</td>
                  <td className="px-3 py-2 text-gray-700">{tender.client || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusPill[tender.status] || "bg-gray-100 text-gray-700"}`}>
                      {tender.status || "Draft"}
                    </span>
                  </td>
                  <td className={`px-3 py-2 ${deadlineClass(tender.deadline)}`}>
                    {tender.deadline ? tender.deadline.split("T")[0] : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{tender.owner || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{tender.updatedAt ? tender.updatedAt.split("T")[0] : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenderDashboard;
