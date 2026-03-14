import React, { useState } from 'react';
import * as Sentry from "@sentry/react"
import axios from 'axios';
import { isProd } from '../../../components/env';
const CompanyDataForm = () => {
  const [formData, setFormData] = useState({
    CompanyName: '',
    OrganizationStructure: '',
    ResourcesToStreamline: [{ ResourceName: '' }],
    Workflow: ''
  });
  const [loading,setloading]=useState(false)
  const [toast, setToast] = useState({ show: false, message: '' });
  const [error, setError]=useState({show:false,message:''})
  const structureOptions = [
    "Hierarchical Structure",
    "Flat Structure",
    "Matrix Structure",
    "Divisional Structure",
    "Team-based Structure",
    "Network Structure",
    "Process-based"
  ];
  const Resetform=()=>{
    setFormData({
    CompanyName: '',
    OrganizationStructure: '',
    ResourcesToStreamline: [{ ResourceName: '' }],
    Workflow: ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  if (loading) {
    return   <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
  }
  const handleResourceChange = (index, e) => {
    const newResources = [...formData.ResourcesToStreamline];
    newResources[index].ResourceName = e.target.value;
    setFormData(prev => ({
      ...prev,
      ResourcesToStreamline: newResources
    }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      ResourcesToStreamline: [...prev.ResourcesToStreamline, { ResourceName: '' }]
    }));
  };

  const removeResource = (index) => {
    const newResources = formData.ResourcesToStreamline.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      ResourcesToStreamline: newResources
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try{
        setloading(true)
        const API=process.env.REACT_APP_API_URL
        const response=await axios.post(`${API}/api/companydata/CreateCompanyData`,{CompanyName:formData.CompanyName,
            OrganizationStructure:formData.OrganizationStructure,
        ResourcesToStreamline:formData.ResourcesToStreamline,
        Workflow:formData.Workflow},{withCredentials:true})
        if (response.data.success){
            setToast({ show: true, message: 'Entry saved Successfully' });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            Resetform();

        }
        
        
    }catch(err){
        setError({ show: true, message: `An Error occured with your Entry: ${err}` });
        setTimeout(() => setError({ show: false, message: '' }), 3000);
        console.error(err)
        if (isProd)Sentry.captureException(err)
    }finally{
        setloading(false)
    }

  };

  return (
    <div className="max-w-2xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Data Form</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CompanyName">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="CompanyName"
            name="CompanyName"
            value={formData.CompanyName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Organization Structure */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="OrganizationStructure">
            Organization Structure
          </label>
          <select
            id="OrganizationStructure"
            name="OrganizationStructure"
            value={formData.OrganizationStructure}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a structure</option>
            {structureOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Resources to Streamline */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Resources to Streamline
          </label>
          {formData.ResourcesToStreamline.map((resource, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={resource.ResourceName}
                onChange={(e) => handleResourceChange(index, e)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Resource name"
              />
              {formData.ResourcesToStreamline.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addResource}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Resource
          </button>
        </div>

        {/* WorkFlow */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Workflow">
            Work Flow <span className="text-red-500">*</span>
          </label>
          <textarea
            id="Workflow"
            name="Workflow"
            value={formData.Workflow}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Submit
          </button>
        </div>
      </form>
      {toast.show && (
            <div className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg">
              {toast.message}
            </div>
          )}

      {error.show && (
            <div className="fixed top-20 right-4 p-4 bg-red-500 text-white rounded-lg shadow-lg">
              {error.message}
            </div>
          )}
    </div>
  );
};

export default CompanyDataForm;