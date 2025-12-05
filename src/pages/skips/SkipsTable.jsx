import React from "react"
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
const SkipsTable=({requestSort,filteredItems,formatCategory,setupEdit,deleteItem})=>{
    return (
        <>

              {/* Skip Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {/* Define fixed widths for each column via w- classes */}
                  <th className="w-1/12 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">S/N</th>
                  <th className="w-1/12 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  <th
                    onClick={() => requestSort('skip_id')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Skip ID</th>
                  <th
                    onClick={() => requestSort('WasteStream')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Category</th>
                  <th
                    onClick={() => requestSort('Quantity.value')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Quantity</th>
                  <th
                    onClick={() => requestSort('DeliveryWaybillNo')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Delivery Waybill No</th>
                  <th
                    onClick={() => requestSort('DateMobilized')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Date Mobilized</th>
                  <th
                    onClick={() => requestSort('DateReceivedOnLocation')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Date Received On Location</th>
                  <th
                    onClick={() => requestSort('SkipsTruckRegNo')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Skips Truck Reg No</th>
                  <th
                    onClick={() => requestSort('SkipsTruckDriver')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Skips Truck Driver Name</th>
                  <th
                    onClick={() => requestSort('WasteSource')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Waste Source</th>
                  <th
                    onClick={() => requestSort('DispatchManifestNo')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Dispatch Manifest No</th>
                  <th
                    onClick={() => requestSort('WasteTruckRegNo')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Waste Truck Reg No</th>
                  <th
                    onClick={() => requestSort('WasteTruckDriverName')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Waste Driver Name</th>
                  
                  <th
                    onClick={() => requestSort('DemobilizationOfFilledSkips')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Demobilization</th>
                  <th
                    onClick={() => requestSort('DateFilled')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Date Filled</th>
                  <th
                    onClick={() => requestSort('lastUpdated')}
                    className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-4 py-4 text-center text-gray-500">No skip items found</td>
                  </tr>
                ) :
        
                  (
                    filteredItems.map((item,index) => (
                      <React.Fragment key={item._id}>
                    <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">{index}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => setupEdit(item)} className="text-blue-600 hover:text-blue-900">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => deleteItem(item._id)} className="text-red-600 hover:text-red-900">
                            <FiTrash2 />
                          </button>
                          </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            
                            <div className="ml-2 text-sm font-medium text-gray-900">{item.skip_id}</div>
                          </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {formatCategory(item.WasteStream)}
                          </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.Quantity?.value} {item.Quantity?.unit}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.DeliveryWaybillNo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.DateMobilized?.split('T')[0]}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.DateReceivedOnLocation?.split('T')[0]}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.SkipsTruckRegNo}
                        </td>
                         <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                         {item.SkipsTruckDriver}
                         </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.WasteSource}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.DispatchManifestNo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.WasteTruckRegNo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.WasteTruckDriverName}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.DemobilizationOfFilledSkips?.split('T')[0]}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.DateFilled?.split('T')[0]}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.lastUpdated?.split('T')[0]}
                        </td>
                        
                        </tr>
                        </React.Fragment>
                      )
                    
                    )
                  )}
              </tbody>
            </table>
                </div>
              </div>
        </>
    )
}

export default SkipsTable;