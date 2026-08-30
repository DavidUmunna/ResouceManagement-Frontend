import React from 'react';
import SkipsManagement from './Skips_tracking';

const SkipsDashboard = ({ setAuth }) => {
  return (
    <div className="max-w-full mx-auto px-2 sm:px-6 py-6 mb-20">
      {/* Register / search / edit / export. Analytics live on the Skip Insights page. */}
      <SkipsManagement />
    </div>
  );
};

export default SkipsDashboard;
