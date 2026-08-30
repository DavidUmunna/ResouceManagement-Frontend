/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiAlertTriangle, FiPlus, FiRefreshCw, FiDownload } from "react-icons/fi";
import {
  listManifests, getManifest, createManifest, listSkips, listSiteApprovers, openManifestPdf, errMessage,
} from "./api";
import { can } from "./permissions";
import { Badge, fmtDate } from "./helpers";

const STATUS_COLOR = { draft: "gray", issued: "yellow", signed: "green", completed: "blue", rejected: "red" };
const statusRank = (s) => (s === "issued" ? 0 : 1);

function ManifestList({ user, onOpen, onNew }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await listManifests();
      setItems((res.data || []).slice().sort((a, b) => statusRank(a.status) - statusRank(b.status)));
    } catch (e) { setError(errMessage(e, "Failed to load manifests")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        {can(user, "createManifest") && (
          <button onClick={onNew} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"><FiPlus /> New Manifest</button>
        )}
      </div>
      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No manifests yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Manifest</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Skips</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr></thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id} onClick={() => onOpen(m._id)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.manifestNo}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[m.status] || "gray"}>{m.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{(m.attachedSkipIds || []).length}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(m.createdAt, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ManifestCreate({ onDone, onCancel }) {
  const [form, setForm] = useState({ manifestNo: "", notes: "", siteApproverId: "" });
  const [skips, setSkips] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only demobilized skips can go on a manifest; approvers for assignment.
    Promise.all([
      listSkips({ stage: "demobilized", limit: 100 }),
      listSiteApprovers({ active: "true" }),
    ])
      .then(([s, a]) => { setSkips(s.items || []); setApprovers(a.data || []); })
      .catch((e) => setError(errMessage(e, "Failed to load form data")))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    setBusy(true); setError("");
    try {
      await createManifest({ manifestNo: form.manifestNo.trim(), notes: form.notes.trim(), siteApproverId: form.siteApproverId || undefined, skipIds: selected });
      onDone();
    } catch (e) { setError(errMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <button onClick={onCancel} className="text-blue-600 flex items-center gap-1 text-sm mb-4"><FiArrowLeft /> Back</button>
      <h2 className="text-lg font-bold text-gray-800 mb-4">New Manifest</h2>
      {error && <div className="mb-3 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3 mb-2">
        <input placeholder="Manifest no. *" value={form.manifestNo} onChange={(e) => setForm({ ...form, manifestNo: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <select value={form.siteApproverId} onChange={(e) => setForm({ ...form, siteApproverId: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Assign site approver…</option>
          {approvers.map((a) => <option key={a._id} value={a._id}>{a.name}{a.site ? ` · ${a.site}` : ""}</option>)}
        </select>
      </div>
      <p className="text-xs text-gray-400 mb-4">The assigned approver signs this manifest in the Site Approver Portal.</p>

      <p className="text-sm font-medium text-gray-700 mb-2">Select skips <span className="text-gray-400 font-normal">(only demobilized skips are eligible)</span></p>
      <div className="border border-gray-200 rounded-lg max-h-64 overflow-auto mb-4">
        {loading ? <div className="p-4 text-gray-400 text-sm">Loading skips…</div>
          : skips.length === 0 ? <div className="p-4 text-gray-400 text-sm">No eligible skips.</div>
          : skips.map((s) => (
            <label key={s._id} className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggle(s._id)} />
              <span className="font-medium text-gray-800">{s.skip_id}</span>
              <span className="text-gray-500 text-sm">{s.WasteStream}</span>
            </label>
          ))}
      </div>

      <button disabled={busy || !form.manifestNo.trim()} onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg disabled:opacity-50">
        {busy ? "Creating…" : `Create manifest${selected.length ? ` (${selected.length} skips)` : ""}`}
      </button>
    </div>
  );
}

function ManifestDetail({ manifestId, onBack }) {
  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await getManifest(manifestId); setM(r.data); }
    catch (e) { setError(errMessage(e, "Failed to load manifest")); }
    finally { setLoading(false); }
  }, [manifestId]);
  useEffect(() => { load(); }, [load]);

  const downloadPdf = async () => {
    setPdfBusy(true); setPdfErr("");
    try { await openManifestPdf(manifestId); }
    catch (e) { setPdfErr(errMessage(e, "Couldn't open the PDF")); }
    finally { setPdfBusy(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading manifest…</div>;
  if (error) return <div className="p-4"><button onClick={onBack} className="text-blue-600 flex items-center gap-1 mb-3"><FiArrowLeft /> Back</button><div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div></div>;
  if (!m) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 flex items-center gap-1 text-sm"><FiArrowLeft /> Back to manifests</button>
        <div className="flex items-center gap-2">
          <Badge color={STATUS_COLOR[m.status] || "gray"}>{m.status}</Badge>
          <button onClick={downloadPdf} disabled={pdfBusy} className="flex items-center gap-1 text-sm border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg disabled:opacity-50">
            <FiDownload /> {pdfBusy ? "Opening…" : "Download PDF"}
          </button>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">{m.manifestNo}</h2>
      <p className="text-sm text-gray-400 mb-4">Read-only from the staff side. Approval happens in the Site Approver Portal.</p>
      {pdfErr && <div className="mb-3 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{pdfErr}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-x-8 text-sm">
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Created</span><span className="text-gray-800">{fmtDate(m.createdAt)}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Created by</span><span className="text-gray-800">{m.createdBy?.name || "—"}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Site approver</span><span className="text-gray-800">{m.siteApproverId?.name || "—"}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Notes</span><span className="text-gray-800">{m.notes || "—"}</span></div>
          {m.signedBy?.name && <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Signed by</span><span className="text-gray-800">{m.signedBy.name} · {fmtDate(m.signedAt)}</span></div>}
        </div>
      </div>

      {m.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm">
          <p className="font-semibold text-red-700 mb-1">Rejected by {m.rejectedBy?.name || "approver"} · {fmtDate(m.rejectedAt)}</p>
          <p className="text-red-700 mb-2">Reason: {m.rejectionReason}</p>
          {(m.previouslyAttachedSkipIds || []).length > 0 && (
            <p className="text-red-600">Previously attached (now unlinked): {m.previouslyAttachedSkipIds.map((s) => s.skip_id || s).join(", ")}</p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Attached skips ({(m.attachedSkipIds || []).length})</h3>
        {(m.attachedSkipIds || []).length === 0 ? <p className="text-gray-400 text-sm">No skips attached.</p> : (
          <ul className="text-sm divide-y divide-gray-100">
            {m.attachedSkipIds.map((s) => (
              <li key={s._id || s} className="py-1.5 flex gap-3 flex-wrap">
                <span className="font-medium text-gray-800">{s.skip_id || s}</span>
                <span className="text-gray-500">{s.WasteStream}</span>
                {s.WasteSource && <span className="text-gray-400">· {s.WasteSource}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Manifests({ user }) {
  const [view, setView] = useState({ screen: "list", id: null });
  if (view.screen === "create") return <ManifestCreate onDone={() => setView({ screen: "list" })} onCancel={() => setView({ screen: "list" })} />;
  if (view.screen === "detail") return <ManifestDetail manifestId={view.id} onBack={() => setView({ screen: "list" })} />;
  return <ManifestList user={user} onOpen={(id) => setView({ screen: "detail", id })} onNew={() => setView({ screen: "create" })} />;
}
