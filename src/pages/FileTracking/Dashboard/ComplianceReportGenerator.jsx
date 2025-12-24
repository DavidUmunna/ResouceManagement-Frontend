import React, { useState } from "react";
import { generateReport } from "../../../services/aiService";
import { toast } from "react-hot-toast";

const ComplianceReportGenerator = () => {
  const [formData, setFormData] = useState({
    date: "",
    site: "",
    results: "",
    operations: "",
    incidents: "",
    regulations: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport("");
    try {
      const response = await generateReport(formData);
      // assume backend returns markdown string or an object with a markdown property
      const markdown = typeof response === "string" ? response : response?.markdown || JSON.stringify(response, null, 2);
      setReport(markdown);
      toast.success("AI analysis complete");
    } catch (err) {
      const message = err.message || "Failed to generate report.";
      setError(message);
      toast.error(`AI error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
    } catch (err) {
      setError("Failed to copy report to clipboard.");
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance_report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">AI Assistant</p>
          <h2 className="text-lg font-semibold text-gray-800">Compliance Report Generator</h2>
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500" />
        )}
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Site / Location"
            name="site"
            value={formData.site}
            onChange={handleChange}
            placeholder="e.g., Plant A"
            required
          />
        </div>

        <TextArea
          label="Results (JSON or text)"
          name="results"
          value={formData.results}
          onChange={handleChange}
          placeholder='e.g., {"cod":120,"bod":60}'
          required
        />

        <TextArea
          label="Operations Summary"
          name="operations"
          value={formData.operations}
          onChange={handleChange}
          placeholder="Summarize key operational notes."
        />

        <TextArea
          label="Incidents / Observations"
          name="incidents"
          value={formData.incidents}
          onChange={handleChange}
          placeholder="List incidents, deviations, or observations."
        />

        <TextArea
          label="Regulations / Standards"
          name="regulations"
          value={formData.regulations}
          onChange={handleChange}
          placeholder="Reference applicable limits or standards."
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setFormData({
                date: "",
                site: "",
                results: "",
                operations: "",
                incidents: "",
                regulations: "",
              });
              setReport("");
              setError("");
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Report</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!report}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-60"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!report}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-60"
            >
              Download as .txt
            </button>
          </div>
        </div>
        {report ? (
          <pre className="whitespace-pre-wrap break-words bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-800 shadow-inner">
{report}
          </pre>
        ) : (
          <p className="text-sm text-gray-500">Generate a report to see it here.</p>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <textarea
      {...props}
      rows="3"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  </div>
);

export default ComplianceReportGenerator;
