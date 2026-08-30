// Skip pricing helpers (legacy skips-management page + Excel export).
// Mirrors the backend revenue rule: revenue = billable days × effective rate,
// where billable days = mobilized → demobilized (or → now if still on site),
// and the effective rate is the per-skip override if set, else the project rate.

const DAY = 24 * 60 * 60 * 1000;

export function billableDays(item, now = Date.now()) {
  if (!item?.DateMobilized) return 0;
  const mob = new Date(item.DateMobilized).getTime();
  const demob = item.DemobilizationOfFilledSkips ? new Date(item.DemobilizationOfFilledSkips).getTime() : now;
  return demob > mob ? Math.ceil((demob - mob) / DAY) : 0;
}

export function effectiveRate(item) {
  if (item?.dailyRateUsdOverride != null && item.dailyRateUsdOverride !== "") return Number(item.dailyRateUsdOverride);
  return Number(item?.projectId?.dailyRateUsd || 0);
}

export function skipRevenue(item, now = Date.now()) {
  return billableDays(item, now) * effectiveRate(item);
}

export function projectLabel(item) {
  const p = item?.projectId;
  if (!p) return "";
  return p.code || p.name || "";
}

export const usd = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
