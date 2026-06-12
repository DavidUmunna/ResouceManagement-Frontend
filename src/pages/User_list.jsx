import * as Sentry from "@sentry/react";
import { useEffect, useState, useCallback } from "react";
import { get_users, deleteUser, updateUser } from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";
import AddUserModal from "./AddUserModal";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { fetch_RBAC_ALL } from "../services/rbac_service";
import { isProd } from "../components/env";

const DEPARTMENTS = [
  { value: 'waste_management_dep', label: 'Waste Management' },
  { value: 'PVT',                  label: 'PVT' },
  { value: 'Environmental_lab_dep',label: 'Environmental Lab' },
  { value: 'accounts_dep',         label: 'Accounts' },
  { value: 'Human resources',      label: 'Human Resources' },
  { value: 'IT',                   label: 'Information Technology' },
  { value: 'Administration',       label: 'Administration' },
  { value: 'Business_Develoment',  label: 'Business Development' },
];

const DEPT_COLORS = {
  waste_management_dep:  'bg-green-100 text-green-800',
  PVT:                   'bg-blue-100 text-blue-800',
  Environmental_lab_dep: 'bg-teal-100 text-teal-800',
  accounts_dep:          'bg-yellow-100 text-yellow-800',
  'Human resources':     'bg-pink-100 text-pink-800',
  IT:                    'bg-indigo-100 text-indigo-800',
  Administration:        'bg-purple-100 text-purple-800',
  Business_Develoment:   'bg-orange-100 text-orange-800',
};

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  Busy:      'bg-yellow-100 text-yellow-700',
  'On Leave':'bg-red-100 text-red-700',
  'On-Leave':'bg-red-100 text-red-700',
  Remote:    'bg-blue-100 text-blue-700',
  'On-Site': 'bg-green-100 text-green-700',
};

const WORK_STATUSES = ['Available', 'Busy', 'On Leave', 'Remote', 'On-Site'];
const PAGE_SIZE     = 20;

const EMPTY_FILTERS = { search: '', department: '', role: '' };

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export default function UserList() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [applied, setApplied]         = useState(EMPTY_FILTERS);
  const [page, setPage]               = useState(1);
  const [meta, setMeta]               = useState({ total: 0, totalPages: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [ALLROLES, setAllRoles]       = useState([]);
  const [editForm, setEditForm]       = useState({
    name: '', Department: '', canApprove: false,
    role: '', password: '', WorkStatus: '', email: '',
  });
  const [openAddUser, setOpenAddUser]     = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const fetchUsers = useCallback(async (params) => {
    try {
      setLoading(true);
      const res = await get_users(params);
      setUsers(res.data || []);
      setMeta({ total: res.total || 0, totalPages: res.totalPages || 1 });
    } catch (error) {
      if (isProd) Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({ ...applied, page, limit: PAGE_SIZE });
  }, [applied, page, fetchUsers]);

  useEffect(() => {
    fetch_RBAC_ALL()
      .then(res => setAllRoles(res.data.data.ALL_ROLES))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(filters);
    setPage(1);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget._id);
    setDeleteTarget(null);
    fetchUsers({ ...applied, page, limit: PAGE_SIZE });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name:       user.name        || '',
      email:      user.email       || '',
      Department: user.Department  || '',
      role:       user.role        || '',
      WorkStatus: user.WorkStatus  || '',
      canApprove: user.canApprove  || false,
      password:   '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(editingUser._id, editForm);
      if (!updated) return;
      setUsers(prev => prev.map(u => u._id === editingUser._id ? updated.data : u));
      setShowEditModal(false);
    } catch (error) {
      if (isProd) Sentry.captureException(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isFiltered = Object.values(applied).some(Boolean);
  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading && users.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 mt-10 mb-11">

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleInputChange} className={fieldClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleInputChange} className={fieldClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="Department" value={editForm.Department} onChange={handleInputChange} className={fieldClass}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" value={editForm.role} onChange={handleInputChange} className={fieldClass} required>
                  <option value="">Select Role</option>
                  {ALLROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Status</label>
                <select name="WorkStatus" value={editForm.WorkStatus} onChange={handleInputChange} className={fieldClass}>
                  <option value="">Select Status</option>
                  {WORK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" name="canApprove" checked={editForm.canApprove}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Can Approve Requests</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <input type="password" name="password" value={editForm.password} onChange={handleInputChange} className={fieldClass} placeholder="New password" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove User</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-900">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium">Remove</button>
            </div>
          </motion.div>
        </div>
      )}

      {openAddUser && <AddUserModal onClose={() => setOpenAddUser(false)} />}

      {/* ── Main Panel ─────────────────────────────────────────────── */}
      <motion.div
        className="w-full max-w-6xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              {meta.total > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {isFiltered ? `${meta.total} found` : `${meta.total} total`}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpenAddUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Add User
            </button>
          </div>

          {/* Filters */}
          <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search name or email…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.department}
              onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select
              value={filters.role}
              onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {ALLROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Search
              </button>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No users found{isFiltered ? ' matching your filters.' : '.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            <AnimatePresence>
              {users.map(person => (
                <motion.li
                  key={person._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        alt={person.name}
                        src={person.imageurl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                        className="w-11 h-11 rounded-full border-2 border-white shadow flex-shrink-0 object-cover"
                      />
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{person.name}</p>
                          {person.canApprove && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Approver</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{person.email}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {person.Department && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[person.Department] || 'bg-gray-100 text-gray-700'}`}>
                              {DEPARTMENTS.find(d => d.value === person.Department)?.label || person.Department}
                            </span>
                          )}
                          {person.role && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                              {person.role}
                            </span>
                          )}
                          {person.WorkStatus && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[person.WorkStatus] || 'bg-gray-100 text-gray-600'}`}>
                              {person.WorkStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(person)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 transition font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(person)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {meta.totalPages} · {meta.total} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        page === item
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
