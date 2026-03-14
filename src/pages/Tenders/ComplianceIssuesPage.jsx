import React, { useEffect, useState } from "react";
import { fetchComplianceIssues } from "../../services/tenderService";

const severityClass = {
  high: "text-red-700 bg-red-100",
  medium: "text-amber-700 bg-amber-100",
  low: "text-green-700 bg-green-100",
};

const ComplianceIssuesPage = ({ tenderId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchComplianceIssues(tenderId || "current");
      setIssues(res?.data || res?.issues || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load compliance issues.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenderId]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Compliance</p>
          <h2 className="text-lg font-semibold text-gray-800">Compliance Issues</h2>
        </div>
        <button
          onClick={loadIssues}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Document</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-3 py-6 text-center text-gray-600">Loading issues...</td>
              </tr>
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-3 py-4 text-center text-gray-500">No issues found.</td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue._id || issue.id}>
                  <td className="px-3 py-2 text-gray-800 font-medium">{issue.document || "Document"}</td>
                  <td className="px-3 py-2 text-gray-700">{issue.status || "Missing"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityClass[issue.severity] || "bg-gray-100 text-gray-700"}`}>
                      {issue.severity || "low"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 text-xs">
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">Upload</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">Mark Resolved</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceIssuesPage;
