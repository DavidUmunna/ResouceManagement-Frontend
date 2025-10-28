// components/OTPModal.jsx
import { useState } from "react";

export default function ReviewVerification({ onClose, onSubmit, order,statusOption,orderId}) {
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  const handleSubmit = async (orderId,statusOption) => {
   
    
    setError("");
    setLoading(true);

    try {

      await onSubmit(orderId,statusOption);
     
      onClose();
    } catch (err) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={onClose} // closes modal when clicking the background
>
  <div
    className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6"
    onClick={(e) => e.stopPropagation()}
     
  >
    <h2 className="text-xl font-bold text-gray-800 mb-4">Review Option Verification</h2>
    <p className="text-gray-500 text-sm mb-4">
       Confirm Review Action <strong>({statusOption})</strong> for : <strong>{order.Title}</strong>
    </p>
    
   
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-2 mt-4">
        <button
          
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={()=>handleSubmit(orderId,statusOption)}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
   
  </div>
</div>

  );
}
