import { Files } from 'lucide-react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FiSave, FiX } from 'react-icons/fi';
import { FileText } from 'lucide-react';


const AddTrack=({handleSubmit,handleUpdate, editingItem,setEditingItem,formData,handleInputChange,setShowForm
  ,setFormData,handleDateChange,fileFormData,updateLoading
})=>{
  const [files,setFiles]=useState([])
 
  
  const handleFileChange = (event) => {
    const uploadedFiles = event.target.files ? Array.from(event.target.files) : [];
    setFiles(uploadedFiles);
    
  };
  files.forEach((file)=>{
    fileFormData.append("file",file)
  })

  console.log("current file",fileFormData)
  return(
        <>
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
               <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-bold">
                    {editingItem ? 'Edit Track' : 'Add New Track '}
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

             <form onSubmit={editingItem? handleUpdate:handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">FileName*</label>
                        <input
                        type="text"
                        name="FileName"
                        value={formData.FileName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                      name='status'
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value={"Active"}>Active</option>
                        <option value={"Expiring"}>Expiring</option>
                        <option value={"Expired"}>Expired</option>

                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                        <input
                          type='text'
                          name="Issuer"
                          value={formData?.Issuer}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                        <input
                          type='text'
                          name="IssuedTo"
                          value={formData?.IssuedTo}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                        <DatePicker
                          selected={formData.ExpiresAt}
                          onChange={(date)=>handleDateChange('ExpiresAt',date)}
                          placeholderText="Select expiration date"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          calendarClassName="rounded-lg shadow-lg"
                          dateFormat="yyyy-MM-dd"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                        <DatePicker
                          selected={formData.IssueDate}
                          onChange={(date)=>handleDateChange('IssueDate',date)}
                          placeholderText="Select issue date"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          calendarClassName="rounded-lg shadow-lg"
                          dateFormat="yyyy-MM-dd"
                        />
                      </div>
                    </div>
                     <div className="flex flex-col items-center justify-center w-full">
                      <label className="w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition p-4">
                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                        {files.length === 0 ? (
                          <div className="flex flex-col items-center text-gray-500">
                            <FileText size={40} />
                            <p className="text-sm mt-2">Click or drag files here (not more than 16mb)</p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {files.map((file, index) => (
                              <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm">
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </label>
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
                      disabled={updateLoading}
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        
                      {updateLoading ? (
                        <>
                        <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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


export default AddTrack;
