/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { FiAlertTriangle, FiPlus, FiRefreshCw } from "react-icons/fi";
import {
  listTrucks, createTruck, updateTruck, assignDriverToTruck,
  listDrivers, createDriver, updateDriver, errMessage,
} from "./api";
import { can } from "./permissions";
import { Badge } from "./helpers";

function ActionBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className={`mb-3 text-sm px-4 py-2 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      {msg.text}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => <div key={i} className="h-11 bg-gray-100 rounded animate-pulse" />)}
    </div>
  );
}

// ── Trucks ────────────────────────────────────────────────────────────────────
function TruckPanel({ user }) {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ regNo: "", type: "delivery", rfidTag: "" });
  const [assignSel, setAssignSel] = useState({}); // truckId -> driverId

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [t, d] = await Promise.all([listTrucks(), listDrivers({ active: true })]);
      setTrucks(t.data || []);
      setDrivers(d.data || []);
    } catch (e) { setError(errMessage(e, "Failed to load trucks")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ type: "ok", text: ok }); await load(); }
    catch (e) { setMsg({ type: "err", text: errMessage(e) }); }
    finally { setBusy(false); }
  };

  const submitCreate = () =>
    run(async () => {
      await createTruck({ regNo: form.regNo.trim(), type: form.type, rfidTag: form.rfidTag.trim() || undefined });
      setForm({ regNo: "", type: "delivery", rfidTag: "" });
      setShowCreate(false);
    }, "Truck created");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        {can(user, "createTruck") && (
          <button onClick={() => setShowCreate((s) => !s)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1">
            <FiPlus /> New Truck
          </button>
        )}
      </div>

      <ActionBanner msg={msg} />

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-2 items-end">
          <div><label className="block text-xs text-gray-500 mb-1">Reg no.</label>
            <input value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="delivery">delivery</option><option value="waste">waste</option>
            </select></div>
          <div><label className="block text-xs text-gray-500 mb-1">RFID tag (optional)</label>
            <input value={form.rfidTag} onChange={(e) => setForm({ ...form, rfidTag: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" /></div>
          <button disabled={busy || !form.regNo.trim()} onClick={submitCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">Create</button>
        </div>
      )}

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      {loading ? <Skeleton /> : trucks.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No trucks yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Reg no.</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Current driver</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              {can(user, "assignDriver") && <th className="px-4 py-3 text-left font-medium">Assign driver</th>}
            </tr></thead>
            <tbody>
              {trucks.map((t) => (
                <tr key={t._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{t.regNo}</td>
                  <td className="px-4 py-3"><Badge color={t.type === "delivery" ? "blue" : "purple"}>{t.type}</Badge></td>
                  <td className="px-4 py-3">
                    {t.currentDriverId?.name || <Badge color="red">No driver assigned</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={busy || !can(user, "createTruck")}
                      onClick={() => run(() => updateTruck(t._id, { active: !(t.active !== false) }), "Truck updated")}
                      className="focus:outline-none"
                      title="Toggle active"
                    >
                      <Badge color={t.active === false ? "gray" : "green"}>{t.active === false ? "inactive" : "active"}</Badge>
                    </button>
                  </td>
                  {can(user, "assignDriver") && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <select value={assignSel[t._id] || ""} onChange={(e) => setAssignSel({ ...assignSel, [t._id]: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option value="">Select driver…</option>
                          {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <button disabled={busy || !assignSel[t._id]} onClick={() => run(() => assignDriverToTruck(t._id, assignSel[t._id]), "Driver assigned")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Assign</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Drivers ───────────────────────────────────────────────────────────────────
function DriverPanel({ user }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", rfidTag: "", licenseNo: "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await listDrivers(); setDrivers(d.data || []); }
    catch (e) { setError(errMessage(e, "Failed to load drivers")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ type: "ok", text: ok }); await load(); }
    catch (e) { setMsg({ type: "err", text: errMessage(e) }); }
    finally { setBusy(false); }
  };

  const submitCreate = () =>
    run(async () => {
      await createDriver({
        name: form.name.trim(),
        rfidTag: form.rfidTag.trim() || undefined,
        licenseNo: form.licenseNo.trim() || undefined,
      });
      setForm({ name: "", rfidTag: "", licenseNo: "" });
      setShowCreate(false);
    }, "Driver created");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700" title="Refresh"><FiRefreshCw /></button>
        {can(user, "createDriver") && (
          <button onClick={() => setShowCreate((s) => !s)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1">
            <FiPlus /> New Driver
          </button>
        )}
      </div>

      <ActionBanner msg={msg} />

      {showCreate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-2 items-end">
          {["name", "rfidTag", "licenseNo"].map((f) => (
            <div key={f}>
              <label className="block text-xs text-gray-500 mb-1">{f === "name" ? "Name *" : f}</label>
              <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          ))}
          <button disabled={busy || !form.name.trim()} onClick={submitCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">Create</button>
        </div>
      )}

      {error && <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg"><FiAlertTriangle /> {error} <button onClick={load} className="underline ml-auto">Retry</button></div>}

      {loading ? <Skeleton /> : drivers.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No drivers yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600"><tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">RFID tag</th>
              <th className="px-4 py-3 text-left font-medium">License</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr></thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.rfidTag || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.licenseNo || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      disabled={busy || !can(user, "createDriver")}
                      onClick={() => run(() => updateDriver(d._id, { active: !(d.active !== false) }), "Driver updated")}
                      className="focus:outline-none" title="Toggle active"
                    >
                      <Badge color={d.active === false ? "gray" : "green"}>{d.active === false ? "inactive" : "active"}</Badge>
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

export default function TrucksDrivers({ user }) {
  const [sub, setSub] = useState("trucks");
  return (
    <div>
      <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-5">
        {["trucks", "drivers"].map((s) => (
          <button key={s} onClick={() => setSub(s)} className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize ${sub === s ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>{s}</button>
        ))}
      </div>
      {sub === "trucks" ? <TruckPanel user={user} /> : <DriverPanel user={user} />}
    </div>
  );
}
