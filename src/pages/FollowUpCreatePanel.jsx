/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import { sendFollowup, followupError } from "../services/followupService";
import Button from "../components/Button";

const API = () => `${process.env.REACT_APP_API_URL}/api`;
const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");

/**
 * FR-1: instead of creating a duplicate request to chase one, the requester picks
 * an existing eligible (Pending) request of theirs and sends a follow-up.
 */
export default function FollowUpCreatePanel({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API()}/orders/StaffRequests`, { params: { userId: user?.userId }, withCredentials: true });
      const all = Array.isArray(res.data?.data) ? res.data.data : [];
      // Only own, still-eligible requests (Pending / partially-approved). Terminal
      // + "More Information" are excluded (FR-7); the backend re-checks anyway.
      setRequests(all.filter((o) => o.status === "Pending"));
    } catch (e) {
      setMsg({ type: "err", text: followupError(e, "Couldn't load your requests") });
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (o.Title || "").toLowerCase().includes(q) || (o.orderNumber || "").toLowerCase().includes(q);
  });

  const submit = async () => {
    if (!selectedId) { setMsg({ type: "err", text: "Select a request to follow up on." }); return; }
    setSubmitting(true); setMsg(null);
    try {
      await sendFollowup(selectedId, note.trim());
      setMsg({ type: "ok", text: "Follow-up sent — the current approver has been notified." });
      setNote(""); setSelectedId("");
      load(); // refresh (status/cooldown may have changed)
    } catch (e) {
      setMsg({ type: "err", text: followupError(e) }); // cooldown / eligibility / ownership messages
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Chasing a request that's taking a while? Follow up on it instead of creating a new one — it nudges the current approver without duplicating the request.
      </p>

      {msg && (
        <div className={`mb-4 flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.type === "ok" ? <FiCheckCircle /> : <FiAlertTriangle />} {msg.text}
        </div>
      )}

      <div className="relative mb-3">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your pending requests by title or number"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="border border-gray-200 rounded-lg max-h-64 overflow-auto mb-4">
        {loading ? (
          <div className="p-4 text-gray-400 text-sm">Loading your requests…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">You have no pending requests to follow up on.</div>
        ) : (
          filtered.map((o) => (
            <label key={o._id} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer ${selectedId === o._id ? "bg-blue-50" : "hover:bg-gray-50"}`}>
              <input type="radio" name="followup-request" checked={selectedId === o._id} onChange={() => setSelectedId(o._id)} />
              <div className="min-w-0">
                <div className="font-medium text-gray-800 truncate">{o.Title || o.orderNumber}</div>
                <div className="text-xs text-gray-400">{o.orderNumber} · {fmt(o.createdAt)} · <span className="text-yellow-700">{o.status}</span></div>
              </div>
            </label>
          ))
        )}
      </div>

      <label className="block text-gray-700 font-medium mb-1 text-sm">Note (optional)</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Still waiting on this — needed by Friday."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 mb-4" />

      <Button block size="lg" loading={submitting} disabled={!selectedId} onClick={submit}>
        {submitting ? "Sending…" : "Send follow-up"}
      </Button>
    </div>
  );
}
