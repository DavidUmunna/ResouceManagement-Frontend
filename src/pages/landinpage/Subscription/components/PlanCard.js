// components/PlanCard.js
import React from 'react';

export const PlanCard = ({ plan, isSelected, onSelect }) => {
  const handleSelect = () => {
    onSelect(plan.id);
  };

  return (
    <div className={`
      relative p-8 rounded-2xl border-2 transition-all duration-300
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-xl' 
        : 'border-gray-200 bg-white hover:border-blue-300'
      }
      ${plan.popular ? 'border-green-500' : ''}
    `}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
          Most Popular
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {plan.name}
      </h3>
      
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-gray-900">
          ${plan.price}
        </span>
        {plan.originalPrice && (
          <span className="text-lg text-gray-500 line-through ml-2">
            ${plan.originalPrice}
          </span>
        )}
        <div className="text-sm text-gray-600 mt-1">
          {plan.originalPrice ? 'per year' : 'per month'}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button 
        onClick={handleSelect}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300
          ${isSelected
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
          }
        `}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
};