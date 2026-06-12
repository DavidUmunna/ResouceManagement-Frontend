// Single source of truth for route-level access control.
// Used by both ProtectedLayout (route guards) and Sidebar (nav visibility).
//
// Role NAME STRINGS must match exactly what the backend sends as user.role
// (fetched via /api/access → usercontext, and enumerated by rbac_service).
// If the backend renames a role, update it here too.

export const PAYMENT_ROLES = ['financial_manager','Accounts'];
export const PAYMENT_DEPTS = ['accounts_dep', 'Accounts'];

export const ROUTE_ROLES = {
  assetsmanagement:    ['procurement_officer', 'human_resources', 'global_admin', 'Accountant', 'Financial_manager'],
  supplierlist:        ['procurement_officer', 'global_admin', 'internal_auditor'],
  inventorymanagement: ['procurement_officer', 'admin', 'human_resources', 'global_admin', 'Environmental_lab_manager', 'lab_supervisor', 'QHSE Coordinator'],
  inventorylogs:       ['global_admin', 'admin', 'QHSE Coordinator', 'lab_supervisor', 'procurement_officer', 'Environmental_lab_manager'],
  tenders:             ['global_admin'],
  filetracking:        ['Contracts_manager', 'global_admin'],
  'ai-tools':          ['global_admin'],
  departmentassignment:['global_admin'],
  skipstracking:       ['global_admin', 'Waste Management Manager', 'Waste Management Supervisor', 'Logistics Manager'],
  monitoring:          ['global_admin'],
  'leave-admin':       ['admin', 'global_admin', 'human_resources'],
  'leave-summary':     ['Director', 'global_admin'],
  'po-analytics':      [ 'global_admin', 'procurement_officer', 'Financial_manager', 'Director', 'Accountant', 'internal_auditor'],
  // Routes with no entry are visible to every authenticated user
};
