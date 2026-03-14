import React, { useEffect, useMemo, useState } from "react";
import { FiEdit3, FiPlusSquare, FiRefreshCw, FiShield, FiTrash2 } from "react-icons/fi";
import { complianceLogService } from "./services";

const DEFAULT_SUMMARY = {
  total: 0,
  create: 0,
  update: 0,
  delete: 0,
};

const ComplianceLog = ({ serviceInstance }) => {
  const service = useMemo(() => serviceInstance || complianceLogService, [serviceInstance]);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages,setTotalPages]=useState(5)
  useEffect(() => {
    loadLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadLogs = async (nextPage) => {
    try {
      setLoading(true);
      setError("");
      const response = await service.fetchLogs({ page: nextPage, limit });
      const entries = response?.data || response?.logs || [];
      setLogs(entries);
      setTotal(response?.pagination?.total || entries.length);
      setTotalPages(response?.pagination?.totalPages)
      
      setSummary(buildSummary(entries));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load compliance logs.");
      setLogs([]);
      setTotal(0);
      setSummary(DEFAULT_SUMMARY);
    } finally {
      setLoading(false);
    }
  };
 
  const buildSummary = (entries = []) =>
    entries.reduce(
      (acc, entry) => {
        const action = (entry.action || "").toLowerCase();
        if (action === "create") acc.create += 1;
        if (action === "update") acc.update += 1;
        if (action === "delete") acc.delete += 1;
        acc.total += 1;
        return acc;
      },
      { ...DEFAULT_SUMMARY }
    );

  const formatDate = (value) => {
    if (!value) return "—";
    const [datePart, timePart] = value.split("T");
    const time = timePart ? timePart.split(".")[0] : "";
    return `${datePart} ${time}`;
  };

  const actionBadgeClasses = (action = "") => {
    const normalized = action.toLowerCase();
    if (normalized === "create") return "text-green-700 bg-green-100";
    if (normalized === "update") return "text-blue-700 bg-blue-100";
    if (normalized === "delete") return "text-red-700 bg-red-100";
    return "text-gray-700 bg-gray-100";
  };

  //const totalPages = Math.max(Math.ceil((total || logs.length) / limit), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Compliance</p>
          <h2 className="text-lg font-semibold text-gray-800">Audit Log</h2>
        </div>
        <button
          type="button"
          onClick={() => loadLogs(page)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
          disabled={loading}
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={<FiShield className="text-blue-600" />}
          label="Total entries"
          value={summary.total}
        />
        <StatCard
          icon={<FiPlusSquare className="text-green-600" />}
          label="Creates"
          value={summary.create}
        />
        <StatCard
          icon={<FiEdit3 className="text-blue-600" />}
          label="Updates"
          value={summary.update}
        />
        <StatCard
          icon={<FiTrash2 className="text-red-600" />}
          label="Deletes"
          value={summary.delete}
        />
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Entity</th>
              <th className="px-3 py-2 text-left">Performed By</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Status Change</th>
              <th className="px-3 py-2 text-left">Changed Fields</th>
              <th className="px-3 py-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
                    Loading compliance logs...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-gray-500">
                  No compliance log entries found.
                </td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry._id || entry.id}>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${actionBadgeClasses(entry.action)}`}>
                      {entry.action || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {entry.entityName || entry.entityType || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {entry.performedByName || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {entry.performedByRole || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {(entry.statusBefore || entry.statusAfter) ? `${entry.statusBefore || "—"} → ${entry.statusAfter || "—"}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {entry.changedFields?.length ? entry.changedFields.join(", ") : "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{formatDate(entry.createdAt || entry.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages || loading}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
 
};

const StatCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
    <div className="p-2 rounded-full bg-white shadow-sm">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default ComplianceLog;
