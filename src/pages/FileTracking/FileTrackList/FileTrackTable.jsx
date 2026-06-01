import React from 'react';
import { FiTrash2, FiEdit2,FiDownload } from 'react-icons/fi';
import {FaFile} from "react-icons/fa"
const FileTrackTable=({requestSort,filteredItem,setupEdit,DeleteItem,formatStatus, setLoading,Loading})=>{
    return(
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className='bg-gray-50'>
                        <tr>
                           <th className="w-1/12 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                           <th
                           onClick={()=>requestSort('FileName')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >FileName</th>
                           <th
                           onClick={()=>requestSort('status')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            status
                           </th>
                           <th
                           onClick={()=>requestSort('Issuer')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            Issuer
                           </th>
                           <th
                           onClick={()=>requestSort('ExpiresAt')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            Expiration Date
                           </th>
                           <th
                           onClick={()=>requestSort('IssuedTo')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            Issued To
                           </th>
                           <th
                           onClick={()=>requestSort('fileUrl')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            file Download
                           </th>
                           <th
                           onClick={()=>requestSort('IssueDate')}
                           className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >
                            Issue Date
                           </th>
                           
                           <th
                            onClick={() => requestSort('lastUpdated')}
                            className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                           >Last Updated</th>
                        </tr>

                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItem?.length===0?(
                            <tr>
                                <td colSpan="12" className="px-4 py-4 text-center text-gray-500">No File Track Found</td>
                            </tr>
                        ):(
                            filteredItem?.map((item)=>(
                                <React.Fragment key={item._id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                          <div className="flex items-center justify-end gap-2">
                                            {Loading.selectedTrackId === item._id && Loading.status === true && (
                                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500" />
                                            )}
                                            <button onClick={() => setupEdit(item)} className="text-blue-600 hover:text-blue-900">
                                              <FiEdit2 />
                                            </button>
                                            <button
                                              onClick={() => {
                                                DeleteItem(item._id);
                                              }}
                                              className="text-red-600 hover:text-red-900"
                                            >
                                              <FiTrash2 />
                                            </button>
                                          </div>
                                        </td>
                                       <td className="px-4 py-4 whitespace-nowrap">
                                         <div className="flex items-center">
                                           
                                           <div className="ml-2 text-sm font-medium text-gray-900">{item.FileName}</div>
                                         </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap "> 
                         <span
                            className={`
                              px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${item.status === "Expired" ? "text-red-800 bg-red-100" : "text-blue-800 bg-blue-100"}
                            `}
                          >
                          
                                             {formatStatus(item.status)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.Issuer}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.ExpiresAt?.split('T')[0]}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.IssuedTo}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item?.fileUrl ? (<a href={item.fileUrl} title={item.FileName}><FiDownload className='text-center cursor-pointer'/>
                                            </a>):<FaFile className='text-center'/>}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.IssueDate?.split('T')[0]}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {item.updatedAt?.split('T')[0]}
                                        </td>
                                                 

                                    </tr>

                                </React.Fragment>
                            ))

                        )}

                    </tbody>

                </table>

            </div>

          </div>
        </>
    )
}

export default FileTrackTable;
