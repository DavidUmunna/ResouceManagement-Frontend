import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiActivity, FiAlertTriangle, FiClock, FiFileText } from "react-icons/fi";
import { fileTrackDashboardService } from "./services";

const DEFAULT_SUMMARY = {
  total: 0,
  active: 0,
  expired: 0,
  expiringSoon: 0,
};

const FileTrackingDashboard = ({ serviceInstance }) => {
  const service = useMemo(() => serviceInstance || fileTrackDashboardService, [serviceInstance]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentTracks, setRecentTracks] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await service.fetchRecentTracks({ limit: 25 });
      const tracks = response?.data || [];
      setRecentTracks(tracks.slice(0, 5));
      setSummary(buildSummary(tracks));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data.");
      setSummary(DEFAULT_SUMMARY);
      setRecentTracks([]);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const buildSummary = (tracks = []) => {
    const now = new Date();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    return tracks.reduce(
      (acc, track) => {
        acc.total += 1;
        const status = (track.status || "").toLowerCase();
        if (status === "expired") acc.expired += 1;
        else acc.active += 1;

        if (track.ExpiresAt) {
          const expiry = new Date(track.ExpiresAt);
          const isSoon = expiry.getTime() - now.getTime() <= weekMs && expiry.getTime() > now.getTime();
          if (isSoon) acc.expiringSoon += 1;
        }
        return acc;
      },
      { ...DEFAULT_SUMMARY, total: 0 }
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const [datePart] = value.split("T");
    return datePart;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Dashboard</p>
          <h2 className="text-lg font-semibold text-gray-800">File Tracking Overview</h2>
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500" aria-label="Loading dashboard" />
        )}
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Total files" value={summary.total} icon={<FiFileText className="text-blue-600" />} />
        <StatCard label="Active" value={summary.active} icon={<FiActivity className="text-green-600" />} />
        <StatCard label="Expiring soon" value={summary.expiringSoon} icon={<FiClock className="text-yellow-500" />} />
        <StatCard label="Expired" value={summary.expired} icon={<FiAlertTriangle className="text-red-500" />} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Latest files</h3>
          <button
            type="button"
            onClick={loadDashboard}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        {recentTracks.length === 0 && !loading ? (
          <p className="text-sm text-gray-500">No recent file tracks found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentTracks.map((track) => (
              <li key={track._id} className="py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{track.FileName || "Untitled file"}</p>
                    <p className="text-xs text-gray-500">
                      Issuer: {track.Issuer || "—"} · Expires: {formatDate(track.ExpiresAt)}
                    </p>
                  </div>
                  <StatusPill status={track.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
    <div className="p-2 rounded-full bg-white shadow-sm">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const normalized = (status || "").toLowerCase();
  const isExpired = normalized === "expired";
  const colorClasses = isExpired ? "text-red-700 bg-red-100" : "text-green-700 bg-green-100";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
      {status || "Active"}
    </span>
  );
};

export default FileTrackingDashboard;
