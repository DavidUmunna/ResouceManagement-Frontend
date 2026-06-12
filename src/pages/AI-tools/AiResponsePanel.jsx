import React from 'react';

function toTitleCase(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

const RISK_STYLES = {
  High:   'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:    'bg-green-100 text-green-700 border-green-200',
};

function RiskBadge({ value }) {
  const style = RISK_STYLES[value] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${style}`}>
      {value}
    </span>
  );
}

function renderItem(item) {
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return String(item);
  if (typeof item === 'object' && item !== null) {
    return Object.entries(item)
      .map(([k, v]) => `${toTitleCase(k)}: ${v}`)
      .join(' · ');
  }
  return String(item);
}

function Section({ label, value }) {
  const isRisk = label.toLowerCase().includes('risk');
  const isArray = Array.isArray(value);
  const isEmpty = isArray ? value.length === 0 : !value;

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </h3>
      {isEmpty ? (
        <p className="text-sm text-gray-400 italic">None</p>
      ) : isRisk && typeof value === 'string' ? (
        <RiskBadge value={value} />
      ) : isArray ? (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>{renderItem(item)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{String(value)}</p>
      )}
    </div>
  );
}

export default function AiResponsePanel({ data, emptyText = 'Run the analysis to see results here.' }) {
  if (!data) return <p className="text-sm text-gray-400 italic">{emptyText}</p>;

  // Unwrap { data: { ... } } or { data: "string" } shapes
  const payload = (data && typeof data === 'object' && 'data' in data) ? data.data : data;

  if (!payload) return <p className="text-sm text-gray-400 italic">{emptyText}</p>;

  // Plain string — render as paragraphs
  if (typeof payload === 'string') {
    return (
      <div className="space-y-3">
        {payload.split('\n').filter(Boolean).map((line, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
        ))}
      </div>
    );
  }

  // Structured object — render each key as a report section
  const entries = Object.entries(payload);
  if (!entries.length) return <p className="text-sm text-gray-400 italic">{emptyText}</p>;

  return (
    <div className="space-y-5 divide-y divide-gray-100">
      {entries.map(([key, value], i) => (
        <div key={key} className={i > 0 ? 'pt-5' : ''}>
          <Section label={toTitleCase(key)} value={value} />
        </div>
      ))}
    </div>
  );
}
