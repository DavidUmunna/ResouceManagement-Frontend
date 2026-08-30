import React, { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { manualScan, errMessage } from "./api";

/**
 * Manual (fallback) scan — supervisor+ only. This is the exception path when the
 * RFID gate fails, so it's visually framed as an override and requires a reason.
 *
 * Props: skip { _id, skip_id }, onClose(), onDone()
 */
export default function ManualScanModal({ skip, onClose, onDone }) {
  const [scanType, setScanType] = useState("mobilize");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (reason.trim().length < 3) { setError("A reason is required."); return; }
    setLoading(true);
    try {
      await manualScan(skip._id, scanType, reason.trim());
      onDone();
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <FiAlertTriangle className="text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800">Manual scan</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Override for skip <strong>{skip.skip_id}</strong> when the RFID gate fails. This is logged as a manual exception.
        </p>

        <label className="block text-xs text-gray-500 mb-1">Scan type</label>
        <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-3">
          {["mobilize", "demobilize"].map((t) => (
            <button key={t} onClick={() => setScanType(t)} className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize ${scanType === t ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>{t}</button>
          ))}
        </div>

        <label className="block text-xs text-gray-500 mb-1">Reason (required)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">
            {loading ? "Recording…" : "Record manual scan"}
          </button>
        </div>
      </div>
    </div>
  );
}
