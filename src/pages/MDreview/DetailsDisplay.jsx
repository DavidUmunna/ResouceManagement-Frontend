import React from "react"


const DetailsDisplay=({Schedule})=>{


    
    return(
         <div className='flex justify-center border-2 rounded-md overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 border-2 rounded-md'>
        
                  <thead className='bg-gray-50'>
                    <tr className="px-6 py-4 ">
                      <th className="border px-4 py-2 text-left"><strong>Beneficiary Name</strong></th>
                      <th className="border px-4 py-2 text-center"><strong>Account Number</strong></th>
                      <th className="border px-4 py-2 text-center"><strong>Bank Name</strong></th>
                      <th className="border px-4 py-2 text-center"><strong>Date Created</strong></th>
        
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200 '>
                    {Schedule.paymentDetails.length===0?(
                      <tr>
                        <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                            No Details Found
                        </td>
                      </tr>
                    ):(
                      Schedule.paymentDetails.map((item,index)=>(
                        <tr
                        key={`${item._id}-${index}`}
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
                           
        
                        </tr>
                      ))
                    )
        
                    }
        
                  </tbody>
                  </table>
                </div>
        
    )
}

export default DetailsDisplay;