// components/BillingToggle.js
import React from 'react';

export const BillingToggle = ({ cycles, selectedCycle, onCycleChange }) => {
  return (
    <div className="flex justify-center space-x-4 mb-12">
      {cycles.map(cycle => (
        <button
          key={cycle.type}
          onClick={() => onCycleChange(cycle.type)}
          className={`
            relative px-8 py-3 rounded-lg font-semibold transition-all duration-300 border-2
            ${selectedCycle === cycle.type
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }
          `}
        >
          {cycle.type.charAt(0).toUpperCase() + cycle.type.slice(1)}
          {cycle.discount && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save {cycle.discount}%
            </span>
          )}
        </button>
      ))}
    </div>
  );
};