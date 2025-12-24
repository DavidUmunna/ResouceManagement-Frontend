import React, { useEffect, useState } from "react";
import { fetchTenderChecklist, updateChecklistItem } from "../../services/tenderService";

const categories = ["Technical", "HSE", "Compliance"];

const RequirementChecklistPage = ({ tenderId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchTenderChecklist(tenderId || "current");
      setItems(res?.data || res?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load checklist.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenderId]);

  const toggleItem = async (id, current) => {
    try {
      setItems((prev) => prev.map((it) => (it.id === id || it._id === id ? { ...it, completed: !current } : it)));
      await updateChecklistItem(tenderId || "current", id, { completed: !current });
    } catch (err) {
      setError("Unable to update item.");
      loadChecklist();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Requirements</p>
          <h2 className="text-lg font-semibold text-gray-800">Checklist</h2>
        </div>
        <button
          onClick={loadChecklist}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-600">Loading checklist...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div key={category} className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{category}</h3>
              <ul className="space-y-2">
                {items.filter((it) => (it.category || "").toLowerCase() === category.toLowerCase()).length === 0 ? (
                  <li className="text-sm text-gray-500">No items.</li>
                ) : (
                  items
                    .filter((it) => (it.category || "").toLowerCase() === category.toLowerCase())
                    .map((item) => (
                      <li key={item._id || item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-800">{item.title || "Requirement"}</p>
                          <p className="text-xs text-gray-500">
                            {item.mandatory ? (
                              <span className="text-red-600 font-semibold">Mandatory</span>
                            ) : (
                              <span className="text-gray-500">Optional</span>
                            )}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={() => toggleItem(item._id || item.id, !!item.completed)}
                          className="h-4 w-4 text-blue-600"
                        />
                      </li>
                    ))
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequirementChecklistPage;
