import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getUserBalance, updateEntitlement, getPolicy, updatePolicy } from '../../../services/leaveService';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];

const DEFAULT_VALUES = { Annual: 21, Sick: 10, Maternity: 90, Paternity: 5, Emergency: 3, Unpaid: 0 };

// ── Bulk defaults panel ───────────────────────────────────────────────────────
function BulkDefaults() {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Seed inputs from the live policy on mount
  useEffect(() => {
    getPolicy()
      .then((res) => {
        const p = res.data;
        if (p) {
          const next = {};
          LEAVE_TYPES.forEach((t) => { if (p[t] !== undefined) next[t] = p[t]; });
          setValues((prev) => ({ ...prev, ...next }));
        }
      })
      .catch(() => toast.error('Failed to load current policy'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePolicy(values);
      toast.success('Leave policy saved — new employees will inherit these values');
    } catch {
      toast.error('Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-blue-900">Organisation Leave Policy</h3>
        <p className="text-xs text-blue-700 mt-0.5">
          These are the default entitlements applied to every new employee's leave balance.
          Changes take effect for any balance created after saving.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEAVE_TYPES.map((t) => (
            <div key={t} className="h-14 rounded-lg bg-blue-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEAVE_TYPES.map((type) => (
            <div key={type}>
              <label className="block text-xs font-medium text-blue-800 mb-1">{type}</label>
              <input
                type="number"
                min={0}
                value={values[type]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [type]: Number(e.target.value) }))
                }
                className="w-full px-2 py-1.5 border border-blue-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label={`${type} entitlement`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Policy'}
        </button>
        <button
          onClick={() => setValues({ ...DEFAULT_VALUES })}
          disabled={saving || loading}
          className="text-xs text-blue-600 hover:underline disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

// ── Per-user panel ────────────────────────────────────────────────────────────
function UserEditor({ users }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [draft, setDraft] = useState({}); // { Annual: 21, ... }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedUserId) { setBalance(null); setDraft({}); return; }
    setLoadingBalance(true);
    getUserBalance(selectedUserId)
      .then((res) => {
        setBalance(res.data);
        const summary = res.data?.summary || {};
        const init = {};
        LEAVE_TYPES.forEach((t) => { init[t] = summary[t]?.entitlement ?? 0; });
        setDraft(init);
      })
      .catch(() => toast.error('Failed to load balance'))
      .finally(() => setLoadingBalance(false));
  }, [selectedUserId]);

  const handleSaveAll = async () => {
    setSaving(true);
    let failed = 0;
    for (const type of LEAVE_TYPES) {
      const val = parseInt(draft[type], 10);
      if (isNaN(val) || val < 0) { failed += 1; continue; }
      try {
        await updateEntitlement(selectedUserId, type, val);
      } catch {
        failed += 1;
      }
    }
    setSaving(false);
    if (failed === 0) {
      toast.success('All entitlements saved');
      // Refresh displayed balance
      const res = await getUserBalance(selectedUserId);
      setBalance(res.data);
    } else {
      toast.error(`${failed} type(s) failed to save`);
    }
  };

  const summary = balance?.summary || {};

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Edit Individual Employee</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Select Employee</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select employee"
        >
          <option value="">— choose employee —</option>
          {users?.data?.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.username} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {loadingBalance && (
        <div className="space-y-2">
          {LEAVE_TYPES.map((t) => (
            <div key={t} className="h-10 rounded bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loadingBalance && balance && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  {['Leave Type', 'Entitlement (days)', 'Taken', 'Balance'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {LEAVE_TYPES.map((type) => {
                  const d = summary[type] || { taken: 0, balance: 0 };
                  return (
                    <tr key={type} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{type}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={draft[type] ?? ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, [type]: e.target.value }))
                          }
                          aria-label={`${type} entitlement`}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{d.taken}</td>
                      <td className="px-4 py-3 text-gray-600">{d.balance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                const reset = {};
                LEAVE_TYPES.forEach((t) => { reset[t] = summary[t]?.entitlement ?? 0; });
                setDraft(reset);
              }}
              className="text-xs text-gray-500 hover:underline"
            >
              Revert
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save All Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function EntitlementEditor({ users }) {
  return (
    <div className="space-y-6">
      <BulkDefaults />
      <UserEditor users={users} />
    </div>
  );
}
