/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiPlus, FiRefreshCw } from "react-icons/fi";
import { listProjects, createProject, updateProject, errMessage } from "./api";
import { can } from "./permissions";
import { Badge } from "./helpers";

export default function Projects({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", client: "", site: "", dailyRateUsd: "" });
  const [rateEdits, setRateEdits] = useState({}); // projectId -> string

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await listProjects(); setItems(r.data || []); }
    catch (e) { setError(errMessage(e, "Failed to load projects")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ type: "ok", text: ok }); await load(); }
    catch (e) { setMsg({ type: "err", text: errMessage(e) }); }
    finally { setBusy(false); }
  };

  const submitCreate = () => run(async () => {
    await createProject({
      name: form.name.trim(), code: form.code.trim() || undefined, client: form.client.trim(), site: form.site.trim(),
      dailyRateUsd: form.dailyRateUsd === "" ? 0 : Number(form.dailyRateUsd),
    });
    setForm({ name: "", code: "", client: "", site: "", dailyRateUsd: "" });
    setShowCreate(false);
  }, "Project created");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        {can(user, "manageProjects") && (
          <button onClick={() => setShowCreate((s) => !s)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"><FiPlus /> New Project</button>
        )}
      </div>

      {msg && <div className={`mb-3 text-sm px-4 py-2 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 grid sm:grid-cols-5 gap-2 items-end">
          <div><label className="block text-xs text-gray-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ACME-RIG7" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Client (IOC)</label><input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Rate $/day</label><input type="number" min="0" value={form.dailyRateUsd} onChange={(e) => setForm({ ...form, dailyRateUsd: e.target.value })} placeholder="120" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Site</label><input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
            <button disabled={busy || !form.name.trim()} onClick={submitCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 self-end">Create</button>
          </div>
        </div>
      )}

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No projects yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Client</th>
              <th className="px-4 py-3 text-left font-medium">Rate $/day</th>
              <th className="px-4 py-3 text-left font-medium">Site</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr></thead>
            <tbody>
              {items.map((p) => {
                const editing = rateEdits[p._id] !== undefined;
                return (
                <tr key={p._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.code || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.client || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {can(user, "manageProjects") ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number" min="0"
                          value={editing ? rateEdits[p._id] : (p.dailyRateUsd ?? 0)}
                          onChange={(e) => setRateEdits({ ...rateEdits, [p._id]: e.target.value })}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        {editing && (
                          <button disabled={busy} onClick={() => run(async () => { await updateProject(p._id, { dailyRateUsd: Number(rateEdits[p._id]) || 0 }); setRateEdits((prev) => { const n = { ...prev }; delete n[p._id]; return n; }); }, "Rate updated")} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                        )}
                      </div>
                    ) : (p.dailyRateUsd ? `$${p.dailyRateUsd}` : "—")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.site || "—"}</td>
                  <td className="px-4 py-3">
                    <button disabled={busy || !can(user, "manageProjects")} onClick={() => run(() => updateProject(p._id, { active: !(p.active !== false) }), "Project updated")} className="focus:outline-none" title="Toggle active">
                      <Badge color={p.active === false ? "gray" : "green"}>{p.active === false ? "inactive" : "active"}</Badge>
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
