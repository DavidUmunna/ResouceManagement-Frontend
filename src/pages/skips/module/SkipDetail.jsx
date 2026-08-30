/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import {
  getSkip, listComplianceLogs, listTrucks, listProjects, listSuppliers,
  registerTag, assignDeliveryTruck, assignCollectionTruck, returnSkip, setRental, setSkipProject, errMessage,
} from "./api";
import { can } from "./permissions";
import { getSkipStage, stageColor, rentalExpiry, Badge, fmtDate, truckLabel } from "./helpers";
import ManualScanModal from "./ManualScanModal";

function Section({ title, children, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
const Row = ({ label, children }) => (
  <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 text-right">{children}</span>
  </div>
);

export default function SkipDetail({ skipId, user, onBack }) {
  const [skip, setSkip] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState(null); // { type: 'ok'|'err', text }
  const [busy, setBusy] = useState(false);

  // inline action state
  const [tagInput, setTagInput] = useState("");
  const [trucks, setTrucks] = useState([]);
  const [deliverySel, setDeliverySel] = useState("");
  const [collectionSel, setCollectionSel] = useState("");
  const [showManualScan, setShowManualScan] = useState(false);
  const [rentalForm, setRentalForm] = useState(null); // null = closed
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [projectSel, setProjectSel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, l] = await Promise.all([
        getSkip(skipId),
        listComplianceLogs({ entityId: skipId, limit: 50 }),
      ]);
      setSkip(s.data);
      setLogs(l.data || l.items || []);
    } catch (e) {
      setError(errMessage(e, "Failed to load skip"));
    } finally {
      setLoading(false);
    }
  }, [skipId]);

  useEffect(() => { load(); }, [load]);

  // Trucks for assignment dropdowns (only when the user can assign).
  useEffect(() => {
    if (!can(user, "assignSkipTruck")) return;
    listTrucks({ active: true }).then((r) => setTrucks(r.data || [])).catch(() => {});
  }, [user]);

  // Projects + vendors for the assign-project and rental controls.
  useEffect(() => {
    listProjects({ active: "true" }).then((r) => setProjects(r.data || [])).catch(() => {});
    listSuppliers().then((s) => setSuppliers((s || []).filter((v) => v.status !== "inactive"))).catch(() => {});
  }, []);

  const runAction = async (fn, successText) => {
    setBusy(true);
    setActionMsg(null);
    try {
      await fn();
      setActionMsg({ type: "ok", text: successText });
      setTagInput("");
      setDeliverySel("");
      setCollectionSel("");
      setProjectSel("");
      await load();
    } catch (e) {
      setActionMsg({ type: "err", text: errMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading skip…</div>;
  if (error) return (
    <div className="p-6">
      <button onClick={onBack} className="text-blue-600 flex items-center gap-1 mb-4"><FiArrowLeft /> Back</button>
      <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
        <FiAlertTriangle /> {error} <button onClick={load} className="underline ml-2">Retry</button>
      </div>
    </div>
  );
  if (!skip) return null;

  const stage = getSkipStage(skip);
  const rent = rentalExpiry(skip);
  const mobilized = !!skip.DateMobilized;
  const demobilized = !!skip.DemobilizationOfFilledSkips;
  const deliveryTrucks = trucks.filter((t) => t.type === "delivery" && t.currentDriverId);
  const collectionTrucks = trucks.filter((t) => t.type === "waste" && t.currentDriverId);
  const returnEligible = skip.ownership === "rented" && skip.active !== false && !(mobilized && !demobilized);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 flex items-center gap-1 text-sm"><FiArrowLeft /> Back to skips</button>
        <div className="flex items-center gap-2">
          {can(user, "manualScan") && skip.active !== false && (
            <button onClick={() => setShowManualScan(true)} className="text-sm border border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-3 py-1 rounded-lg">Manual scan</button>
          )}
          <Badge color={stageColor(stage)}>{stage}</Badge>
          <Badge color={skip.active === false ? "gray" : "green"}>{skip.active === false ? "inactive" : "active"}</Badge>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">{skip.skip_id}</h2>

      {actionMsg && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${actionMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {actionMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {/* Identity */}
          <Section title="Identity">
            <Row label="Waste stream">{skip.WasteStream}</Row>
            <Row label="Quantity">{skip.Quantity?.value ? `${skip.Quantity.value} ${skip.Quantity.unit || ""}` : "—"}</Row>
            <Row label="Waste source">{skip.WasteSource || "—"}</Row>
            <Row label="Project">
              {skip.projectId ? <Badge color="blue">{skip.projectId.code || skip.projectId.name}</Badge> : <span className="text-gray-400">Unassigned</span>}
            </Row>
            {can(user, "assignProject") && (
              <div className="flex gap-2 py-1.5">
                <select value={projectSel} onChange={(e) => setProjectSel(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm">
                  <option value="">{skip.projectId ? "Reassign / clear project…" : "Assign a project…"}</option>
                  {skip.projectId && <option value="__clear__">— Clear project —</option>}
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.code ? `${p.code} — ${p.name}` : p.name}</option>)}
                </select>
                <button disabled={busy || !projectSel} onClick={() => runAction(() => setSkipProject(skip._id, projectSel === "__clear__" ? null : projectSel), "Project updated")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded disabled:opacity-50">Set</button>
              </div>
            )}
            <Row label="Ownership">
              <Badge color={skip.ownership === "rented" ? "yellow" : "gray"}>{skip.ownership || "owned"}</Badge>
              {rent.expiring && <Badge color="red" className="ml-1">{rent.overdue ? "overdue" : "expiring"}</Badge>}
            </Row>
            {skip.ownership === "rented" && (
              <>
                <Row label="Rented from">{skip.rentedFromCompany || "—"}</Row>
                <Row label="Rental window">{fmtDate(skip.rentalStart, false)} → {fmtDate(skip.rentalExpectedEnd, false)}</Row>
              </>
            )}
            {can(user, "manageRentedSkip") && (
              <button
                onClick={() => setRentalForm(rentalForm ? null : {
                  ownership: skip.ownership || "owned",
                  rentedFromCompany: skip.rentedFromCompany || "",
                  projectRef: skip.projectRef || "",
                  rentalExpectedEnd: skip.rentalExpectedEnd ? new Date(skip.rentalExpectedEnd).toISOString().slice(0, 10) : "",
                })}
                className="mt-3 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2 rounded-lg"
              >
                {rentalForm ? "Cancel rental edit" : "Edit rental"}
              </button>
            )}
            {rentalForm && (
              <div className="mt-3 space-y-2 border-l-2 border-yellow-300 pl-3">
                <select value={rentalForm.ownership} onChange={(e) => setRentalForm({ ...rentalForm, ownership: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                  <option value="owned">Owned</option><option value="rented">Rented</option>
                </select>
                {rentalForm.ownership === "rented" && (
                  <>
                    <select value={rentalForm.rentedFromCompany} onChange={(e) => setRentalForm({ ...rentalForm, rentedFromCompany: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                      <option value="">Rented from (vendor)…</option>
                      {suppliers.map((v) => <option key={v._id} value={v.name}>{v.name}</option>)}
                    </select>
                    <input type="date" value={rentalForm.rentalExpectedEnd} onChange={(e) => setRentalForm({ ...rentalForm, rentalExpectedEnd: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </>
                )}
                <button disabled={busy} onClick={() => runAction(async () => { await setRental(skip._id, rentalForm); setRentalForm(null); }, "Rental updated")} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded disabled:opacity-50">Save rental</button>
              </div>
            )}
            {returnEligible && can(user, "manageRentedSkip") && (
              <button
                disabled={busy}
                onClick={() => runAction(() => returnSkip(skip._id), "Skip returned")}
                className="mt-2 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2 rounded-lg disabled:opacity-50"
              >
                Return skip
              </button>
            )}
          </Section>

          {/* Tag */}
          <Section title="RFID tag">
            {skip.rfidTag ? (
              <Row label="Tag">{skip.rfidTag}</Row>
            ) : can(user, "registerTag") ? (
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="RFID tag" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <button
                  disabled={busy || !tagInput.trim()}
                  onClick={() => runAction(() => registerTag(skip._id, tagInput.trim()), "Tag registered")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                >Register</button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Not tagged</p>
            )}
          </Section>
        </div>

        <div>
          {/* Delivery leg */}
          <Section title="Delivery leg (mobilization)">
            <Row label="Truck / driver">{truckLabel(skip.assignedDeliveryTruckId)}</Row>
            <Row label="Mobilized">{fmtDate(skip.DateMobilized)}</Row>
            <Row label="Scan method">{skip.mobilizeScanMethod ? <Badge color={skip.mobilizeScanMethod === "manual" ? "yellow" : "blue"}>{skip.mobilizeScanMethod}</Badge> : "—"}</Row>
            {skip.waybillId && <Row label="Waybill">{skip.waybillId.waybillNo || "linked"}</Row>}
            {!mobilized && can(user, "assignSkipTruck") && (
              <div className="flex gap-2 mt-3">
                <select value={deliverySel} onChange={(e) => setDeliverySel(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Assign delivery truck…</option>
                  {deliveryTrucks.map((t) => <option key={t._id} value={t._id}>{truckLabel(t)}</option>)}
                </select>
                <button disabled={busy || !deliverySel} onClick={() => runAction(() => assignDeliveryTruck(skip._id, deliverySel), "Delivery truck assigned")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">Assign</button>
              </div>
            )}
          </Section>

          {/* Collection leg */}
          <Section title="Collection leg (demobilization)">
            <Row label="Truck / driver">{truckLabel(skip.assignedCollectionTruckId)}</Row>
            <Row label="Demobilized">{fmtDate(skip.DemobilizationOfFilledSkips)}</Row>
            <Row label="Scan method">{skip.demobilizeScanMethod ? <Badge color={skip.demobilizeScanMethod === "manual" ? "yellow" : "blue"}>{skip.demobilizeScanMethod}</Badge> : "—"}</Row>
            {skip.manifestId && <Row label="Manifest">{skip.manifestId.manifestNo || "linked"}</Row>}
            {!demobilized && can(user, "assignSkipTruck") && (
              <div className="flex gap-2 mt-3">
                <select value={collectionSel} onChange={(e) => setCollectionSel(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Assign collection truck…</option>
                  {collectionTrucks.map((t) => <option key={t._id} value={t._id}>{truckLabel(t)}</option>)}
                </select>
                <button disabled={busy || !collectionSel} onClick={() => runAction(() => assignCollectionTruck(skip._id, collectionSel), "Collection truck assigned")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">Assign</button>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Timeline */}
      <Section title="Activity timeline">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No recorded activity yet.</p>
        ) : (
          <ol className="relative border-l border-gray-200 ml-2">
            {logs.map((log) => (
              <li key={log._id} className="mb-4 ml-4">
                <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-1 mt-1.5" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="blue">{log.action}</Badge>
                  <span className="text-xs text-gray-400">{fmtDate(log.createdAt || log.performedAt)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{log.description || log.entityName}</p>
                {log.metadata?.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {log.metadata.reason}</p>}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {showManualScan && (
        <ManualScanModal
          skip={skip}
          onClose={() => setShowManualScan(false)}
          onDone={() => { setShowManualScan(false); setActionMsg({ type: "ok", text: "Manual scan recorded (logged as an exception)." }); load(); }}
        />
      )}
    </div>
  );
}
