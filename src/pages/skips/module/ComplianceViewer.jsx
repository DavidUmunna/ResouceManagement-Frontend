/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiChevronDown, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import { listComplianceLogs, errMessage } from "./api";
import { Badge, fmtDate } from "./helpers";

const ENTITY_TYPES = ["Skip", "Truck", "Driver", "Waybill", "Manifest", "SiteApprover", "Project", "FileTrack"];

function Detail({ log }) {
  const changed = log.changedFields && log.changedFields.length ? log.changedFields.join(", ") : null;
  return (
    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 space-y-1">
      {log.description && <p>{log.description}</p>}
      {(log.statusBefore || log.statusAfter) && (
        <p>Status: <span className="text-gray-800">{log.statusBefore || "—"}</span> → <span className="text-gray-800">{log.statusAfter || "—"}</span></p>
      )}
      {changed && <p>Changed fields: <span className="text-gray-800">{changed}</span></p>}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <pre className="bg-white border border-gray-200 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
      )}
    </div>
  );
}

export default function ComplianceViewer() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await listComplianceLogs({ entityType: entityType || undefined, action: action || undefined, page, limit: 25 });
      setLogs(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (e) { setError(errMessage(e, "Failed to load compliance logs")); }
    finally { setLoading(false); }
  }, [entityType, action, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [entityType, action]);

  const totalPages = pagination.totalPages || pagination.pages || 1;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="py-2 px-3 border border-gray-300 rounded-lg text-sm">
          <option value="">All entities</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action (e.g. CREATE, SCAN, APPROVE)" className="py-2 px-3 border border-gray-300 rounded-lg text-sm min-w-[220px]" />
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
      </div>

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr>
            <th className="px-3 py-3 w-8"></th>
            <th className="px-4 py-3 text-left font-medium">When</th>
            <th className="px-4 py-3 text-left font-medium">Entity</th>
            <th className="px-4 py-3 text-left font-medium">Action</th>
            <th className="px-4 py-3 text-left font-medium">Performed by</th>
          </tr></thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No compliance entries match these filters.</td></tr>
            ) : (
              logs.map((log) => {
                const open = expanded === log._id;
                const isApprover = log.performedByModel === "siteapprover";
                return (
                  <React.Fragment key={log._id}>
                    <tr onClick={() => setExpanded(open ? null : log._id)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="px-3 py-3 text-gray-400">{open ? <FiChevronDown /> : <FiChevronRight />}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.createdAt || log.performedAt)}</td>
                      <td className="px-4 py-3"><Badge color="gray">{log.entityType}</Badge> <span className="text-gray-700">{log.entityName || ""}</span></td>
                      <td className="px-4 py-3"><Badge color="blue">{log.action}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge color={isApprover ? "purple" : "green"}>{isApprover ? "Site Approver" : "User"}</Badge>
                      </td>
                    </tr>
                    {open && <tr><td colSpan={5} className="p-0"><Detail log={log} /></td></tr>}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm text-gray-600">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
