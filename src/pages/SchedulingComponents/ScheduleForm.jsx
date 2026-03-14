import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import PaymentDetailsTable from './PaymentDetailsTable';
import axios from 'axios';
export const ScheduleForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [filteredDetails,setFilteredDetails]=useState({
    Beneficiary:'',
    AccountNumber:0,
    Bank:''
  })

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    requests: initialData.requests || [],
    AccountsComment:initialData.AccountsComment||""
  });
  

  const [PaymentItem,setPaymentItem]=useState([])
  
  const fetchData=async()=>{
    try{
      const API_URL=`${process.env.REACT_APP_API_URL}/api`
      const response=await axios.get(`${API_URL}/paymentdetails/${initialData._id}`,{withCredentials:true})
    
      if (response){
        toast.success(response.data.message)
        setPaymentItem(response.data.data)
      }

    }catch(error){
      
      error.response? toast.error(error.response.data.message):
      toast.error("there was an error while fetching data")
    }
  }

  useEffect(()=>{
     fetchData()
  },[])
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    toast.success("Schedule Updated Successfully")
  };

  const toggleRequest = (requestId) => {
    setFormData(prev => ({
      ...prev,
      requests: prev.requests.map(req => 
        req.requestId._id === requestId 
          ? { ...req, included: !req.included } 
          : req
      )
    }));
  };

  return (
    <div>

        <PaymentDetailsTable
      FormData={filteredDetails}
      setFormData={setFilteredDetails}
      initialData={initialData}
      PaymentItem={PaymentItem}
      setPaymentItem={setPaymentItem}
       className="m-1"/>

    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Schedule Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Information For MD
        </label>
        <textarea
          type="text"
          value={formData.AccountsComment}
          onChange={(e) => {
           
           
            setFormData({...formData, AccountsComment: e.target.value})}}
          className="w-full h-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          
        />
      </div>
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-medium">Included Requests</h3>
        </div>
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {formData.requests.map(({ requestId, included }) => (
              <li key={requestId._id} className="p-4 hover:bg-gray-50">
                
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={included}
                  onChange={() => toggleRequest(requestId._id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {requestId.orderNumber} - {requestId.Title}
                  </p>
                  <div className='flex justify-between'>
                    <div>
                      <p><strong>Department:</strong>  {requestId.staff.Department}</p>
                      <p><strong>Requested By:</strong> {requestId.staff.name}</p>
                      <p><strong>Date</strong> {requestId.createdAt?.split('T')[0]}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      ₦{requestId?.products.reduce((sum,val)=>(sum=sum+val.price),0)}
                    </p>
                  </div>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>
    
   

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>

        <div className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Link
            to={"/admin/schedulemanager"}
            >
                Return To Draft
            </Link>
        </div>

      </div>
     </form>
    </div>
  );
};