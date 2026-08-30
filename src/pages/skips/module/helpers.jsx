import React from "react";

// ── Lifecycle stage (computed from skip fields) ──────────────────────────────
export function getSkipStage(skip) {
  if (!skip) return "unassigned";
  if (skip.manifestId) return "manifested";
  if (skip.DemobilizationOfFilledSkips) return "demobilized";
  if (skip.DateMobilized) return "mobilized";
  if (skip.assignedDeliveryTruckId || skip.assignedCollectionTruckId) return "assigned";
  return "unassigned";
}

const STAGE_COLORS = {
  unassigned: "gray",
  assigned: "blue",
  mobilized: "indigo",
  demobilized: "purple",
  manifested: "green",
};
export const stageColor = (stage) => STAGE_COLORS[stage] || "gray";

// ── Rental expiry (mirror of the backend nag lead window) ────────────────────
export function rentalExpiry(skip, leadDays = 7) {
  if (!skip || skip.ownership !== "rented" || !skip.rentalExpectedEnd) return { expiring: false, overdue: false };
  const end = new Date(skip.rentalExpectedEnd).getTime();
  const now = Date.now();
  const lead = leadDays * 24 * 60 * 60 * 1000;
  return { expiring: end - now <= lead, overdue: end < now };
}

// ── Consistent local date/time (matches ERP convention) ──────────────────────
export function fmtDate(d, withTime = true) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const opts = withTime
    ? { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    : { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleString(undefined, opts);
}

// ── Small badge ──────────────────────────────────────────────────────────────
const BADGE = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
};
export function Badge({ color = "gray", children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[color] || BADGE.gray} ${className}`}>
      {children}
    </span>
  );
}

// truck reg + driver name from a populated truck ref
export function truckLabel(truck) {
  if (!truck) return "—";
  const driver = truck.currentDriverId?.name;
  return driver ? `${truck.regNo} · ${driver}` : truck.regNo;
}
