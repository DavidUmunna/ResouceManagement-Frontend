import React, { useState } from 'react';

export default function InfoModal({ title, sections, onClose }) {
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();
  const filtered = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.toLowerCase().includes(q)),
    }))
    .filter((section) =>
      section.heading.toLowerCase().includes(q) || section.items.length > 0
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
              i
            </span>
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition mt-0.5"
            aria-label="Close instructions"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search instructions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search instructions"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Results */}
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No results for "{query}"</p>
          ) : (
            filtered.map((section) => (
              <div key={section.heading}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  {section.heading}
                </p>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
