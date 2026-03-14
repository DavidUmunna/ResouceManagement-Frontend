import DatePicker from 'react-datepicker';
import { FiSave, FiX } from 'react-icons/fi';
const AddSkip=({setShowForm,
    handleSubmit,
    handleUpdate,
    editingItem,
    setEditingItem,
    formData,handleInputChange,categories,handleDateChange,setFormData,IsLoading,formatCategory})=>{

    

    return(
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        {editingItem ? 'Edit Skip Item' : 'Add New Skip Item'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingItem(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={editingItem ? handleUpdate : handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Skip ID*</label>
                          <input
                            type="text"
                            name="skip_id"
                            value={formData.skip_id}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
        
                          <select
                            name="WasteStream"
                            value={formData.WasteStream}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">Select a category</option>
                            {(Array.isArray(categories) && categories.length) > 0 ? (
                              categories.map((category,index) => (
                                <option key={category._id || index} value={category}>
                                  {formatCategory(category)}
                                </option>
                              ))
                            ) : (
                              <option disabled>No categories available</option>
                            )}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                name="QuantityValue"
                                min="1"
                                step={"any"}
                                
                                value={formData?.Quantity?.value?? 0}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    Quantity: { ...formData.Quantity, value: e.target.value }
                                  })
                                }
                                
                                className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                              <select
                                name="QuantityUnit"
                                value={formData.Quantity.unit}
                                onChange={(e)=>{
                                  setFormData({
                                    ...formData,                            
                                    Quantity:{...formData.Quantity,unit:e.target.value}
                                  }
                                  )
                                }
                                                        
                                }
                                
                                className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Unit </option>
                                <option value="kg">kg</option>
                                <option value="liters">liters</option>
                                <option value="tonne">tonnes</option>
                                <option value="units">Units</option>
                                <option value="other">Other</option>
                                {/* Add more units as needed */}
                              </select>
                            </div>
                          </div>
        
                        
                       
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">DeliveryWaybillNo</label>
                          <input
                            type="number"
                            name="DeliveryWaybillNo"
                            value={formData.DeliveryWaybillNo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Mobilized</label>
                          <DatePicker
                            selected={formData.DateMobilized}
                            onChange={(date) => handleDateChange("DateMobilized", date)}
                            className='border-4'
                          />
                        </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Recieved On Location</label>
                          <DatePicker
                            selected={formData.DateReceivedOnLocation}
                            onChange={(date) => handleDateChange("DateReceivedOnLocation", date)}
                            className='border-4'
                          />
                        </div>
                         <div>
        
                          <label className="block text-sm font-medium text-gray-700 mb-1">SkipsTruckRegNo</label>
                          <input
                            type="text"
                            name="SkipsTruckRegNo"
                            value={formData.SkipsTruckRegNo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SkipsDriverName</label>
                          <input
                            type="text"
                            name="SkipsTruckDriver"
                            value={formData.SkipsTruckDriver}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">WasteSource*</label>
                          <input
                            type="text"
                            name="WasteSource"
                            value={formData.WasteSource}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">DispatchManifestNo</label>
                          <input
                            type="text"
                            name="DispatchManifestNo"
                            value={formData.DispatchManifestNo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">WasteTruckRegNo</label>
                          <input
                            type="text"
                            name="WasteTruckRegNo"
                            value={formData.WasteTruckRegNo}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">WasteDriverName</label>
                          <input
                            type="text"
                            name="WasteTruckDriverName"
                            value={formData.WasteTruckDriverName}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      
                        
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Demobilization Of Filled Skips</label>
                          <DatePicker
                            selected={formData.DemobilizationOfFilledSkips}
                            onChange={(date) => handleDateChange("DemobilizationOfFilledSkips", date)}
                            className='mt-5 border-4'
                            />
                        </div>
                         <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Filled</label>
                          <DatePicker
                            selected={formData.DateFilled}
                            onChange={(date) => handleDateChange("DateFilled", date)}
                            className='mt-5 border-4'
                          />
                        </div>
                        
                       
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingItem(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                        disabled={IsLoading}
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          
                        {IsLoading ? (
                          <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                              Saving...
                        </>):(<>
                        <FiSave className="mr-2" />
                          {editingItem ? 'Update Item' : 'Save Item'}
                        </>
                          )}
                      </button>
                      </div>
                      </div>
                    </form>
                   
                  </div>
                </div>
              
        </>
    )
}

export default AddSkip;
