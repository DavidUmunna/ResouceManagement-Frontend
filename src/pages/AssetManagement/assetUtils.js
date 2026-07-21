// Pure presentation helpers for the Asset Management dashboard.
// Kept in their own module so they can be unit-tested without loading the
// full component (charts, axios, etc.).

export const CONDITION_STYLES = {
  New:         'bg-green-100 text-green-800',
  Used:        'bg-blue-100 text-blue-800',
  Refurbished: 'bg-indigo-100 text-indigo-800',
  Damaged:     'bg-red-100 text-red-800',
  OK:          'bg-gray-100 text-gray-700',
};

export const formatCurrency = (n) => `₦${Number(n || 0).toLocaleString()}`;

export const formatDate = (d) => (d ? String(d).split('T')[0] : '—');
