/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { sendApprovalOtp, errMessage } from "./api";

/**
 * OTP-gated confirmation modal (internal 2FA), styled to match the ERP's
 * ReviewVerification modal. On open it emails a code via the existing
 * /api/otp/:id/send-otp endpoint; the user enters it and confirms.
 *
 * Props:
 *   title       – heading (e.g. "Approve waybill WB-12")
 *   confirmLabel– button text ("Approve" / "Reject")
 *   entityId    – id used for the send-otp route param
 *   requireReason – if true, shows a required reason textarea (min 10 chars)
 *   onClose()
 *   onSubmit({ otp, reason }) – should throw on failure so the modal shows it
 */
export default function OtpApprovalModal({ title, confirmLabel = "Confirm", entityId, requireReason, onClose, onSubmit }) {
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const send = useCallback(async () => {
    setError(""); setInfo("");
    try {
      await sendApprovalOtp(entityId);
      setInfo("A 6-digit code was sent to your email.");
      setCooldown(45);
    } catch (e) {
      setError(errMessage(e, "Couldn't send the code. Try again."));
    }
  }, [entityId]);

  // Send a code as soon as the modal opens.
  useEffect(() => { send(); }, [send]);

  // Resend cooldown countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async () => {
    setError("");
    if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit code."); return; }
    if (requireReason && reason.trim().length < 10) { setError("Reason must be at least 10 characters."); return; }
    setLoading(true);
    try {
      await onSubmit({ otp, reason: reason.trim() });
      onClose();
    } catch (e) {
      setError(errMessage(e, "Verification failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
        <p className="text-gray-500 text-sm mb-4">Confirm with the code sent to your email.</p>

        {requireReason && (
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Reason (required)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <label className="block text-xs text-gray-500 mb-1">6-digit code</label>
        <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" placeholder="••••••"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm tracking-widest text-center focus:ring-2 focus:ring-blue-500" />

        <div className="flex items-center justify-between mt-2 text-xs">
          {info && <span className="text-green-600">{info}</span>}
          <button onClick={send} disabled={cooldown > 0} className="text-blue-600 disabled:text-gray-400 ml-auto">
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Verifying…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
