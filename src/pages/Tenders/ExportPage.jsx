import React, { useState } from "react";
import { exportTender } from "../../services/tenderService";

const formats = ["pdf", "docx", "zip"];

const ExportPage = ({ tenderId }) => {
  const [loadingFormat, setLoadingFormat] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("A submission-ready preview will appear here once generated.");

  const handleExport = async (format) => {
    try {
      setLoadingFormat(format);
      setError("");
      const res = await exportTender(tenderId || "current", format);
      setPreview(res?.preview || res?.data || `Exported as ${format.toUpperCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Export failed.");
    } finally {
      setLoadingFormat("");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Finalize</p>
          <h2 className="text-lg font-semibold text-gray-800">Export & Finalization</h2>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={!!loadingFormat}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingFormat === format ? "Exporting..." : `Export ${format.toUpperCase()}`}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap break-words">
        {preview}
      </div>
    </div>
  );
};

export default ExportPage;
