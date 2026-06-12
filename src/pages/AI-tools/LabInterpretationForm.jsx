import React, { useState } from "react";
import { interpretLabResults } from "../../services/aiService";
import { toast } from "react-hot-toast";
import AiResponsePanel from "./AiResponsePanel";

const LabInterpretationForm = () => {
  const [formData, setFormData] = useState({
    sampleType: "",
    cod: "",
    bod: "",
    tss: "",
    metals: "",
    ph: "",
    limitSource: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await interpretLabResults(formData);
      setResult(response);
      toast.success("AI analysis complete");
    } catch (err) {
      const message = err.message || "Failed to interpret lab results.";
      setError(message);
      toast.error(`AI error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">AI Assistant</p>
          <h2 className="text-lg font-semibold text-gray-800">Lab Interpretation</h2>
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
            label="Sample Type"
            name="sampleType"
            value={formData.sampleType}
            onChange={handleChange}
            placeholder="e.g., Effluent, Sludge"
            required
          />
          <Input
            label="COD (mg/L)"
            name="cod"
            value={formData.cod}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 150"
            required
          />
          <Input
            label="BOD (mg/L)"
            name="bod"
            value={formData.bod}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 80"
            required
          />
          <Input
            label="TSS (mg/L)"
            name="tss"
            value={formData.tss}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 60"
            required
          />
          <Input
            label="Metals (mg/L)"
            name="metals"
            value={formData.metals}
            onChange={handleChange}
            type="text"
            placeholder="e.g., Pb:0.05, Hg:0.01"
          />
          <Input
            label="pH"
            name="ph"
            value={formData.ph}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 7.2"
            required
          />
          <Input
            label="Limit Source"
            name="limitSource"
            value={formData.limitSource}
            onChange={handleChange}
            type="text"
            placeholder="e.g., WHO, EPA, Local"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Add context such as sampling location, time, or anomalies."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Interpret Results"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setFormData({
                sampleType: "",
                cod: "",
                bod: "",
                tss: "",
                metals: "",
                ph: "",
                limitSource: "",
                notes: "",
              });
              setResult(null);
              setError("");
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Interpretation</h3>
        <AiResponsePanel data={result} emptyText="Submit lab values to see AI interpretation." />
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

export default LabInterpretationForm;
