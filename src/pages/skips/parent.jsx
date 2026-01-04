import React from 'react';
import SkipsManagement from './Skips_tracking';
import MovingAverageChart from './movingAverage';

const SkipsDashboard = ({ setAuth }) => {
  return (
    <div className="max-w-full mx-auto px-2 sm:px-6  py-6 mb-20">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SkipsManagement - Takes 2/3 of width on large screens, full width on mobile */}
        <div className="w-full lg:w-2/3">
          <SkipsManagement />
        </div>
        
        {/* MovingAverageChart - Takes 1/3 of width on large screens, full width on mobile */}
      <div className="hidden lg:block w-full lg:w-1/3 mt-11">
          <MovingAverageChart />
      </div>

      </div>
    </div>
  );
};

export default SkipsDashboard;