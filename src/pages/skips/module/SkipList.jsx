/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { listSkips, listProjects, errMessage } from "./api";
import { getSkipStage, stageColor, rentalExpiry, Badge } from "./helpers";

const WASTE_STREAMS = ["WBM_Affluent", "OBM_Cutting", "WBM_cutting", "OBM_Affluent", "Sludge", "Others"];

function SkeletonRows() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          {[...Array(6)].map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function SkipList({ onSelect, onNew, canCreate }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [wasteStream, setWasteStream] = useState("");
  const [ownership, setOwnership] = useState("");
  const [active, setActive] = useState("");
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => { listProjects().then((r) => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchSkips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listSkips({ search, wasteStream, ownership, active, project, page, limit: 20 });
      setItems(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (e) {
      setError(errMessage(e, "Failed to load skips"));
    } finally {
      setLoading(false);
    }
  }, [search, wasteStream, ownership, active, project, page]);

  useEffect(() => {
    const t = setTimeout(fetchSkips, search ? 350 : 0); // debounce search
    return () => clearTimeout(t);
  }, [fetchSkips]);

  // reset to page 1 when a filter changes
  useEffect(() => { setPage(1); }, [search, wasteStream, ownership, active, project]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skip ID"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select value={wasteStream} onChange={(e) => setWasteStream(e.target.value)} className="py-2 px-3 border border-gray-300 rounded-lg text-sm">
          <option value="">All waste streams</option>
          {WASTE_STREAMS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={ownership} onChange={(e) => setOwnership(e.target.value)} className="py-2 px-3 border border-gray-300 rounded-lg text-sm">
          <option value="">Owned & rented</option>
          <option value="owned">Owned</option>
          <option value="rented">Rented</option>
        </select>
        <select value={active} onChange={(e) => setActive(e.target.value)} className="py-2 px-3 border border-gray-300 rounded-lg text-sm">
          <option value="">Active & inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={project} onChange={(e) => setProject(e.target.value)} className="py-2 px-3 border border-gray-300 rounded-lg text-sm">
          <option value="">All projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.code || p.name}</option>)}
        </select>
        <button onClick={fetchSkips} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh">
          <FiRefreshCw />
        </button>
        {canCreate && (
          <button onClick={onNew} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            + New Skip
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
          <FiAlertTriangle /> {error}
          <button onClick={fetchSkips} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Skip ID</th>
              <th className="px-4 py-3 text-left font-medium">Project</th>
              <th className="px-4 py-3 text-left font-medium">Waste stream</th>
              <th className="px-4 py-3 text-left font-medium">Ownership</th>
              <th className="px-4 py-3 text-left font-medium">RFID tag</th>
              <th className="px-4 py-3 text-left font-medium">Stage</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No skips match these filters.</td></tr>
            ) : (
              items.map((s) => {
                const stage = getSkipStage(s);
                const rent = rentalExpiry(s);
                return (
                  <tr key={s._id} onClick={() => onSelect(s._id)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.skip_id}</td>
                    <td className="px-4 py-3">{s.projectId ? <Badge color="blue">{s.projectId.code || s.projectId.name}</Badge> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{s.WasteStream}</td>
                    <td className="px-4 py-3">
                      <Badge color={s.ownership === "rented" ? "yellow" : "gray"}>{s.ownership || "owned"}</Badge>
                      {rent.expiring && (
                        <Badge color="red" className="ml-1">{rent.overdue ? "overdue" : "expiring"}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.rfidTag || <span className="text-gray-400">Not tagged</span>}</td>
                    <td className="px-4 py-3"><Badge color={stageColor(stage)}>{stage}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge color={s.active === false ? "gray" : "green"}>{s.active === false ? "inactive" : "active"}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>{pagination.total} skip{pagination.total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Prev</button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
