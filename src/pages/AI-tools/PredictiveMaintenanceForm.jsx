import React, { useState } from "react";
import { predictMaintenance } from "../../services/aiService";
import { toast } from "react-hot-toast";
import AiResponsePanel from "./AiResponsePanel";

const PredictiveMaintenanceForm = () => {
  const [formData, setFormData] = useState({
    equipmentType: "",
    runtime: "",
    vibration: "",
    temperature: "",
    lastService: "",
    flow: "",
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
      const response = await predictMaintenance(formData);
      setResult(response);
      toast.success("AI analysis complete");
    } catch (err) {
      const message = err.message || "Failed to get prediction.";
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
          <h2 className="text-lg font-semibold text-gray-800">Predictive Maintenance</h2>
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
            label="Equipment Type"
            name="equipmentType"
            value={formData.equipmentType}
            onChange={handleChange}
            placeholder="e.g., Pump, Conveyor"
            required
          />
          <Input
            label="Runtime (hours)"
            name="runtime"
            value={formData.runtime}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 1200"
            required
          />
          <Input
            label="Vibration (mm/s)"
            name="vibration"
            value={formData.vibration}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 3.5"
            required
          />
          <Input
            label="Temperature (°C)"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            type="number"
            step="0.1"
            placeholder="e.g., 75"
            required
          />
          <Input
            label="Last Service Date"
            name="lastService"
            value={formData.lastService}
            onChange={handleChange}
            type="date"
            required
          />
          <Input
            label="Flow Rate"
            name="flow"
            value={formData.flow}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="e.g., 45.2"
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
            placeholder="Add context such as anomalies, location, or recent changes."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Predicting..." : "Run Prediction"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setFormData({
                equipmentType: "",
                runtime: "",
                vibration: "",
                temperature: "",
                lastService: "",
                flow: "",
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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Results</h3>
        <AiResponsePanel data={result} emptyText="Run a prediction to see results here." />
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

export default PredictiveMaintenanceForm;
