import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Color mapping for each condition
const CONDITION_COLORS = {
  New: '#16a34a',      // Green
  Used: '#2563eb',     // Blue
  Refurbished: '#FFC107', // Amber
  Damaged: '#F44336'    // Red
};

const InventoryConditionChart = ({ AssetItems }) => {
  const [displayMode, setDisplayMode] = useState('quantity');
  const [activeIndex, setActiveIndex] = useState(null);

  // Process data - group by condition
  const conditionData = AssetItems.reduce((acc, item) => {
    if (!acc[item.condition]) {
      acc[item.condition] = {
        condition: item.condition,
        itemCount: 0,
        totalQuantity: 0,
        totalValue: 0
      };
    }
    acc[item.condition].itemCount += 1;
    acc[item.condition].totalQuantity += item.quantity;
    acc[item.condition].totalValue += item.value * item.quantity;
    return acc;
  }, {});

  const chartData = Object.values(conditionData);

  const handleBarClick = (entry, index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-0">
      <div className="flex justify-between items-center mb-0">
        <h3 className="text-lg font-semibold">Assets by Condition</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setDisplayMode('quantity')}
            className={`px-3 py-1 text-sm rounded ${displayMode === 'quantity' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Quantity
          </button>
          <button
            onClick={() => setDisplayMode('value')}
            className={`px-3 py-1 text-sm rounded ${displayMode === 'value' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Value
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="condition" 
              type="category" 
              width={80}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'totalValue' ? `₦${value}` : value,
                name === 'totalValue' ? 'Total Value' : 'Total Quantity'
              ]}
              labelFormatter={(label) => `Condition: ${label}`}
            />
            <Legend />
            <Bar
              dataKey={displayMode === 'value' ? 'totalValue' : 'totalQuantity'}
              name={displayMode === 'value' ? 'Total Value (₦)' : 'Total Quantity'}
              onClick={handleBarClick}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CONDITION_COLORS[entry.condition]} 
                  stroke="#fff"
                  strokeWidth={activeIndex === index ? 2 : 0}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Object.keys(CONDITION_COLORS).map(condition => (
          <div key={condition} className="flex items-center">
            <div 
              className="w-4 h-4 mr-1 rounded-full"
              style={{ backgroundColor: CONDITION_COLORS[condition] }}
            ></div>
            <span className="text-sm">{condition}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryConditionChart;