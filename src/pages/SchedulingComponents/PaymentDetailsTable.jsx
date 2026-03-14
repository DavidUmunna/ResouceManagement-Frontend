import React,{useState} from "react"
import {FiX, FiSave,FiEdit2,FiTrash2} from "react-icons/fi"
import * as Sentry from "@sentry/react"
import axios from "axios";
import { toast } from "react-toastify";

const PaymentDetailsTable=({FormData,setFormData,initialData,PaymentItem,setPaymentItem})=>{
    const [editingItem, setEditingItem] = useState(null);
    const [ShowForm,setShowForm]=useState(false)
    const resetForm=()=>{
        setFormData({
            Beneficiary:'',
            AccountNumber:0,
            Bank:''
        })
    }
    const setupEdit=(item)=>{
        setEditingItem(item);
        setFormData({
            Beneficiary:item.Beneficiary||'',
            AccountNumber:item.AccountNumber || 0,
            Bank:item.Bank||''
        })
        setShowForm(true)
    }
    const handleSubmit=async (e)=>{
        e.preventDefault();
        try{
            const API_URL=`${process.env.REACT_APP_API_URL}/api`
            const res=await axios.post(`${API_URL}/paymentdetails/create`,{
                scheduleId:initialData._id,
                Beneficiary:FormData.Beneficiary,
                AccountNumber:FormData.AccountNumber,
                Bank:FormData.Bank
            },{withCredentials:true})
            setPaymentItem([...PaymentItem,res.data.data])
            resetForm()
            setShowForm(false)
            if(res.data.success===true){
                toast.success(res.data.message)
            }


        }catch(error){
            if(error.response){
                toast.error(error.response.data.message)
            }
            Sentry.captureException(error)


        }

    }

    const handleUpdate=async(e)=>{
        e.preventDefault();
        try{
            const API_URL=`${process.env.REACT_APP_API_URL}/api`
            const res=await axios.put(`${API_URL}/paymentdetails/${editingItem._id}`,FormData,
                {withCredentials:true}
            );
            setPaymentItem(PaymentItem.map(item=>
                item._id===editingItem._id?res.data.data:item
            ));
            resetForm();
            setEditingItem(null);
            setShowForm(false);

        }catch(error){
            if(error.response){
                toast.error(error.response.data.message)
            }
            Sentry.captureException(error)

        }

    }
     const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...FormData,
      [name]: value
    });
    };
    const deleteItem = async (id) => {
        try {
          const API_URL = `${process.env.REACT_APP_API_URL}/api`
    
          await axios.delete(`${API_URL}/paymentdetails/${id}`, {
    
          });
          setPaymentItem(PaymentItem.filter(item => item._id !== id));
        } catch (error) {
            if(error.response){
                toast.error(error.response.data.message)
            }
            Sentry.captureException(error)
        }
      };


   return(
    <>
       <div
       
        className='mb-10'>
        <div className="flex justify-between bg-gray-50 p-4 border-b">
          <h3 className="font-medium">Payment Details</h3>
          <button
          onClick={()=>{
            setEditingItem(null)
            resetForm()
            setShowForm(true)
          }}
          className='bg-blue-600 p-2 m-1 text-white rounded-lg'
          >Add Detail</button>
        </div>
        {ShowForm&&(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">

            <div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 animate-scaleIn"
            >
               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 animate-scaleIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {editingItem ? 'Edit Payment Detail' : 'Add New Payment Detail'}
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
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benficiary *</label>
                  <input
                    type="text"
                    name="Beneficiary"
                    value={FormData.Beneficiary}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number*</label>
                  <input
                    type="number"
                    name="AccountNumber"
                    value={FormData.AccountNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank*</label>
                  <input
                    type="text"
                    name="Bank"
                    value={FormData.Bank}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
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
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FiSave className="mr-2" />
                      {editingItem ? 'Update Item' : 'Save Item'}
                    </button>
                    </div>

                </form>
                 
               </div>

            </div>
            </div>
        )}
        <div className='flex justify-center border-2 rounded-md'>
          <table className='min-w-full divide-y divide-gray-200 border-2 rounded-md'>

          <thead className='bg-gray-50'>
            <tr className="px-6 py-4 ">
              <th className="border px-4 py-2 text-left"><strong>Beneficiary Name</strong></th>
              <th className="border px-4 py-2 text-center"><strong>Account Number</strong></th>
              <th className="border px-4 py-2 text-center"><strong>Bank Name</strong></th>
              <th className="border px-4 py-2 text-center"><strong>Date Created</strong></th>
              <th className="border px-4 py-2 text-right"><strong>Actions</strong></th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200 '>
            {PaymentItem.length===0?(
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                    No Details Found
                </td>
              </tr>
            ):(
              PaymentItem.map((item)=>(
                <tr
                key={item._id}
                 className="px-6 py-4 ">
                    <td className="border px-4 py-2 text-center">
                        <span >{item?.Beneficiary}</span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                        <span >{item?.AccountNumber}</span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                        <span >{item?.Bank}</span>
                    </td>
                    <td className="border px-4 py-2 text-center">{item.createdAt?.split("T")[0]}</td>
                    <td className="border px-4 py-2 text-right">
                          <button onClick={() => setupEdit(item)}>
                            <FiEdit2 className="edit-icon" />
                          </button>
                          <button onClick={() => deleteItem(item._id)}>
                            <FiTrash2 className="delete-icon" />
                          </button>
                    </td>

                </tr>
              ))
            )

            }

          </tbody>
          </table>
        </div>

      </div>
    
    </>
   )

    
}

export default PaymentDetailsTable;