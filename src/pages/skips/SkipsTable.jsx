import React, { useState } from "react"
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { projectLabel, effectiveRate, skipRevenue, usd } from './pricing';

// Inline editable per-skip rate override. Shows the effective rate; editing it
// sets an override for this skip only (falls back to the project rate when blank).
function RateCell({ item, onSetRate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  const hasOverride = item.dailyRateUsdOverride != null && item.dailyRateUsdOverride !== "";
  const rate = effectiveRate(item);

  const save = async () => {
    setBusy(true);
    try { await onSetRate(item._id, val); setEditing(false); }
    catch (e) { /* parent surfaces errors; keep the field open */ }
    finally { setBusy(false); }
  };

  if (!onSetRate) return <span>{rate ? usd(rate) : "—"}</span>;
  if (!editing) {
    return (
      <button
        onClick={() => { setEditing(true); setVal(hasOverride ? String(item.dailyRateUsdOverride) : ""); }}
        className="inline-flex items-center gap-1 hover:underline"
        title={hasOverride ? "Per-skip override — click to edit" : "Project rate — click to override for this skip"}
      >
        {rate ? usd(rate) : <span className="text-red-500">set</span>}
        {hasOverride && <span className="text-[10px] text-blue-500">(override)</span>}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 justify-end">
      <input
        type="number" min="0" autoFocus value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="project rate"
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
      />
      <button disabled={busy} onClick={save} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-500">✕</button>
    </span>
  );
}

const SkipsTable=({requestSort,filteredItems,formatCategory,setupEdit,deleteItem,onSetRate})=>{
    return (
        <>

              {/* Skip Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden  max-h-96 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50 sticky top-0">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Rate $/day</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="20" className="px-4 py-4 text-center text-gray-500">No skip items found</td>
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {projectLabel(item) || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          <RateCell item={item} onSetRate={onSetRate} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {usd(skipRevenue(item))}
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