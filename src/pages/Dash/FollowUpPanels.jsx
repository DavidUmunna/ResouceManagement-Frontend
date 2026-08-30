/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiBell, FiX } from "react-icons/fi";
import { useUser } from "../../components/usercontext";
import { getSentFollowups, getReceivedFollowups, getEscalatedReceived } from "../../services/followupService";
import { updateOrderStatus } from "../../services/OrderService";
import ReviewVerification from "../../components/ReviewVerification";
import Button from "../../components/Button";

const API = () => `${process.env.REACT_APP_API_URL}/api`;
const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
const label = (o) => o?.Title || o?.orderNumber || "a request";

// Same two-step call the requests list uses: general status + specific endpoint.
async function applyDecision(orderId, decision, adminName) {
  const status = decision === "approve" ? "Approved" : "Rejected";
  await updateOrderStatus(orderId, status);
  await axios.put(`${API()}/orders/${orderId}/${decision}`, { adminName, comment: "", orderId }, { withCredentials: true });
}

export default function FollowUpPanels() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [escalated, setEscalated] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("received");
  const [busyId, setBusyId] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);

  const load = useCallback(async () => {
    const [s, r, e] = await Promise.all([
      getSentFollowups().catch(() => []),
      getReceivedFollowups().catch(() => []),
      getEscalatedReceived().catch(() => []),
    ]);
    setSent(s); setReceived(r); setEscalated(e);
  }, []);
  useEffect(() => { load(); }, [load]);

  // One "awaiting your action" list, deduped by order: a request that was both
  // followed-up AND escalated appears once, carrying both signals.
  const attention = useMemo(() => {
    const byOrder = new Map();
    received.forEach((f) => {
      if (!f.order?._id) return;
      byOrder.set(String(f.order._id), { key: String(f.order._id), order: f.order, followup: f, escalated: false, escalatedAt: null });
    });
    escalated.forEach((e) => {
      if (!e.order?._id) return;
      const id = String(e.order._id);
      const existing = byOrder.get(id);
      if (existing) { existing.escalated = true; existing.escalatedAt = e.escalatedAt; }
      else byOrder.set(id, { key: id, order: e.order, followup: null, escalated: true, escalatedAt: e.escalatedAt });
    });
    return Array.from(byOrder.values());
  }, [received, escalated]);

  const goToRequest = (orderId) => navigate(`/admin/requestlist#order-${orderId}`);

  const decide = async (item, decision) => {
    setBusyId(item.key);
    try {
      await applyDecision(item.order._id, decision, user?.name);
      await load(); // resolved requests drop off the list
    } finally {
      setBusyId(null);
      setRejectFor(null);
    }
  };

  const openModal = () => { setTab(attention.length ? "received" : "sent"); setOpen(true); };

  if (!sent.length && !attention.length) return null; // nothing to show

  return (
    <>
      {/* Compact bar — stays in normal view, no scrolling */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-600 shrink-0"><FiBell /></span>
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 text-sm">Requests needing attention</div>
            <div className="text-xs text-gray-500 truncate">
              {attention.length > 0 && <span className="text-red-600 font-medium">{attention.length} awaiting your action</span>}
              {attention.length > 0 && sent.length > 0 && <span> · </span>}
              {sent.length > 0 && <span>{sent.length} sent</span>}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={openModal}>View</Button>
      </div>

      {/* Modal — all follow-ups */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Requests needing attention</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-3">
              {[["received", `Awaiting you (${attention.length})`], ["sent", `Sent (${sent.length})`]].map(([key, lbl]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {lbl}
                </button>
              ))}
            </div>

            <div className="px-5 py-4 overflow-y-auto">
              {tab === "received" && (
                attention.length === 0 ? <p className="text-center text-gray-400 py-8">Nothing awaiting your action.</p> : (
                  <ul className="space-y-2">
                    {attention.map((item) => (
                      <li key={item.key} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-gray-800 truncate">{label(item.order)}</span>
                            {item.escalated && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">Escalated</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{item.order?.orderNumber}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.followup
                            ? <>{item.followup.requestedByName || "Requester"} followed up{item.followup.note ? `: “${item.followup.note}”` : ""} <span className="text-gray-400">· {fmt(item.followup.createdAt)}</span></>
                            : <>Escalated by the requester <span className="text-gray-400">· {fmt(item.escalatedAt)}</span></>}
                        </p>
                        {user?.canApprove && (
                          <div className="flex gap-2 mt-2 items-center">
                            <Button size="sm" variant="success" loading={busyId === item.key} onClick={() => decide(item, "approve")}>Approve</Button>
                            <Button size="sm" variant="danger" disabled={busyId === item.key} onClick={() => setRejectFor(item)}>Reject</Button>
                            <Button size="sm" variant="link" onClick={() => { setOpen(false); goToRequest(item.order._id); }}>Open request →</Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              )}

              {tab === "sent" && (
                sent.length === 0 ? <p className="text-center text-gray-400 py-8">You haven't sent any follow-ups.</p> : (
                  <ul className="space-y-2">
                    {sent.map((f) => (
                      <li key={f._id} className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50" onClick={() => { setOpen(false); f.order && goToRequest(f.order._id); }}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{label(f.order)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${f.order?.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>{f.order?.status || "—"}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{f.note ? `“${f.note}”` : "Followed up"} <span className="text-gray-400">· {fmt(f.createdAt)}</span></p>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {rejectFor && (
        <ReviewVerification
          onClose={() => setRejectFor(null)}
          statusOption="Rejected"
          order={rejectFor.order}
          orderId={rejectFor.order._id}
          onSubmit={() => decide(rejectFor, "reject")}
        />
      )}
    </>
  );
}
