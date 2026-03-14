"use client"

import { useState } from "react"
import { Download, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"
export default function ExportMemoModal({ 
  isOpen, 
  onClose,
  requestId,
  requestTitle
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  
 const handleExport = async () => {
  setIsLoading(true);
   const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const API_URL = `${process.env.REACT_APP_API_URL}/api`;
    const response = await axios.post(
      `${API_URL}/orders/memo`,
      { requestId },
      {
        withCredentials: true,
        responseType: 'blob',
        signal: controller.signal, // Crucial for binary responses
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    clearTimeout(timeoutId); 

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `Purchase-Memo-${requestTitle.replace(/\s+/g, '-')}.docx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    setToast({
      show:true,
      type:"success",
      message:"your file was exported successfully"
    })
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);

  } catch (error) {
    //console.error('Export failed:', error);
     if (error.name === 'AbortError' || axios.isCancel(error)) {
      setToast({
        show: true,
        type: 'error',
        message: 'Request timed out after 15 seconds'
      });
    } else {
    setToast({
      show: true,
      type: 'error',
      message: error.response?.data?.message || 
              'Failed to download memo. Please try again.'
    })}
  } finally {
    setIsLoading(false);
  }
  };
  if(toast){
    setTimeout(()=>setToast({show:false}),3000)
  }
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Purchase Memo</h3>
                <p className="text-sm text-gray-500">Generate Word document for: {requestTitle}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Document Contents</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 mt-2 rounded-full bg-gray-400" />
                  <span>Internal memo header with company branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 mt-2 rounded-full bg-gray-400" />
                  <span>Recipient and sender information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 mt-2 rounded-full bg-gray-400" />
                  <span>Purchase request details and justification</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 mt-2 rounded-full bg-gray-400" />
                  <span>Itemized product list with quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 mt-2 rounded-full bg-gray-400" />
                  <span>Approval status and authorization</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-blue-700">
                  <p>The document will be generated in Microsoft Word format (.docx) with proper formatting.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleExport}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast?.show && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${
              toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className={`font-medium ${
                toast.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {toast.type === 'success' ? 'Export successful' : 'Export failed'}
              </p>
              <p className={`text-sm ${
                toast.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
