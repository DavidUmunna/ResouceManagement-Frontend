import React from "react"
import {  X, CheckCircle, AlertCircle } from "lucide-react"


const SkipsToast=({setToast,toast})=>{
    
    

    
    if(toast){
        return (
            <>
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
                {toast.type === 'success' ? 'Update successful' : 'Update failed'}
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

    )}

}

export default SkipsToast