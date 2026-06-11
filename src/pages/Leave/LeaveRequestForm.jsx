import React, { useState } from 'react';

const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency', 'Unpaid'];

const today = () => new Date().toISOString().split('T')[0];

export default function LeaveRequestForm({ onSubmit, loading, serverError }) {
  const [form, setForm] = useState({
    leaveType: 'Annual',
    startDate: today(),
    endDate: today(),
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.endDate < form.startDate) e.endDate = 'End date must be on or after start date';
    if (!form.reason.trim() || form.reason.trim().length < 5)
      e.reason = 'Please provide a reason (at least 5 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await onSubmit(form);
    if (success) {
      setForm({ leaveType: 'Annual', startDate: today(), endDate: today(), reason: '' });
    }
  };

  const field = (label, name, type = 'text', extra = {}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={loading}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${
          errors[name] ? 'border-red-400' : 'border-gray-300'
        }`}
        {...extra}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">New Leave Request</h2>

      <div>
        <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
        <select
          id="leaveType"
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        >
          {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field('Start Date', 'startDate', 'date', { min: today() })}
        {field('End Date', 'endDate', 'date', { min: form.startDate })}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          value={form.reason}
          onChange={handleChange}
          disabled={loading}
          placeholder="Brief explanation for your leave request…"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none ${
            errors.reason ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
      </div>

      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700">{serverError.message}</p>
          {serverError.detail?.reason && (
            <p className="text-sm text-red-600">{serverError.detail.reason}</p>
          )}
          {serverError.detail?.remaining !== undefined && (
            <p className="text-xs text-red-500">
              Remaining balance: <span className="font-semibold">{serverError.detail.remaining} day(s)</span>
            </p>
          )}
          {serverError.detail?.policy && (
            <p className="text-xs text-red-500">
              Policy limit:{' '}
              <span className="font-semibold">
                {Object.entries(serverError.detail.policy)
                  .map(([type, days]) => `${type} — ${days} days`)
                  .join(', ')}
              </span>
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </span>
        ) : 'Submit Request'}
      </button>
    </form>
  );
}
