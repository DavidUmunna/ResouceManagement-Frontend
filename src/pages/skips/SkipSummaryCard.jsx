import React from "react";

const SkipSummaryCard=({stats})=>{
    return (
        <>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.totalItems || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Quantity(tonnes)</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.totalQuantity || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Categories</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.totalCategories || 0}</p>
          </div>
          
          
        </div>
        </>
    )
}

export default SkipSummaryCard
