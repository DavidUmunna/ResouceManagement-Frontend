import React, { useEffect, useState } from "react";
import { fetchAIDraft, saveDraft } from "../../services/tenderService";

const DraftEditorPage = ({ tenderId }) => {
  const [sections, setSections] = useState({
    technical: "",
    hse: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDraft = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchAIDraft(tenderId || "current");
      setSections({
        technical: res?.data?.technical || res?.technical || "",
        hse: res?.data?.hse || res?.hse || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load AI draft.");
      setSections({ technical: "", hse: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenderId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveDraft(tenderId || "current", sections);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Drafting</p>
          <h2 className="text-lg font-semibold text-gray-800">Draft Editor</h2>
          <p className="text-xs text-gray-500">AI-generated content is loaded and fully editable.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDraft}
            disabled={loading}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            Reload AI Draft
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-600">Loading draft...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SectionEditor
            label="Technical"
            value={sections.technical}
            onChange={(value) => setSections((prev) => ({ ...prev, technical: value }))}
          />
          <SectionEditor
            label="HSE"
            value={sections.hse}
            onChange={(value) => setSections((prev) => ({ ...prev, hse: value }))}
          />
        </div>
      )}
    </div>
  );
};

const SectionEditor = ({ label, value, onChange }) => (
  <div className="border border-gray-200 rounded-lg p-3 space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
      <span className="text-xs text-gray-500">Editable</span>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows="12"
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={`Enter ${label.toLowerCase()} content...`}
    />
  </div>
);

export default DraftEditorPage;
