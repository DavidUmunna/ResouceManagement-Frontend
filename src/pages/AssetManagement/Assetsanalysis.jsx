import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const InventoryAnalytics = ({ AssetItems }) => {
  // Extract unique categories and calculate counts/quantities
  const categories = [...new Set(AssetItems.map(item => item.category))];
  
  const categoryData = categories.map(category => ({
    name: category,
    itemCount: AssetItems.filter(item => item.category === category).length,
    totalQuantity: AssetItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.quantity, 0)
  }));

  // Color palette for the chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const LABEL_FONT_SIZE = 10;
  const LABEL_SHIFT_X = -40;

  return (
    <div className="w-full mb-0">
      <div className="grid grid-cols-1">
        {/* Category Distribution Pie Chart */}
        <div className="bg-white w-full p-2 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Assets by Category</h3>
    
          <div className="h-64 sm:h-72 md:h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="itemCount"
                  nameKey="name"
                  label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180) + LABEL_SHIFT_X;
                    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={LABEL_FONT_SIZE}
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    `${props.payload.name} (${props.payload.totalQuantity} units)`,
                  ]}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-xs sm:text-sm text-gray-600">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>

      
     
  );
};

export default InventoryAnalytics
