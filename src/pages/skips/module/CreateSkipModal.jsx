import React, { useState, useEffect } from "react";
import { createSkip, listProjects, listSuppliers, errMessage } from "./api";

const WASTE_STREAMS = ["WBM_Affluent", "OBM_Cutting", "WBM_cutting", "OBM_Affluent", "Sludge", "Others"];

/**
 * Create a skip — including the rented-skip onboarding path. A rented skip
 * behaves identically everywhere else once created; here it just captures the
 * rental window up front. Props: onClose(), onDone()
 */
export default function CreateSkipModal({ onClose, onDone }) {
  const [f, setF] = useState({
    skip_id: "", WasteStream: "WBM_Affluent", WasteSource: "", qtyValue: "", qtyUnit: "",
    projectId: "", rented: false, rentedFromCompany: "", rentalStart: "", rentalExpectedEnd: "",
  });
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    listProjects({ active: "true" }).then((r) => setProjects(r.data || [])).catch(() => {});
    listSuppliers().then((s) => setSuppliers((s || []).filter((v) => v.status !== "inactive"))).catch(() => {});
  }, []);

  const submit = async () => {
    setError("");
    if (!f.skip_id.trim()) { setError("Skip ID is required."); return; }
    if (!f.WasteSource.trim()) { setError("Waste source is required."); return; }
    if (f.rented && !f.rentalExpectedEnd) { setError("Rental end date is required for a rented skip."); return; }
    setLoading(true);
    try {
      await createSkip({
        skip_id: f.skip_id.trim(),
        WasteStream: f.WasteStream,
        WasteSource: f.WasteSource.trim(),
        Quantity: { value: Number(f.qtyValue) || 0, unit: f.qtyUnit.trim() },
        projectId: f.projectId || undefined,
        ownership: f.rented ? "rented" : "owned",
        rentedFromCompany: f.rented ? f.rentedFromCompany.trim() : undefined,
        rentalStart: f.rented ? f.rentalStart || undefined : undefined,
        rentalExpectedEnd: f.rented ? f.rentalExpectedEnd || undefined : undefined,
      });
      onDone();
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">New Skip</h2>
        {error && <div className="mb-3 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}

        <div className="space-y-3">
          <div><label className="block text-xs text-gray-500 mb-1">Skip ID *</label><input value={f.skip_id} onChange={(e) => set("skip_id", e.target.value)} className={input} /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Waste stream</label>
            <select value={f.WasteStream} onChange={(e) => set("WasteStream", e.target.value)} className={input}>
              {WASTE_STREAMS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Waste source *</label><input value={f.WasteSource} onChange={(e) => set("WasteSource", e.target.value)} className={input} /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Project</label>
            <select value={f.projectId} onChange={(e) => set("projectId", e.target.value)} className={input}>
              <option value="">Unassigned</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.code ? `${p.code} — ${p.name}` : p.name}</option>)}
            </select></div>
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Quantity</label><input value={f.qtyValue} onChange={(e) => set("qtyValue", e.target.value)} type="number" className={input} /></div>
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Unit</label><input value={f.qtyUnit} onChange={(e) => set("qtyUnit", e.target.value)} className={input} /></div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 pt-2">
            <input type="checkbox" checked={f.rented} onChange={(e) => set("rented", e.target.checked)} />
            This is a rented skip
          </label>

          {f.rented && (
            <div className="space-y-3 border-l-2 border-yellow-300 pl-3">
              <div><label className="block text-xs text-gray-500 mb-1">Rented from (vendor)</label>
                <select value={f.rentedFromCompany} onChange={(e) => set("rentedFromCompany", e.target.value)} className={input}>
                  <option value="">Select vendor…</option>
                  {suppliers.map((v) => <option key={v._id} value={v.name}>{v.name}</option>)}
                </select>
                {suppliers.length === 0 && <p className="text-xs text-gray-400 mt-1">No vendors found — add them in Suppliers.</p>}
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Rental start</label><input value={f.rentalStart} onChange={(e) => set("rentalStart", e.target.value)} type="date" className={input} /></div>
                <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Rental end *</label><input value={f.rentalExpectedEnd} onChange={(e) => set("rentalExpectedEnd", e.target.value)} type="date" className={input} /></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Creating…" : "Create skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
