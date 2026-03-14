import React from 'react';

const UserDetailsSkeleton = () => {
  return (
    <div className="min-h-screen mt-16 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Responsive flex container */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content - Left Side (2/3 width on lg+) */}
        <div className="w-full lg:w-2/3 lg:pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            
            {/* User Profile Card Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-64">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            {/* Metrics Cards Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Monthly Requests */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-3 h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                  <div className="mt-2 h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
                
                {/* Approval Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-3 h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                  <div className="mt-2 h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
                
                {/* Avg Processing */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-3 h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                  <div className="mt-2 h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
              
              {/* Request Details Skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
                
                {/* Status Sections */}
                {['approved', 'pending', 'completed', 'rejected', 'MoreInformation'].map((type) => (
                  <div key={type} className="mb-6 last:mb-0">
                    <div className={`w-full rounded-xl p-4 flex justify-between items-center ${
                      type === 'approved' ? 'bg-green-50' :
                      type === 'pending' ? 'bg-yellow-50' :
                      type === 'MoreInformation' ? 'bg-gray-100' :
                      type === 'completed' ? 'bg-blue-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    </div>
                    {/* Order list placeholder */}
                    <div className="mt-2 space-y-2">
                      <div className="h-10 bg-gray-100 rounded"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar (1/3 width on lg+) */}
        <div className="w-full lg:w-1/3 lg:pl-2">
          {/* Bar Chart Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-80">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          
          {/* Schedule List Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsSkeleton;