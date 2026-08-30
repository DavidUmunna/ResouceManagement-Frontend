/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiPlus, FiRefreshCw } from "react-icons/fi";
import { listSiteApprovers, createSiteApprover, updateSiteApprover, errMessage } from "./api";
import { Badge, fmtDate } from "./helpers";

// Suggest a reasonable temp password so the admin doesn't invent a weak one.
const genPassword = () => `Halden-${Math.random().toString(36).slice(2, 8)}${Math.floor(10 + Math.random() * 90)}`;

export default function SiteApprovers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", site: "", tempPassword: genPassword() });
  const [created, setCreated] = useState(null); // { name, phone, tempPassword } to show once

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await listSiteApprovers(); setItems(r.data || []); }
    catch (e) { setError(errMessage(e, "Failed to load site approvers")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    setBusy(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ type: "ok", text: ok }); await load(); }
    catch (e) { setMsg({ type: "err", text: errMessage(e) }); }
    finally { setBusy(false); }
  };

  const submitCreate = () =>
    run(async () => {
      const payload = { name: form.name.trim(), phone: form.phone.trim(), site: form.site.trim(), tempPassword: form.tempPassword };
      await createSiteApprover(payload);
      // Show the temp password once so the admin can hand it over.
      setCreated({ name: payload.name, phone: payload.phone, tempPassword: payload.tempPassword });
      setForm({ name: "", phone: "", site: "", tempPassword: genPassword() });
      setShowCreate(false);
    }, null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        <button onClick={() => { setShowCreate((s) => !s); setCreated(null); }} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"><FiPlus /> New Approver</button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        External approvers sign manifests in the Site Approver Portal. They log in with their phone + a temporary password, verify by SMS code, and set their own password. If they forget it, they reset it themselves from the portal (phone + SMS code) — no admin needed.
      </p>

      {msg && <div className={`mb-3 text-sm px-4 py-2 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      {created && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-yellow-800">Approver created — share these credentials now (shown once):</p>
          <p className="text-yellow-800 mt-1">{created.name} · <strong>{created.phone}</strong> · temp password: <strong>{created.tempPassword}</strong></p>
          <p className="text-yellow-700 mt-1">They'll be prompted to change it on first login.</p>
        </div>
      )}

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 grid sm:grid-cols-4 gap-2 items-end">
          <div><label className="block text-xs text-gray-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Phone * (SMS)</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234800…" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Site</label><input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Temp password *</label><input value={form.tempPassword} onChange={(e) => setForm({ ...form, tempPassword: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" /></div>
            <button disabled={busy || !form.name.trim() || !form.phone.trim() || form.tempPassword.length < 8} onClick={submitCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 self-end">Create</button>
          </div>
        </div>
      )}

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No site approvers yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Site</th>
              <th className="px-4 py-3 text-left font-medium">Last login</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{a.site || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{a.lastLoginAt ? fmtDate(a.lastLoginAt) : <span className="text-gray-300">never</span>}</td>
                  <td className="px-4 py-3">
                    <Badge color={a.active === false ? "gray" : "green"}>{a.active === false ? "inactive" : "active"}</Badge>
                    {a.mustChangePassword && <Badge color="yellow" className="ml-1">temp pw</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button disabled={busy} onClick={() => run(() => updateSiteApprover(a._id, { active: !(a.active !== false) }), "Approver updated")} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
                      {a.active === false ? "Reactivate" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
