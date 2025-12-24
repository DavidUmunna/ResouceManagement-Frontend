import React, { useState } from "react";
import { uploadTenderDoc } from "../../services/tenderService";

const TenderUploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadTenderDoc(formData);
      setExtracted(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed.");
      setExtracted(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Tender Intake</p>
        <h2 className="text-lg font-semibold text-gray-800">Upload & Overview</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            type="submit"
            disabled={loading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Deadlines</h3>
          {extracted?.deadlines?.length ? (
            <ul className="text-sm text-gray-700 space-y-1">
              {extracted.deadlines.map((d, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{d.label || "Deadline"}</span>
                  <span className="font-medium">{d.date || "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No deadlines extracted yet.</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Requirements</h3>
          {extracted?.requirements?.length ? (
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              {extracted.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Upload a document to see extracted requirements.</p>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Checklist Progress</h3>
        {extracted?.checklist ? (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-700">Completed: <strong>{extracted.checklist.completed || 0}</strong></span>
            <span className="text-gray-700">Total: <strong>{extracted.checklist.total || 0}</strong></span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Progress will appear after parsing.</p>
        )}
      </div>
    </div>
  );
};

export default TenderUploadPage;
