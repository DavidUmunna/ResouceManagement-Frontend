/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiAlertTriangle, FiPlus, FiRefreshCw } from "react-icons/fi";
import {
  listWaybills, getWaybill, createWaybill, approveWaybill, rejectWaybill,
  listSkips, errMessage,
} from "./api";
import { can } from "./permissions";
import { Badge, fmtDate } from "./helpers";
import OtpApprovalModal from "./OtpApprovalModal";

const STATUS_COLOR = { draft: "gray", issued: "yellow", approved: "green", rejected: "red", completed: "blue" };
// issued (awaiting approval) surfaced first
const statusRank = (s) => (s === "issued" ? 0 : 1);

function WaybillList({ user, onOpen, onNew }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await listWaybills();
      const rows = (res.data || []).slice().sort((a, b) => statusRank(a.status) - statusRank(b.status));
      setItems(rows);
    } catch (e) { setError(errMessage(e, "Failed to load waybills")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        {can(user, "createWaybill") && (
          <button onClick={onNew} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"><FiPlus /> New Waybill</button>
        )}
      </div>
      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No waybills yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Waybill</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Destination</th>
              <th className="px-4 py-3 text-left font-medium">Skips</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w._id} onClick={() => onOpen(w._id)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-800">{w.waybillNo}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[w.status] || "gray"}>{w.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{w.destination || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{(w.attachedSkipIds || []).length}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(w.createdAt, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WaybillCreate({ onDone, onCancel }) {
  const [form, setForm] = useState({ waybillNo: "", destination: "", notes: "" });
  const [skips, setSkips] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only skips not yet mobilized can go on a waybill.
    listSkips({ stage: "unmobilized", active: "true", limit: 100 })
      .then((r) => setSkips(r.items || []))
      .catch((e) => setError(errMessage(e, "Failed to load selectable skips")))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    setBusy(true); setError("");
    try {
      await createWaybill({ waybillNo: form.waybillNo.trim(), destination: form.destination.trim(), notes: form.notes.trim(), skipIds: selected });
      onDone();
    } catch (e) { setError(errMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <button onClick={onCancel} className="text-blue-600 flex items-center gap-1 text-sm mb-4"><FiArrowLeft /> Back</button>
      <h2 className="text-lg font-bold text-gray-800 mb-4">New Waybill</h2>
      {error && <div className="mb-3 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <input placeholder="Waybill no. *" value={form.waybillNo} onChange={(e) => setForm({ ...form, waybillNo: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Select skips <span className="text-gray-400 font-normal">(only not-yet-mobilized skips are eligible)</span></p>
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

      <button disabled={busy || !form.waybillNo.trim()} onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg disabled:opacity-50">
        {busy ? "Creating…" : `Create waybill${selected.length ? ` (${selected.length} skips)` : ""}`}
      </button>
    </div>
  );
}

function WaybillDetail({ user, waybillId, onBack, onChanged }) {
  const [wb, setWb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // 'approve' | 'reject'
  const [banner, setBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await getWaybill(waybillId); setWb(r.data); }
    catch (e) { setError(errMessage(e, "Failed to load waybill")); }
    finally { setLoading(false); }
  }, [waybillId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading waybill…</div>;
  if (error) return <div className="p-4"><button onClick={onBack} className="text-blue-600 flex items-center gap-1 mb-3"><FiArrowLeft /> Back</button><div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div></div>;
  if (!wb) return null;

  const canApprove = wb.status === "issued" && can(user, "approveWaybill");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 flex items-center gap-1 text-sm"><FiArrowLeft /> Back to waybills</button>
        <Badge color={STATUS_COLOR[wb.status] || "gray"}>{wb.status}</Badge>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{wb.waybillNo}</h2>

      {banner && <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${banner.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{banner.text}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-x-8 text-sm">
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Destination</span><span className="text-gray-800">{wb.destination || "—"}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Created</span><span className="text-gray-800">{fmtDate(wb.createdAt)}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Created by</span><span className="text-gray-800">{wb.createdBy?.name || "—"}</span></div>
          <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Notes</span><span className="text-gray-800">{wb.notes || "—"}</span></div>
          {wb.approvedBy?.name && <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Approved by</span><span className="text-gray-800">{wb.approvedBy.name} · {fmtDate(wb.approvedAt)}</span></div>}
          {wb.status === "rejected" && <div className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">Rejected</span><span className="text-red-700">{wb.rejectionReason}</span></div>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Attached skips ({(wb.attachedSkipIds || []).length})</h3>
        {(wb.attachedSkipIds || []).length === 0 ? <p className="text-gray-400 text-sm">No skips attached.</p> : (
          <ul className="text-sm divide-y divide-gray-100">
            {wb.attachedSkipIds.map((s) => (
              <li key={s._id || s} className="py-1.5 flex gap-3"><span className="font-medium text-gray-800">{s.skip_id || s}</span><span className="text-gray-500">{s.WasteStream}</span></li>
            ))}
          </ul>
        )}
      </div>

      {canApprove && (
        <div className="flex gap-2">
          <button onClick={() => setModal("approve")} className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg">Approve</button>
          <button onClick={() => setModal("reject")} className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg">Reject</button>
        </div>
      )}
      {!canApprove && wb.status === "issued" && (
        <p className="text-sm text-gray-400">You don't have permission to approve waybills.</p>
      )}

      {modal === "approve" && (
        <OtpApprovalModal
          title={`Approve waybill ${wb.waybillNo}`} confirmLabel="Approve" entityId={wb._id}
          onClose={() => setModal(null)}
          onSubmit={async ({ otp }) => { await approveWaybill(wb._id, otp); setBanner({ type: "ok", text: "Waybill approved." }); await load(); onChanged && onChanged(); }}
        />
      )}
      {modal === "reject" && (
        <OtpApprovalModal
          title={`Reject waybill ${wb.waybillNo}`} confirmLabel="Reject" entityId={wb._id} requireReason
          onClose={() => setModal(null)}
          onSubmit={async ({ otp, reason }) => {
            const res = await rejectWaybill(wb._id, reason, otp);
            const n = res?.data?.previouslyAttachedSkipIds?.length ?? 0;
            setBanner({ type: "ok", text: `Waybill rejected. ${n} skip(s) were auto-unlinked.` });
            await load(); onChanged && onChanged();
          }}
        />
      )}
    </div>
  );
}

export default function Waybills({ user }) {
  const [view, setView] = useState({ screen: "list", id: null });
  if (view.screen === "create") return <WaybillCreate onDone={() => setView({ screen: "list" })} onCancel={() => setView({ screen: "list" })} />;
  if (view.screen === "detail") return <WaybillDetail user={user} waybillId={view.id} onBack={() => setView({ screen: "list" })} />;
  return <WaybillList user={user} onOpen={(id) => setView({ screen: "detail", id })} onNew={() => setView({ screen: "create" })} />;
}
