import React, { useState } from "react";
import { optimizeLogistics } from "../../services/aiService";
import { toast } from "react-hot-toast";
import AiResponsePanel from "./AiResponsePanel";

const OptimizeLogisticsForm = () => {
  const [formData, setFormData] = useState({
    vehicles: "",
    volumes: "",
    locations: "",
    timeWindows: "",
    capacity: "",
    traffic: "",
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
      // Map form fields to what the backend controller expects
      const locationList = formData.locations.split(',').map(l => l.trim()).filter(Boolean);
      const payload = {
        origins:      [locationList[0] ?? 'Depot'],
        destinations: locationList.slice(1).length ? locationList.slice(1) : locationList,
        vehicles:     formData.vehicles,
        constraints: [
          formData.capacity    && `Capacity per vehicle: ${formData.capacity}`,
          formData.timeWindows && `Time windows: ${formData.timeWindows}`,
          formData.traffic     && `Traffic/constraints: ${formData.traffic}`,
        ].filter(Boolean).join('; '),
        notes: formData.volumes ? `Volumes: ${formData.volumes}` : undefined,
      };
      const response = await optimizeLogistics(payload);
      setResult(response);
      toast.success("AI analysis complete");
    } catch (err) {
      const message = err.message || "Failed to optimize logistics.";
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
          <h2 className="text-lg font-semibold text-gray-800">Optimize Logistics</h2>
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
            label="Vehicles (JSON or comma list)"
            name="vehicles"
            value={formData.vehicles}
            onChange={handleChange}
            textarea
            placeholder='e.g., ["Truck1","Van2"]'
            required
          />
          <Input
            label="Volumes (JSON or comma list)"
            name="volumes"
            value={formData.volumes}
            onChange={handleChange}
            placeholder="e.g., 10, 5, 8"
            required
          />
          <Input
            label="Locations (JSON or comma list)"
            name="locations"
            value={formData.locations}
            onChange={handleChange}
            placeholder='e.g., ["Warehouse","Site A","Site B"]'
            required
          />
          <Input
            label="Time Windows"
            name="timeWindows"
            value={formData.timeWindows}
            onChange={handleChange}
            placeholder='e.g., ["08:00-10:00","10:00-14:00"]'
          />
          <Input
            label="Capacity per Vehicle"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g., 20"
            required
          />
          <Input
            label="Traffic / Constraints"
            name="traffic"
            value={formData.traffic}
            onChange={handleChange}
            placeholder="e.g., Peak 7-9am downtown"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Optimizing..." : "Optimize"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setFormData({
                vehicles: "",
                volumes: "",
                locations: "",
                timeWindows: "",
                capacity: "",
                traffic: "",
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
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Optimization Results</h3>
        <AiResponsePanel data={result} emptyText="Submit logistics data to see optimization." />
      </div>
    </div>
  );
};

const Input = ({ label, textarea = false, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {textarea ? (
      <textarea
        {...props}
        rows="3"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    ) : (
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    )}
  </div>
);

export default OptimizeLogisticsForm;
