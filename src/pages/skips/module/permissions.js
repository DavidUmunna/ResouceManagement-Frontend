// Frontend role gating for the Skip Tracking module.
//
// These lists MIRROR the backend role gates (constants/skips.constants.js and the
// route guards). They are a UX convenience only — the backend is the real security
// boundary. "dispatcher" in the spec maps to the Waste-Management staff roles that
// actually exist in this ERP (product decision).

export const ADMIN_ROLES = ["admin", "global_admin"];

// Manual scan + tag registration + waybill approval (backend FR-10 / FR-17d).
export const SUPERVISOR_ROLES = [...ADMIN_ROLES, "Waste Management Supervisor"];

// "dispatcher" actions: assign truck/driver, create waybill, create manifest.
export const DISPATCH_ROLES = [...SUPERVISOR_ROLES, "Waste Management Manager"];

const ACTION_ROLES = {
  registerTag: SUPERVISOR_ROLES,
  assignDriver: DISPATCH_ROLES,
  assignSkipTruck: DISPATCH_ROLES,
  manualScan: SUPERVISOR_ROLES,
  manageRentedSkip: ADMIN_ROLES,
  createWaybill: DISPATCH_ROLES,
  approveWaybill: SUPERVISOR_ROLES,
  createManifest: DISPATCH_ROLES,
  createTruck: DISPATCH_ROLES,
  createDriver: DISPATCH_ROLES,
  createSkip: DISPATCH_ROLES,
  manageProjects: DISPATCH_ROLES,
  assignProject: DISPATCH_ROLES,
  manageApprovers: ADMIN_ROLES, // add/deactivate external site approvers
  viewCompliance: ADMIN_ROLES,
};

/**
 * @param {object} user   the current user from useUser() (has .role)
 * @param {string} action one of the keys in ACTION_ROLES
 * @returns {boolean}
 */
export function can(user, action) {
  const allowed = ACTION_ROLES[action];
  if (!allowed) return false;
  return allowed.includes(user?.role);
}
